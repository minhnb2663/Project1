import { Link } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Prevent the browser from restoring the old scroll position after refresh.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const philosophies = [
  {
    index: "01",
    roman: "I",
    label: "DISCOVER",
    title: "Khám phá",
    copy: "Đi qua các trường phái, chủ đề và chất liệu bằng một trải nghiệm trực quan, giàu cảm xúc.",
    dark: false,
  },
  {
    index: "02",
    roman: "II",
    label: "UNDERSTAND",
    title: "Thấu hiểu",
    copy: "AI đọc ý định tìm kiếm và ngôn ngữ thị giác, giúp bạn hiểu sâu hơn điều mình đang nhìn thấy.",
    dark: true,
  },
  {
    index: "03",
    roman: "III",
    label: "CONNECT",
    title: "Kết nối",
    copy: "Lưu lại tác phẩm yêu thích và xây dựng một bộ sưu tập phản chiếu gu thẩm mỹ riêng.",
    dark: false,
  },
];

function useRevealOnScroll() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          window.requestAnimationFrame(() => {
            entry.target.classList.add("is-visible");
          });
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    // Makes reveal reliable for content that is already in view on load.
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
  }, []);
}

export default function AboutPage() {
  const heroRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useRevealOnScroll();

  const handleHeroPointerMove = (event) => {
    if (!heroRef.current) return;

    const rect = heroRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setPointer({ x, y });
  };

  const resetHeroPointer = () => setPointer({ x: 0, y: 0 });

  return (
    <main className="overflow-hidden bg-[#F7F4EF] text-[#2A2421] selection:bg-[#9B2C2C] selection:text-[#F7F4EF]">
      <style>{`
        /* =====================================================
           ARTMIND MOTION SYSTEM — aligned with HomePage
        ===================================================== */
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

        [data-reveal="left"] {
          opacity: 0;
          transform: translate3d(-54px, 0, 0);
          filter: blur(2px);
          transition:
            opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            transform 1.55s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            filter 1.1s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
        }

        [data-reveal="line"] {
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 1.35s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
        }

        [data-reveal="mask"] {
          opacity: 1;
          transform: none;
          clip-path: none;
        }

        [data-reveal="mask"] > .reveal-mask-inner {
          opacity: 0;
          clip-path: inset(100% 0 0 0);
          transform: translate3d(0, 58px, 0);
          transition:
            clip-path 1.55s cubic-bezier(0.77, 0, 0.175, 1) var(--reveal-delay),
            transform 1.75s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            opacity 0.4s ease var(--reveal-delay);
        }

        [data-reveal="mask"].is-visible > .reveal-mask-inner {
          opacity: 1;
          clip-path: inset(0 0 0 0);
          transform: translate3d(0, 0, 0);
        }

        [data-reveal].is-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }

        [data-reveal="line"].is-visible {
          transform: scaleX(1);
        }

        @keyframes aboutFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -12px, 0); }
        }

        @keyframes aboutDrift {
          0%, 100% { transform: translate3d(-1.5%, -1%, 0) scale(1); }
          50% { transform: translate3d(1.5%, 1%, 0) scale(1.025); }
        }

        @keyframes aboutRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes aboutPulse {
          0%, 100% { opacity: .18; transform: scale(1); }
          50% { opacity: .34; transform: scale(1.025); }
        }

        .about-card-shine::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(115deg, transparent 22%, rgba(255,255,255,.22) 47%, transparent 70%);
          transform: translateX(-130%);
          transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .about-card-shine:hover::after {
          transform: translateX(130%);
        }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal],
          [data-reveal="mask"] > .reveal-mask-inner {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            clip-path: none !important;
            transition: none !important;
          }

          .about-motion {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          1. HERO - GIỚI THIỆU
      ===================================================== */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroPointerMove}
        onMouseLeave={resetHeroPointer}
        className="relative min-h-[760px] overflow-hidden border-b border-[#E0D7C8] lg:min-h-[820px]"
      >
        {/* NỀN GIẤY CỔ */}
        <div className="about-motion absolute -inset-[5%] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.78),transparent_32%),linear-gradient(135deg,#F7F4EF,#EDE6D8)] [animation:aboutDrift_16s_ease-in-out_infinite]" />

        {/* LƯỚI RẤT NHẸ ĐỂ ĐỒNG BỘ HOMEPAGE */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:linear-gradient(115deg,rgba(42,36,33,0.08)_1px,transparent_1px)] bg-[size:92px_92px]" />

        {/* VÒNG TRÒN TRANG TRÍ / PARALLAX */}
        <div
          className="about-motion absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border border-[#D4AF37]/20 transition-transform duration-1000 ease-out"
          style={{
            transform: `translate3d(${pointer.x * 22}px, ${pointer.y * 22}px, 0)`,
          }}
        />

        <div
          className="about-motion absolute -right-20 -top-20 h-[350px] w-[350px] rounded-full border border-[#9B2C2C]/15 transition-transform duration-1000 ease-out"
          style={{
            transform: `translate3d(${pointer.x * 36}px, ${pointer.y * 36}px, 0)`,
          }}
        />

        <div className="about-motion pointer-events-none absolute right-[2%] top-[4%] hidden h-[420px] w-[420px] rounded-full border border-dashed border-[#9B2C2C]/10 [animation:aboutRotate_38s_linear_infinite] lg:block" />

        {/* CHỮ TRANG TRÍ NỀN */}
        <span
          className="about-motion absolute right-[7%] top-[9%] hidden font-['Playfair_Display'] text-[230px] italic leading-none text-[#9B2C2C]/[0.055] transition-transform duration-1000 ease-out lg:block"
          style={{
            transform: `translate3d(${pointer.x * -18}px, ${pointer.y * -18}px, 0)`,
          }}
        >
          A
        </span>

        <div className="relative mx-auto grid min-h-[760px] max-w-[1500px] items-center gap-16 px-6 pb-28 pt-24 md:px-12 lg:min-h-[820px] lg:grid-cols-[1.15fr_0.85fr] lg:px-20">
          {/* ================= BÊN TRÁI ================= */}
          <div data-reveal="rise" className="relative" style={{ "--reveal-delay": "40ms" }}>
            <div className="mb-8 flex items-center gap-4">
              <span data-reveal="line" className="h-px w-12 bg-[#9B2C2C]" />
              <span className="text-[10px] font-semibold tracking-[4px] text-[#9B2C2C]">
                GIỚI THIỆU / ARTMIND
              </span>
            </div>

            <h1
              className="about-motion font-['Playfair_Display'] text-5xl font-medium leading-[0.98] tracking-[-0.035em] transition-transform duration-700 ease-out sm:text-6xl lg:text-[82px]"
              style={{
                transform: `translate3d(${pointer.x * -8}px, ${pointer.y * -8}px, 0)`,
              }}
            >
              Nghệ thuật
              <br />
              trở nên
              <br />
              <em className="font-normal text-[#9B2C2C]">gần gũi hơn.</em>
            </h1>

            <div className="mt-10 flex items-center gap-4">
              <span className="about-motion h-2 w-2 rotate-45 border border-[#D4AF37] [animation:aboutFloat_5s_ease-in-out_infinite]" />
              <span data-reveal="line" style={{ "--reveal-delay": "220ms" }} className="h-px w-28 bg-[#C8BBA8]" />
              <small className="text-[8px] tracking-[3px] text-[#7A6C63]">
                EST. 2026
              </small>
            </div>
          </div>

          {/* ================= BÊN PHẢI ================= */}
          <div data-reveal="soft" style={{ "--reveal-delay": "180ms" }} className="relative">
            <span className="absolute -left-8 -top-14 hidden font-['Playfair_Display'] text-7xl italic text-[#D4AF37]/20 md:block">
              01
            </span>

            <div className="relative border-l border-[#D8CFC0] pl-7 md:pl-10">
              <span className="text-[9px] font-semibold tracking-[3px] text-[#9B2C2C]">
                ART × INTELLIGENCE
              </span>

              <p className="mt-6 font-['Playfair_Display'] text-xl leading-9 text-[#2A2421] md:text-2xl">
                ArtMind là cổng khám phá hội họa kết hợp tuyển chọn của con
                người với trí tuệ nhân tạo.
              </p>

              <p className="mt-6 max-w-lg text-sm leading-7 text-[#524640]">
                Để mỗi người đều có thể tìm thấy một tác phẩm khiến mình dừng
                lại, quan sát lâu hơn và thực sự rung động.
              </p>
            </div>
          </div>
        </div>

        {/* DÒNG CHỮ DƯỚI HERO */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-[#E0D7C8]/60 bg-[#1C1715] px-6 py-4 text-[#F7F4EF]">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between">
            <span className="text-[8px] tracking-[4px]">DIGITAL ART ARCHIVE</span>
            <span className="hidden text-[8px] tracking-[4px] md:block">CURATED WITH INTUITION</span>
            <span className="text-[8px] tracking-[4px]">HANOI / 2026</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. BA GIÁ TRỊ
      ===================================================== */}
      <section className="relative px-6 py-28 md:px-12 md:py-32 lg:px-20">
        <span className="pointer-events-none absolute -left-12 top-16 hidden font-['Playfair_Display'] text-[220px] italic leading-none text-[#9B2C2C]/[0.025] xl:block">
          II
        </span>

        <div className="relative mx-auto max-w-[1500px]">
          <div
            data-reveal="rise"
            className="mb-16 flex flex-col justify-between gap-8 border-b border-[#D8CFC0] pb-8 md:flex-row md:items-end"
          >
            <div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold tracking-[4px] text-[#9B2C2C]">
                  II / OUR PHILOSOPHY
                </span>
                <span data-reveal="line" style={{ "--reveal-delay": "180ms" }} className="h-px w-20 bg-[#C8BBA8]" />
              </div>

              <h2 className="mt-5 font-['Playfair_Display'] text-4xl font-medium tracking-[-0.025em] md:text-6xl">
                Ba cách để
                <br />
                <em className="font-normal text-[#9B2C2C]">gặp nghệ thuật.</em>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-[#524640]">
              Không chỉ nhìn một bức tranh. Hãy tìm hiểu nó, cảm nhận nó và tạo
              ra mối liên hệ của riêng bạn.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {philosophies.map((item, index) => (
              <article
                key={item.index}
                data-reveal="rise"
                style={{ "--reveal-delay": `${90 + index * 150}ms` }}
                className={`about-card-shine group relative min-h-[410px] overflow-hidden border p-8 transition-[transform,box-shadow,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2.5 ${
                  item.dark
                    ? "border-[#3D332E] bg-[#1C1715] text-[#F7F4EF] hover:border-[#D4AF37]/45 hover:shadow-[0_28px_70px_rgba(28,23,21,0.28)]"
                    : index === 0
                    ? "border-[#E0D7C8] bg-[#EDE6D8] hover:border-[#9B2C2C]/45 hover:shadow-[0_28px_70px_rgba(42,36,33,0.14)]"
                    : "border-[#E0D7C8] bg-[#ECE4D5] hover:border-[#9B2C2C]/45 hover:shadow-[0_28px_70px_rgba(42,36,33,0.14)]"
                }`}
              >
                <span
                  className={`absolute right-5 top-2 font-['Playfair_Display'] text-[106px] italic leading-none transition-transform duration-1000 ease-out group-hover:-translate-y-1 group-hover:scale-[1.06] ${
                    item.dark ? "text-white/5" : "text-[#9B2C2C]/10"
                  }`}
                >
                  {item.roman}
                </span>

                <div className="relative z-10 flex h-full flex-col">
                  <span className={`text-[9px] tracking-[3px] ${item.dark ? "text-[#D4AF37]" : "text-[#9B2C2C]"}`}>
                    {item.index} / {item.label}
                  </span>

                  <div className={`my-10 h-px w-12 origin-left transition-all duration-700 group-hover:w-20 ${item.dark ? "bg-[#D4AF37]" : "bg-[#9B2C2C]"}`} />

                  <h3 className="font-['Playfair_Display'] text-3xl font-medium">
                    {item.title}
                  </h3>

                  <p className={`mt-5 text-sm leading-7 ${item.dark ? "text-[#D0C5B6]" : "text-[#524640]"}`}>
                    {item.copy}
                  </p>

                  <div className="mt-auto flex items-end justify-between pt-10">
                    <span className={`text-[8px] tracking-[2px] opacity-0 transition duration-500 group-hover:opacity-70 ${item.dark ? "text-[#D4AF37]" : "text-[#9B2C2C]"}`}>
                      ARTMIND / {item.index}
                    </span>
                    <span className={`text-xl transition-transform duration-500 group-hover:translate-x-2 ${item.dark ? "text-[#D4AF37]" : "text-[#9B2C2C]"}`}>
                      →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          3. CÂU TRÍCH DẪN
      ===================================================== */}
      <section className="relative overflow-hidden border-y border-[#E0D7C8] bg-[#EAE2D2] px-6 py-24 text-center md:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_50%_45%,rgba(155,44,44,.18),transparent_32%)]" />

        <span className="about-motion absolute left-1/2 top-4 -translate-x-1/2 font-['Playfair_Display'] text-[170px] leading-none text-[#9B2C2C]/[0.08] [animation:aboutFloat_6s_ease-in-out_infinite] md:text-[230px]">
          “
        </span>

        <div data-reveal="mask" className="relative mx-auto max-w-5xl">
          <div className="reveal-mask-inner">
            <p className="mb-7 text-[9px] font-bold uppercase tracking-[0.32em] text-[#9B2C2C]">
              ARTMIND / MANIFESTO
            </p>

            <blockquote className="font-['Playfair_Display'] text-3xl font-medium leading-[1.12] tracking-[-0.02em] md:text-5xl lg:text-[58px]">
              Công nghệ có thể chỉ ra một con đường.
              <br />
              <em className="font-normal text-[#9B2C2C]">
                Nhưng cảm xúc quyết định nơi ta dừng lại.
              </em>
            </blockquote>

            <div className="mx-auto mt-10 flex max-w-sm items-center justify-center gap-4">
              <span className="h-px flex-1 bg-[#C8BBA8]" />
              <span className="h-2 w-2 rotate-45 border border-[#9B2C2C]" />
              <span className="h-px flex-1 bg-[#C8BBA8]" />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. SỨ MỆNH
      ===================================================== */}
      <section className="relative overflow-hidden bg-[#1C1715] px-6 py-28 text-[#F7F4EF] md:px-12 md:py-32 lg:px-20">
        <div className="about-motion pointer-events-none absolute -right-[10%] -top-[30%] h-[620px] w-[620px] rounded-full border border-[#D4AF37]/10 [animation:aboutPulse_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.11] [background-image:linear-gradient(115deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:90px_90px]" />

        <span className="absolute right-[5%] top-5 hidden font-['Playfair_Display'] text-[230px] italic leading-none text-white/[0.025] lg:block">
          03
        </span>

        <div className="relative mx-auto grid max-w-[1500px] gap-16 lg:grid-cols-2 lg:gap-24">
          <div data-reveal="rise">
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-bold tracking-[4px] text-[#D4AF37]">
                III / SỨ MỆNH
              </span>
              <span data-reveal="line" style={{ "--reveal-delay": "180ms" }} className="h-px w-20 bg-[#5E5048]" />
            </div>

            <h2 className="mt-7 font-['Playfair_Display'] text-5xl font-medium leading-[1.05] tracking-[-0.03em] md:text-6xl lg:text-[68px]">
              Công nghệ
              <br />
              mở lối.
              <br />
              <em className="font-normal text-[#D4AF37]">Cảm xúc dẫn đường.</em>
            </h2>
          </div>

          <div data-reveal="soft" style={{ "--reveal-delay": "160ms" }} className="flex flex-col justify-end">
            <div className="border-l border-[#4A3E38] pl-7 md:pl-10">
              <p className="text-sm leading-8 text-[#D0C5B6] md:text-[15px]">
                Chúng tôi không dùng AI để thay thế nghệ sĩ hay cảm nhận của con
                người. ArtMind dùng công nghệ như một người dẫn đường thầm
                lặng—giúp việc tiếp cận, tìm hiểu và yêu nghệ thuật trở nên tự
                nhiên hơn.
              </p>

              <p className="mt-5 text-sm leading-8 text-[#A39585]">
                Nghệ thuật vẫn thuộc về con người. Công nghệ chỉ giúp khoảng
                cách giữa người xem và tác phẩm trở nên ngắn hơn.
              </p>
            </div>

            <Link
              to="/gallery"
              className="group mt-10 inline-flex w-fit items-center gap-6 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold tracking-[0.22em] text-[#2A2421] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[#b89528] hover:shadow-[0_10px_30px_rgba(212,175,55,0.18)]"
            >
              KHÁM PHÁ BỘ SƯU TẬP
              <span className="text-base transition-transform duration-500 group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>
        </div>

        <div data-reveal="soft" style={{ "--reveal-delay": "260ms" }} className="relative mx-auto mt-24 flex max-w-[1500px] items-center gap-5">
          <span className="h-px flex-1 bg-white/10" />
          <span className="about-motion h-2 w-2 rotate-45 border border-[#D4AF37] [animation:aboutFloat_5s_ease-in-out_infinite]" />
          <span className="text-[8px] tracking-[4px] text-[#A39585]">
            ART · MEMORY · INTELLIGENCE
          </span>
          <span className="about-motion h-2 w-2 rotate-45 border border-[#D4AF37] [animation:aboutFloat_5s_ease-in-out_infinite_600ms]" />
          <span className="h-px flex-1 bg-white/10" />
        </div>
      </section>
    </main>
  );
}
