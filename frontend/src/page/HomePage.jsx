import { Link } from "react-router-dom";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { trending } from "../services/dashboardApi";

// Prevent the browser from restoring the previous scroll position on reload.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const fallbacks = [
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1400&q=90",
  "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1100&q=90",
  "https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=1100&q=90",
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1100&q=90",
  "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1100&q=90",
  "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?auto=format&fit=crop&w=1100&q=90",
];

const imageOf = (item, index) =>
  item?.images?.find((image) => image.isPrimary)?.url ||
  item?.images?.[0]?.url ||
  fallbacks[index % fallbacks.length];

const titleOf = (item, index) =>
  item?.title ||
  item?.name ||
  `Selected work No. ${String(index + 1).padStart(2, "0")}`;

const artistOf = (item) =>
  item?.artist?.name ||
  item?.artistName ||
  item?.creator?.name ||
  "ArtMind Collection";

const yearOf = (item) => item?.year || item?.createdYear || "2026";

const exhibitionNotes = [
  {
    number: "01",
    title: "Tuyển chọn",
    copy: "Một bộ sưu tập được đặt cạnh nhau không chỉ vì phong cách, mà vì cảm xúc chúng tạo ra khi cùng xuất hiện.",
  },
  {
    number: "02",
    title: "Khám phá",
    copy: "Đi qua nghệ sĩ, chất liệu và trường phái bằng một nhịp xem chậm, trực quan và giàu khoảng thở.",
  },
  {
    number: "03",
    title: "Đối thoại cùng AI",
    copy: "Mô tả điều bạn đang tìm kiếm. ArtMind giúp mở ra những liên tưởng mà từ khóa thông thường có thể bỏ lỡ.",
  },
];

const galleryLayouts = [
  "lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
];

const galleryHeights = [
  "h-[520px] md:h-[650px] lg:h-full lg:min-h-[720px]",
  "h-[380px] lg:h-[345px]",
  "h-[380px] lg:h-[345px]",
  "h-[420px]",
  "h-[420px]",
  "h-[420px]",
];


