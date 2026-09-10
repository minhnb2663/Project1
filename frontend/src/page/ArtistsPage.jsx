import { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { artists } from "../services/artistApi";
import Loader from "../components/common/Loader";

function useRevealOnScroll(refreshKey) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    // Progressive enhancement: content stays visible by default.
    // Only elements actually registered by this effect become temporarily hidden.
    elements.forEach((element) => {
      element.classList.remove("is-visible");
      element.classList.add("reveal-pending");
    });

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
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((element) => observer.observe(element));

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

export default function ArtistsPage() {
  const [data, setData] = useState(null);

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

  useEffect(() => {
    artists()
      .then((x) => setData(x.data || []))
      .catch(() => setData([]));
  }, []);

  // Use a loading/ready key so the reveal system re-initializes even when the API returns an empty array.
  useRevealOnScroll(data === null ? "loading" : `ready-${data.length}`);

  if (!data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F4EF]">
        <Loader />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F4EF] text-[#2A2421] selection:bg-[#9B2C2C] selection:text-[#F7F4EF]">
      <style>{`
        [data-reveal] {
          --reveal-delay: 80ms;
          will-change: transform, opacity, filter;
        }

        [data-reveal="rise"].reveal-pending {
          opacity: 0;
          transform: translate3d(0, 52px, 0);
          filter: blur(2px);
          transition:
            opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            transform 1.25s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            filter 1s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
        }

        [data-reveal="soft"].reveal-pending {
          opacity: 0;
          transform: translate3d(0, 28px, 0);
          transition:
            opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
        }

        [data-reveal="line"].reveal-pending {
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 1.15s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
        }

        [data-reveal].reveal-pending.is-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          filter: blur(0);
        }

        [data-reveal="line"].reveal-pending.is-visible {
          transform: scaleX(1);
        }

        @keyframes artistsDrift {
          0%, 100% { transform: translate3d(-1.5%, -1%, 0) scale(1); }
          50% { transform: translate3d(1.5%, 1%, 0) scale(1.025); }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal] {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            transition: none !important;
          }

          .artists-motion {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          1. HERO / ARTIST ARCHIVE
      ===================================================== */}
      <section className="relative min-h-[600px] overflow-hidden border-b border-[#3D332E] bg-[#1C1715] text-[#F7F4EF] md:min-h-[650px]">
        <div className="artists-motion pointer-events-none absolute -inset-[8%] opacity-[0.16] [animation:artistsDrift_16s_ease-in-out_infinite] [background-image:radial-gradient(circle_at_18%_22%,#D4AF37_0,transparent_27%),radial-gradient(circle_at_82%_34%,#9B2C2C_0,transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:84px_84px]" />

        <span className="pointer-events-none absolute -right-8 -top-20 hidden font-['Playfair_Display'] text-[310px] italic leading-none text-white/[0.025] lg:block">
          A
        </span>

        <div className="relative mx-auto grid min-h-[600px] max-w-[1500px] items-end gap-12 px-6 pb-16 pt-28 md:min-h-[650px] md:px-12 lg:grid-cols-[0.68fr_1.45fr_0.87fr] lg:px-20 lg:pb-20 lg:pt-32">
          <div data-reveal="soft" style={{ "--reveal-delay": "60ms" }} className="border-l border-[#4A3E38] pl-5">
            <div className="flex items-center gap-4 text-[8px] font-bold tracking-[0.3em] text-[#D4AF37]">
              <span className="h-px w-10 bg-[#D4AF37]" />
              ARTMIND / ARTISTS
            </div>

            <p className="mt-6 font-['Playfair_Display'] text-xl text-[#E0D7C8]">
              Artist archive
            </p>

            <p className="mt-2 text-[8px] uppercase tracking-[0.26em] text-[#A39585]">
              MMXXVI · Volume I
            </p>
          </div>

          <div data-reveal="rise" style={{ "--reveal-delay": "110ms" }}>
            <span className="mb-5 block text-[9px] font-semibold uppercase tracking-[0.32em] text-[#A39585]">
              Makers of vision
            </span>

            <h1 className="font-['Playfair_Display'] text-6xl font-medium leading-[0.86] tracking-[-0.045em] sm:text-7xl lg:text-[92px] xl:text-[108px]">
              Những người
              <br />
              <em className="font-normal text-[#D4AF37]">kiến tạo</em>{" "}
              <span className="text-[#9B2C2C]">thị giác.</span>
            </h1>
          </div>

          <div data-reveal="soft" style={{ "--reveal-delay": "180ms" }} className="border-t border-[#4A3E38] pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <p className="font-['Playfair_Display'] text-xl leading-snug text-[#F7F4EF]">
              Những câu chuyện đứng sau tác phẩm.
            </p>

            <p className="mt-4 max-w-md text-sm leading-7 text-[#D0C5B6]">
              Gặp gỡ nghệ sĩ qua thực hành, bối cảnh và cách mỗi người xây dựng một ngôn ngữ thị giác riêng.
            </p>
          </div>
        </div>

        <div className="relative border-t border-[#3D332E] px-6 py-4 md:px-12 lg:px-20">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between text-[7px] uppercase tracking-[0.28em] text-[#A39585]">
            <span>ART × MEMORY</span>
            <span className="hidden md:block">CURATED BY ARTMIND</span>
            <span>{String(data.length).padStart(2, "0")} ARTISTS</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. ARTIST DIRECTORY
      ===================================================== */}
      <section className="bg-[#F7F4EF] px-6 py-24 md:px-12 md:py-28 lg:px-20">
        <div className="mx-auto max-w-[1450px]">
          <header data-reveal="rise" className="mb-12 grid gap-8 border-b border-[#D8CFC0] pb-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                  I / Artist directory
                </span>
                <span data-reveal="line" style={{ "--reveal-delay": "180ms" }} className="h-px w-20 bg-[#C8BBA8]" />
              </div>

              <h2 className="mt-5 font-['Playfair_Display'] text-4xl font-medium tracking-[-0.03em] text-[#2A2421] md:text-6xl">
                Danh mục <em className="font-normal text-[#9B2C2C]">nghệ sĩ.</em>
              </h2>
            </div>

            <div className="flex items-end gap-3">
              <span className="font-['Playfair_Display'] text-5xl font-normal leading-none text-[#9B2C2C] md:text-6xl">
                {String(data.length).padStart(2, "0")}
              </span>
              <span className="pb-1 text-[8px] uppercase leading-4 tracking-[0.22em] text-[#7A6C63]">
                hồ sơ
                <br />
                nghệ sĩ
              </span>
            </div>
          </header>

          {data.length ? (
            <div className="border-t border-[#D8CFC0]">
              {data.map((x, i) => (
                <Link
                  to={`/artists/${x.slug}`}
                  key={x._id}
                  data-reveal="rise"
                  style={{ "--reveal-delay": `${80 + Math.min(i, 7) * 70}ms` }}
                  className="group relative grid gap-7 overflow-hidden border-b border-[#D8CFC0] py-8 transition-[background-color,padding] duration-500 hover:bg-[#EFE7DB] md:grid-cols-[64px_160px_1fr_56px] md:items-center md:px-4 md:hover:px-6"
                >
                  <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[#9B2C2C] transition-all duration-700 group-hover:w-full" />

                  <div className="font-['Playfair_Display'] text-2xl italic text-[#D4AF37]">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <figure className="relative w-[150px] overflow-hidden bg-[#1C1715] shadow-[0_12px_34px_rgba(42,36,33,0.10)]">
                    {x.portrait ? (
                      <img
                        src={x.portrait}
                        alt={x.name}
                        loading="lazy"
                        className="h-[190px] w-full object-cover grayscale-[14%] transition-[transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045] group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="flex h-[190px] items-center justify-center bg-[#EDE6D8] font-['Playfair_Display'] text-5xl text-[#9B2C2C]">
                        {x.name?.[0]?.toUpperCase() || "A"}
                      </div>
                    )}
                    <span className="pointer-events-none absolute inset-2 border border-white/15" />
                  </figure>

                  <div>
                    <small className="text-[8px] font-bold uppercase tracking-[0.27em] text-[#9B2C2C]">
                      {x.nationality || "Chưa rõ"}
                      {" · "}
                      {x.period || "Đương đại"}
                    </small>

                    <h3 className="mt-3 font-['Playfair_Display'] text-3xl font-medium leading-tight text-[#2A2421] transition-colors duration-300 group-hover:text-[#9B2C2C] md:text-4xl">
                      {x.name}
                    </h3>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#524640] line-clamp-3">
                      {x.biography || "Chưa có tiểu sử nghệ sĩ."}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {(x.styles || []).slice(0, 4).map((style) => (
                        <span
                          key={style}
                          className="border border-[#D8CFC0] px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.12em] text-[#7A6C63] transition-colors duration-300 group-hover:border-[#C8BBA8]"
                        >
                          {style}
                        </span>
                      ))}

                      <span className="text-[7px] uppercase tracking-[0.2em] text-[#A39585]">
                        / {x.paintingCount || 0} tác phẩm
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-start md:justify-end">
                    <span className="flex h-11 w-11 items-center justify-center border border-[#C8BBA8] font-['Playfair_Display'] text-lg text-[#2A2421] transition-[transform,background-color,color,border-color] duration-300 group-hover:translate-x-1 group-hover:border-[#1C1715] group-hover:bg-[#1C1715] group-hover:text-[#D4AF37]">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div data-reveal="rise" className="flex min-h-[390px] flex-col items-center justify-center border-y border-[#D8CFC0] bg-[#EDE6D8] px-6 text-center">
              <span className="font-['Playfair_Display'] text-7xl text-[#9B2C2C]/25">◇</span>
              <span className="mt-5 text-[8px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                Empty directory
              </span>
              <h3 className="mt-4 font-['Playfair_Display'] text-3xl font-medium text-[#2A2421]">
                Chưa có nghệ sĩ.
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#524640]">
                Hồ sơ nghệ sĩ sẽ xuất hiện tại đây khi kho lưu trữ được cập nhật.
              </p>
              <Link
                to="/gallery"
                className="group mt-8 inline-flex items-center gap-5 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528]"
              >
                KHÁM PHÁ TÁC PHẨM
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          3. CLOSING NOTE
      ===================================================== */}
      <section className="relative overflow-hidden border-t border-[#E0D7C8] bg-[#EAE2D2] px-6 py-24 text-center md:px-12 md:py-32">
        <span className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 font-['Playfair_Display'] text-[180px] leading-none text-[#9B2C2C]/[0.07] md:text-[240px]">
          “
        </span>

        <div data-reveal="rise" className="relative mx-auto max-w-5xl">
          <span className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#9B2C2C]">
            ARTISTS / ARTMIND ARCHIVE
          </span>

          <blockquote className="mx-auto mt-8 max-w-4xl font-['Playfair_Display'] text-4xl font-medium leading-[1.08] tracking-[-0.025em] text-[#2A2421] md:text-6xl">
            Trước mỗi tác phẩm
            <br />
            <em className="font-normal text-[#9B2C2C]">luôn có một cách nhìn.</em>
          </blockquote>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#524640]">
            Nghệ sĩ không chỉ tạo ra hình ảnh. Họ mở ra một cách khác để chúng ta nhìn thế giới.
          </p>

          <div className="mx-auto mt-10 flex max-w-md items-center gap-5" aria-hidden="true">
            <span className="h-px flex-1 bg-[#C8BBA8]" />
            <span className="h-2 w-2 rotate-45 border border-[#9B2C2C]" />
            <span className="h-px flex-1 bg-[#C8BBA8]" />
          </div>
        </div>
      </section>
    </main>
  );
}