function useRevealOnScroll(refreshKey) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.requestAnimationFrame(() => {
              entry.target.classList.add("is-visible");
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    // Safety pass for elements already inside the viewport after async data/layout updates.
    const frame = window.requestAnimationFrame(() => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [refreshKey]);
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [activeArtwork, setActiveArtwork] = useState(0);
  const heroRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  // Always start Home at the top. useLayoutEffect runs before paint,
  // which avoids a visible jump from the browser's previous scroll position.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    // One extra frame covers late layout restoration in some browsers.
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useRevealOnScroll(items.length);

  useEffect(() => {
    trending()
      .then((response) => setItems(response.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveArtwork((current) => (current + 1) % 3);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  const handleHeroPointerMove = (event) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setPointer({ x, y });
  };

  const resetHeroPointer = () => setPointer({ x: 0, y: 0 });

  const works = useMemo(() => {
    const data = items.length ? items.slice(0, 6) : [];

    return Array.from({ length: 6 }, (_, index) => ({
      item: data[index],
      image: imageOf(data[index], index),
      title: titleOf(data[index], index),
      artist: artistOf(data[index]),
      year: yearOf(data[index]),
    }));
  }, [items]);

  const heroWork = works[activeArtwork % works.length];

  return (
    <main className="overflow-hidden bg-[#F7F4EF] text-[#2A2421] selection:bg-[#9B2C2C] selection:text-[#F7F4EF]">
      <style>{`
        /* Otonari-inspired scroll reveal: delayed, layered and mask-like. */
        [data-reveal] {
          --reveal-delay: 90ms;
          will-change: transform, opacity, clip-path, filter;
        }

        [data-reveal="rise"] {
          opacity: 0;
          transform: translate3d(0, 76px, 0);
          filter: blur(3px);
          transition:
            opacity 1.05s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            transform 1.65s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            filter 1.2s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
        }

        [data-reveal="soft"] {
          opacity: 0;
          transform: translate3d(0, 42px, 0);
          transition:
            opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            transform 1.45s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
        }

        /* Keep the observed element visible to IntersectionObserver.
           Only the inner media layer is clipped/animated. */
        [data-reveal="image"] {
          opacity: 1;
          transform: none;
          clip-path: none;
        }

        [data-reveal="image"] > .reveal-media {
          opacity: 0;
          clip-path: inset(100% 0 0 0);
          transform: translate3d(0, 62px, 0) scale(1.018);
          transform-origin: 50% 100%;
          will-change: transform, opacity, clip-path;
          transition:
            clip-path 1.5s cubic-bezier(0.77, 0, 0.175, 1) var(--reveal-delay),
            transform 1.75s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            opacity 0.35s ease var(--reveal-delay);
        }

        [data-reveal="image"].is-visible > .reveal-media {
          opacity: 1;
          clip-path: inset(0 0 0 0);
          transform: translate3d(0, 0, 0) scale(1);
        }

        [data-reveal="line"] {
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 1.35s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
        }

        [data-reveal].is-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
          clip-path: inset(0 0 0 0);
        }

        [data-reveal="line"].is-visible { transform: scaleX(1); }
        @keyframes artmindFloat {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-12px,0); }
        }
        @keyframes artmindDrift {
          0%, 100% { transform: translate3d(-2%, -1%, 0) scale(1); }
          50% { transform: translate3d(2%, 1.5%, 0) scale(1.04); }
        }
        @keyframes artmindMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal],
          [data-reveal="image"] > .reveal-media {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            clip-path: none !important;
            transition: none !important;
          }
          .artmind-motion { animation: none !important; transform: none !important; }
        }
      `}</style>
      {/* =====================================================
          01. HERO / EXHIBITION COVER
      ===================================================== */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroPointerMove}
        onMouseLeave={resetHeroPointer}
        className="relative min-h-[820px] overflow-hidden border-b border-[#3D332E] bg-[#1C1715] text-[#F7F4EF] lg:min-h-[900px]"
      >
        <div className="artmind-motion pointer-events-none absolute -inset-[8%] opacity-[0.18] [animation:artmindDrift_14s_ease-in-out_infinite] [background-image:radial-gradient(circle_at_20%_20%,#D4AF37_0,transparent_28%),radial-gradient(circle_at_78%_38%,#9B2C2C_0,transparent_26%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10 mx-auto grid min-h-[820px] max-w-[1600px] lg:min-h-[900px] lg:grid-cols-[0.98fr_1.02fr]">
          {/* LEFT / EDITORIAL COPY */}
          <div className="relative flex flex-col justify-between border-[#3D332E] px-6 pb-14 pt-28 md:px-12 lg:border-r lg:px-16 lg:pb-16 lg:pt-36 xl:px-24">
            <div>
              <div className="mb-12 flex items-center gap-4 text-[9px] font-semibold tracking-[0.34em] text-[#D4AF37]">
                <span className="h-px w-12 bg-[#D4AF37]" />
                ARTMIND / CURATED DIGITAL EXHIBITION
              </div>

              <div className="relative">
                <span className="absolute -left-1 -top-7 font-['Playfair_Display'] text-[11px] italic tracking-[0.22em] text-[#D4AF37]/80">
                  Exhibition MMXXVI
                </span>

                <h1
                  className="artmind-motion font-['Playfair_Display'] text-[64px] font-medium leading-[0.85] tracking-[-0.045em] transition-transform duration-700 ease-out sm:text-[82px] md:text-[104px] lg:text-[92px] xl:text-[122px]"
                  style={{ transform: `translate3d(${pointer.x * -10}px, ${pointer.y * -10}px, 0)` }}
                >
                  Art
                  <span className="text-[#D4AF37]">/</span>
                  <br />
                  Mind<span className="text-[#9B2C2C]">.</span>
                </h1>
              </div>

              <div className="mt-12 grid max-w-2xl gap-8 sm:grid-cols-[1fr_1.3fr] sm:items-start">
                <p className="font-['Playfair_Display'] text-2xl leading-tight text-[#F7F4EF] md:text-3xl">
                  Một phòng tranh cho những điều
                  <em className="font-normal text-[#D4AF37]">
                    {" "}
                    khó gọi thành tên.
                  </em>
                </p>

                <div className="border-l border-[#4A3E38] pl-6">
                  <p className="text-sm leading-7 text-[#D0C5B6]">
                    Khám phá tác phẩm theo cảm xúc, câu chuyện và trực giác —
                    rồi để trí tuệ nhân tạo mở thêm một lối nhìn khác.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      to="/gallery"
                      className="group inline-flex items-center gap-5 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528] hover:shadow-[0_10px_30px_rgba(212,175,55,0.18)]"
                    >
                      VÀO PHÒNG TRANH
                      <span className="text-base transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>

                    <Link
                      to="/search"
                      className="inline-flex items-center border border-[#5E5048] px-6 py-4 text-[9px] font-bold tracking-[0.22em] text-[#E0D7C8] transition duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37] hover:text-[#F7F4EF]"
                    >
                      KHÁM PHÁ BẰNG AI
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-14 flex items-end justify-between gap-6 border-t border-[#3D332E] pt-6">
              <div className="text-[8px] uppercase leading-5 tracking-[0.25em] text-[#A39585]">
                Curated with intelligence
                <br />
                Felt by humans
              </div>

              <div className="font-['Playfair_Display'] text-3xl italic text-[#D4AF37]/60">
                01
              </div>
            </div>
          </div>

          {/* RIGHT / FEATURED ARTWORK */}
          <div className="relative min-h-[620px] overflow-hidden bg-[#120F0E] lg:min-h-full">
            <img
              key={heroWork.image}
              src={heroWork.image}
              alt={heroWork.title}
              className="artmind-motion absolute inset-0 h-full w-full scale-[1.045] object-cover opacity-[0.88] transition-[transform,opacity,filter] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `scale(1.055) translate3d(${pointer.x * 16}px, ${pointer.y * 16}px, 0)`,
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,14,0.06),rgba(18,15,14,0.02)_55%,rgba(18,15,14,0.92)_100%)]" />
            <div className="absolute inset-5 border border-white/10 md:inset-8" />

            <div className="absolute left-6 top-8 z-10 flex items-center gap-3 text-[8px] font-semibold tracking-[0.28em] text-white/70 md:left-10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9B2C2C] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9B2C2C]" />
              </span>
              FEATURED WORK
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-10 p-7 md:p-10 lg:p-12">
              <div className="mb-7 h-px w-full bg-white/25" />

              <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.3em] text-[#D4AF37]">
                    Selected / {String(activeArtwork + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-3 max-w-xl font-['Playfair_Display'] text-3xl font-medium leading-tight text-[#F7F4EF] md:text-4xl">
                    {heroWork.title}
                  </h2>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/55">
                    {heroWork.artist} · {heroWork.year}
                  </p>
                </div>

                <div className="flex gap-2">
                  {works.slice(0, 3).map((work, index) => (
                    <button
                      key={`${work.image}-${index}`}
                      type="button"
                      onClick={() => setActiveArtwork(index)}
                      aria-label={`Xem tác phẩm ${index + 1}`}
                      className={`h-12 w-9 overflow-hidden border transition md:h-14 md:w-11 ${
                        activeArtwork === index
                          ? "border-[#D4AF37] opacity-100"
                          : "border-white/25 opacity-45 hover:opacity-80"
                      }`}
                    >
                      <img
                        src={work.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          02. EXHIBITION STRIP
      ===================================================== */}
      <section className="border-b border-[#E0D7C8] bg-[#EDE6D8]">
        <div className="mx-auto grid max-w-[1600px] divide-y divide-[#E0D7C8] md:grid-cols-3 md:divide-x md:divide-y-0">
          {exhibitionNotes.map((note) => (
            <article
              key={note.number}
              data-reveal="rise"
              className="group px-6 py-9 transition-[background-color] duration-700 hover:bg-white/30 md:px-9 lg:px-12"
              style={{ "--reveal-delay": `${90 + (Number(note.number) - 1) * 150}ms` }}
            >
              <div className="flex items-start justify-between gap-7">
                <span className="font-['Playfair_Display'] text-3xl italic text-[#9B2C2C]">
                  {note.number}
                </span>
                <span className="mt-3 h-px flex-1 bg-[#D8C29D] transition group-hover:bg-[#9B2C2C]" />
              </div>
              <h3 className="mt-7 font-['Playfair_Display'] text-2xl font-medium text-[#2A2421]">
                {note.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-[#524640]">
                {note.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          03. CURATORIAL NOTE
      ===================================================== */}
      <section className="relative bg-[#F7F4EF] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div data-reveal="rise" className="flex items-start gap-5">
            <span data-reveal="line" style={{ "--reveal-delay": "140ms" }} className="mt-2 h-px w-12 bg-[#9B2C2C]" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                I / Curatorial note
              </p>
              <p className="mt-3 text-[10px] uppercase leading-6 tracking-[0.22em] text-[#7A6C63]">
                ArtMind Digital Archive
                <br />
                Hanoi · 2026
              </p>
            </div>
          </div>

          <div data-reveal="rise" style={{ "--reveal-delay": "110ms" }}>
            <h2 className="max-w-5xl font-['Playfair_Display'] text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-[#2A2421] md:text-6xl lg:text-[68px]">
              Chúng tôi không muốn bạn xem nhiều tranh hơn.
              <span className="text-[#9B2C2C]">
                {" "}
                Chúng tôi muốn bạn nhìn lâu hơn.
              </span>
            </h2>

            <div className="mt-10 grid gap-7 border-t border-[#D8CFC0] pt-8 md:grid-cols-2">
              <p className="text-sm leading-8 text-[#524640]">
                ArtMind đặt tác phẩm vào một không gian có nhịp điệu như một
                triển lãm thật: khoảng trống đủ lớn, chữ đủ nhỏ, hình ảnh đủ
                mạnh để người xem có thời gian cảm nhận trước khi đọc lời giải
                thích.
              </p>
              <p className="text-sm leading-8 text-[#524640]">
                Công nghệ chỉ xuất hiện khi cần — để tìm kiếm, nhận diện hoặc
                gợi ý. Phần còn lại thuộc về ánh nhìn, ký ức và cách mỗi người
                tự tạo ra ý nghĩa cho tác phẩm.
              </p>
            </div>
          </div>
        </div>

        <span className="pointer-events-none absolute -right-4 bottom-[-65px] hidden font-['Playfair_Display'] text-[250px] italic leading-none text-[#2A2421]/[0.025] xl:block">
          I
        </span>
      </section>

      {/* =====================================================
          04. SELECTED WORKS / ASYMMETRIC GALLERY WALL
      ===================================================== */}
      <section className="border-y border-[#E0D7C8] bg-[#ECE4D5] px-6 py-24 md:px-12 md:py-28 lg:px-20">
        <div className="mx-auto max-w-[1500px]">
          <header data-reveal="rise" className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                  II / Selected works
                </span>
                <span className="h-px w-20 bg-[#C8BBA8]" />
              </div>
              <h2 className="mt-5 font-['Playfair_Display'] text-5xl font-medium tracking-[-0.03em] text-[#2A2421] md:text-7xl">
                The exhibition{" "}
                <em className="font-normal text-[#9B2C2C]">wall.</em>
              </h2>
            </div>

            <Link
              to="/gallery"
              className="group inline-flex items-center gap-5 self-start border-b border-[#2A2421] pb-2 text-[9px] font-bold tracking-[0.22em] text-[#2A2421] md:self-auto"
            >
              XEM TOÀN BỘ BỘ SƯU TẬP
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </header>

          <div className="grid gap-5 lg:grid-cols-12 lg:auto-rows-[345px]">
            {works.map((work, index) => (
              <article
                key={index}
                data-reveal="image"
                className={`group relative bg-[#1C1715] shadow-[0_18px_50px_rgba(42,36,33,0.08)] transition-[transform,box-shadow] duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(42,36,33,0.16)] ${galleryLayouts[index]}`}
                style={{ "--reveal-delay": `${80 + index * 110}ms` }}
              >
                <div className={`reveal-media relative overflow-hidden bg-[#1C1715] ${galleryHeights[index]}`}>
                  <img
                    src={work.image}
                    alt={work.title}
                    className="h-full w-full object-cover transition duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07] group-hover:rotate-[0.25deg]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-90 transition duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-3 border border-white/10 transition group-hover:border-white/25 md:inset-4" />

                  <div className="absolute left-6 top-6 z-10 flex items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.26em] text-white/70">
                    <span className="h-px w-6 bg-[#D4AF37]" />0{index + 1}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8">
                    <h3 className="max-w-lg font-['Playfair_Display'] text-2xl font-medium leading-tight text-[#F7F4EF] md:text-3xl">
                      {work.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/20 pt-3 text-[8px] uppercase tracking-[0.22em] text-white/55">
                      <span>{work.artist}</span>
                      <span>{work.year}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          05. THREE WAYS TO ENTER THE ARCHIVE
      ===================================================== */}
      <section className="bg-[#F7F4EF] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div data-reveal="rise">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                III / Choose your path
              </p>
              <h2 className="mt-5 font-['Playfair_Display'] text-4xl font-medium leading-tight text-[#2A2421] md:text-5xl">
                Bạn muốn bước vào nghệ thuật
                <em className="font-normal text-[#9B2C2C]"> theo cách nào?</em>
              </h2>
            </div>

            <div className="border-t border-[#D8CFC0]">
              {[
                {
                  index: "01",
                  title: "Dạo qua phòng tranh",
                  text: "Xem các tác phẩm nổi bật, nghệ sĩ và bộ sưu tập đã được tuyển chọn.",
                  to: "/gallery",
                  label: "GALLERY",
                },
                {
                  index: "02",
                  title: "Tìm bằng cảm xúc",
                  text: "Mô tả một màu sắc, ký ức hoặc cảm giác — ArtMind sẽ gợi mở những tác phẩm phù hợp.",
                  to: "/search",
                  label: "AI SEARCH",
                },
                {
                  index: "03",
                  title: "Nhận diện một tác phẩm",
                  text: "Tải hình ảnh lên để bắt đầu hành trình tìm hiểu phong cách và thông tin liên quan.",
                  to: "/recognize",
                  label: "RECOGNIZE",
                },
              ].map((path) => (
                <Link
                  key={path.index}
                  to={path.to}
                  data-reveal="rise"
                  style={{ "--reveal-delay": `${90 + (Number(path.index) - 1) * 130}ms` }}
                  className="group relative grid gap-5 overflow-hidden border-b border-[#D8CFC0] py-8 hover:pl-3 md:grid-cols-[70px_1fr_auto] md:items-center md:gap-8 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-[#9B2C2C] before:transition-all before:duration-700 hover:before:w-full"
                >
                  <span className="font-['Playfair_Display'] text-2xl italic text-[#D4AF37]">
                    {path.index}
                  </span>
                  <div>
                    <h3 className="font-['Playfair_Display'] text-2xl font-medium text-[#2A2421] md:text-3xl">
                      {path.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#524640]">
                      {path.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[8px] font-bold tracking-[0.22em] text-[#2A2421]">
                    {path.label}
                    <span className="text-xl transition-transform group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          06. ARTMIND STUDIO / AI AS A QUIET TOOL
      ===================================================== */}
      <section className="relative overflow-hidden bg-[#1C1715] text-[#F7F4EF]">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[1.12fr_0.88fr]">
          <div data-reveal="image" className="relative min-h-[620px] lg:min-h-[760px]">
            <div className="reveal-media absolute inset-0 overflow-hidden">
              <img
                src={works[1].image}
                alt="ArtMind Studio"
                className="artmind-motion absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-70 grayscale-[12%] transition-transform duration-[1800ms] ease-out hover:scale-[1.07]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,23,21,0.05),rgba(28,23,21,0.15)_55%,rgba(28,23,21,0.82)_100%)]" />
              <div className="absolute inset-6 border border-white/10 md:inset-10" />

              <div className="absolute bottom-10 left-8 md:bottom-14 md:left-12">
                <span className="block text-[8px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Artificial intelligence / Human curiosity
                </span>
                <span className="mt-3 block font-['Playfair_Display'] text-[110px] leading-[0.8] text-white/15 md:text-[180px]">
                  AI
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center px-7 py-20 md:px-14 lg:px-16 xl:px-20">
            <span className="pointer-events-none absolute right-4 top-0 font-['Playfair_Display'] text-[180px] italic leading-none text-white/[0.025]">
              IV
            </span>

            <div data-reveal="rise" style={{ "--reveal-delay": "140ms" }} className="relative max-w-xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                IV / ArtMind studio
              </p>
              <h2 className="mt-7 font-['Playfair_Display'] text-5xl font-medium leading-[1.02] tracking-[-0.03em] md:text-6xl">
                Công nghệ nên đứng sau tác phẩm,
                <em className="font-normal text-[#D4AF37]">
                  {" "}
                  không đứng trước nó.
                </em>
              </h2>
              <p className="mt-8 text-sm leading-8 text-[#D0C5B6] md:text-base">
                ArtMind dùng AI như một người dẫn đường kín đáo: giúp bạn tìm,
                nhận diện và kết nối tác phẩm với cảm xúc — nhưng luôn để nghệ
                thuật là trung tâm của trải nghiệm.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/search"
                  className="group inline-flex items-center justify-center gap-5 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528] hover:shadow-[0_10px_30px_rgba(212,175,55,0.18)]"
                >
                  TÌM KIẾM BẰNG AI
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link
                  to="/recognize"
                  className="inline-flex items-center justify-center border border-[#5E5048] px-6 py-4 text-[9px] font-bold tracking-[0.22em] text-[#E0D7C8] transition duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37] hover:text-white"
                >
                  NHẬN DIỆN TÁC PHẨM
                </Link>
              </div>

              <div className="mt-14 grid grid-cols-3 border-y border-[#3D332E] py-6 text-center">
                <div className="border-r border-[#3D332E]">
                  <span className="block font-['Playfair_Display'] text-2xl text-[#D4AF37]">
                    01
                  </span>
                  <small className="mt-1 block text-[7px] uppercase tracking-[0.2em] text-[#A39585]">
                    Search
                  </small>
                </div>
                <div className="border-r border-[#3D332E]">
                  <span className="block font-['Playfair_Display'] text-2xl text-[#D4AF37]">
                    02
                  </span>
                  <small className="mt-1 block text-[7px] uppercase tracking-[0.2em] text-[#A39585]">
                    Recognize
                  </small>
                </div>
                <div>
                  <span className="block font-['Playfair_Display'] text-2xl text-[#D4AF37]">
                    03
                  </span>
                  <small className="mt-1 block text-[7px] uppercase tracking-[0.2em] text-[#A39585]">
                    Discover
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          07. CLOSING QUOTE
      ===================================================== */}
      <section className="relative overflow-hidden border-t border-[#E0D7C8] bg-[#EAE2D2] px-6 py-24 text-center md:px-12 md:py-32">
        <span className="artmind-motion absolute left-1/2 top-2 -translate-x-1/2 font-['Playfair_Display'] text-[170px] leading-none text-[#9B2C2C]/[0.08] [animation:artmindFloat_6s_ease-in-out_infinite] md:text-[240px]">
          “
        </span>

        <div data-reveal="rise" className="relative mx-auto max-w-5xl">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#9B2C2C]">
            ARTMIND / CLOSING NOTE
          </p>
          <blockquote className="mt-8 font-['Playfair_Display'] text-4xl font-medium leading-[1.08] tracking-[-0.025em] text-[#2A2421] md:text-6xl">
            Nghệ thuật không chỉ để nhìn.
            <br />
            <em className="font-normal text-[#9B2C2C]">Nó để ở lại.</em>
          </blockquote>

          <div className="mx-auto mt-10 flex max-w-md items-center gap-5">
            <span className="h-px flex-1 bg-[#C8BBA8]" />
            <span className="text-[8px] uppercase tracking-[0.28em] text-[#7A6C63]">
              Collection MMXXVI
            </span>
            <span className="h-px flex-1 bg-[#C8BBA8]" />
          </div>
        </div>
      </section>
    </main>
  );
}