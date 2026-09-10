import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { dashboard } from "../services/dashboardApi";
import { useAuth } from "../redux/AuthContext";
import GalleryGrid from "../components/gallery/GalleryGrid";
import Loader from "../components/common/Loader";

const normalize = (value) =>
  Array.isArray(value) ? value.filter((x) => x && x._id) : [];

function useRevealOnScroll(refreshKey) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

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
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" },
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

export default function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

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

  const load = useCallback(() => {
    setError("");

    dashboard()
      .then((response) => {
        const raw = response?.data || {};

        setData({
          favorites: normalize(raw.favorites),
          recentlyViewed: normalize(raw.recentlyViewed),
          recommendations: normalize(raw.recommendations),
          favoriteCategories: Array.isArray(raw.favoriteCategories)
            ? raw.favoriteCategories
            : [],
          stats: raw.stats || {},
        });
      })
      .catch((e) => {
        setError(e.message);
        toast.error(e.message);
      });
  }, []);

  useEffect(load, [load]);

  useRevealOnScroll(
    data
      ? `ready-${data.favorites.length}-${data.recentlyViewed.length}-${data.recommendations.length}`
      : error
        ? "error"
        : "loading",
  );

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#F7F4EF] px-6 text-[#2A2421]">
        <section className="w-full max-w-xl border border-[#D8CFC0] bg-[#EDE6D8] p-8 text-center shadow-[0_24px_70px_rgba(42,36,33,0.08)] md:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center border border-[#9B2C2C] font-['Playfair_Display'] text-2xl text-[#9B2C2C]">
            !
          </span>

          <span className="mt-6 block text-[8px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
            ARTMIND / SYSTEM NOTICE
          </span>

          <h1 className="mt-4 font-['Playfair_Display'] text-3xl font-medium tracking-[-0.025em] text-[#2A2421]">
            Không thể tải dữ liệu dashboard
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#524640]">{error}</p>

          <button
            type="button"
            onClick={load}
            className="group mt-7 inline-flex items-center gap-5 bg-[#9B2C2C] px-6 py-4 text-[9px] font-bold uppercase tracking-[0.22em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#7f2323] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B2C2C]"
          >
            THỬ LẠI
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#F7F4EF]">
        <Loader />
      </main>
    );
  }

  const stats = data.stats;
  const firstName = user?.name?.split(" ")[0] || "bạn";
  const topCategory =
    stats.topCategory || data.favoriteCategories[0]?.name || "Đang khám phá";

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

        @keyframes dashboardDrift {
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

          .dashboard-motion {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          1. HERO / PERSONAL ARCHIVE
      ===================================================== */}
      <section className="relative min-h-[600px] overflow-hidden border-b border-[#3D332E] bg-[#1C1715] text-[#F7F4EF] md:min-h-[650px]">
        <div className="dashboard-motion pointer-events-none absolute -inset-[8%] opacity-[0.16] [animation:dashboardDrift_16s_ease-in-out_infinite] [background-image:radial-gradient(circle_at_18%_22%,#D4AF37_0,transparent_27%),radial-gradient(circle_at_82%_34%,#9B2C2C_0,transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:84px_84px]" />

        <span className="pointer-events-none absolute -right-8 -top-20 hidden font-['Playfair_Display'] text-[310px] italic leading-none text-white/[0.025] lg:block">
          D
        </span>

        <div className="relative mx-auto grid min-h-[600px] max-w-[1500px] items-end gap-12 px-6 pb-16 pt-28 md:min-h-[650px] md:px-12 lg:grid-cols-[0.68fr_1.45fr_0.87fr] lg:px-20 lg:pb-20 lg:pt-32">
          <div
            data-reveal="soft"
            style={{ "--reveal-delay": "60ms" }}
            className="border-l border-[#4A3E38] pl-5"
          >
            <div className="flex items-center gap-4 text-[8px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              <span className="h-px w-10 bg-[#D4AF37]" />
              ARTMIND / DASHBOARD
            </div>

            <p className="mt-6 font-['Playfair_Display'] text-xl text-[#E0D7C8]">
              Personal archive
            </p>

            <p className="mt-2 text-[8px] uppercase tracking-[0.26em] text-[#A39585]">
              MMXXVI · Private volume
            </p>
          </div>

          <div data-reveal="rise" style={{ "--reveal-delay": "110ms" }}>
            <span className="mb-5 block text-[9px] font-semibold uppercase tracking-[0.32em] text-[#A39585]">
              Your visual world
            </span>

            <h1 className="font-['Playfair_Display'] text-6xl font-medium leading-[0.86] tracking-[-0.045em] sm:text-7xl lg:text-[88px] xl:text-[102px]">
              Chào {firstName},
              <br />
              <em className="font-normal text-[#D4AF37]">thế giới của bạn</em>
              <span className="text-[#9B2C2C]">.</span>
            </h1>
          </div>

          <div
            data-reveal="soft"
            style={{ "--reveal-delay": "180ms" }}
            className="border-t border-[#4A3E38] pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0"
          >
            <p className="font-['Playfair_Display'] text-xl leading-snug text-[#F7F4EF]">
              Một hồ sơ thẩm mỹ được tạo nên từ những điều bạn chọn giữ lại.
            </p>

            <p className="mt-4 max-w-md text-sm leading-7 text-[#D0C5B6]">
              Theo dõi những tác phẩm bạn yêu thích, những hình ảnh vừa xem và các
              gợi ý ArtMind tuyển chọn riêng cho bạn.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/gallery"
                className="group inline-flex items-center gap-5 bg-[#D4AF37] px-5 py-3.5 text-[8px] font-bold uppercase tracking-[0.2em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528]"
              >
                KHÁM PHÁ THÊM
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>

              <Link
                to="/search"
                className="inline-flex items-center border border-[#665750] px-5 py-3.5 text-[8px] font-bold uppercase tracking-[0.2em] text-[#E0D7C8] transition hover:border-[#9B2C2C] hover:text-white"
              >
                ✦ TÌM BẰNG AI
              </Link>
            </div>
          </div>
        </div>

        <div className="relative border-t border-[#3D332E] px-6 py-4 md:px-12 lg:px-20">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between text-[7px] uppercase tracking-[0.28em] text-[#A39585]">
            <span>PERSONAL × MEMORY</span>
            <span className="hidden md:block">CURATED FOR {firstName}</span>
            <span>
              {String(stats.favoriteCount ?? data.favorites.length).padStart(2, "0")} SAVED
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. PERSONAL INDEX
      ===================================================== */}
      <section className="border-b border-[#E0D7C8] bg-[#F7F4EF] px-6 py-24 md:px-12 md:py-28 lg:px-20">
        <div className="mx-auto max-w-[1450px]">
          <header
            data-reveal="rise"
            className="grid gap-8 border-b border-[#D8CFC0] pb-8 md:grid-cols-[1fr_auto] md:items-end"
          >
            <div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                  I / Personal index
                </span>
                <span
                  data-reveal="line"
                  style={{ "--reveal-delay": "180ms" }}
                  className="h-px w-20 bg-[#C8BBA8]"
                />
              </div>

              <h2 className="mt-5 font-['Playfair_Display'] text-4xl font-medium tracking-[-0.03em] text-[#2A2421] md:text-6xl">
                Bộ sưu tập <em className="font-normal text-[#9B2C2C]">trong những con số.</em>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#524640]">
                Một lát cắt nhanh về cách bạn đang tương tác với kho lưu trữ ArtMind.
              </p>
            </div>

            <div className="hidden items-end gap-3 md:flex">
              <span className="font-['Playfair_Display'] text-5xl font-normal leading-none text-[#9B2C2C] md:text-6xl">
                {String(data.favorites.length + data.recentlyViewed.length).padStart(2, "0")}
              </span>
              <span className="pb-1 text-[8px] uppercase leading-4 tracking-[0.22em] text-[#7A6C63]">
                dấu vết
                <br />
                cá nhân
              </span>
            </div>
          </header>

          <div
            data-reveal="soft"
            style={{ "--reveal-delay": "100ms" }}
            className="mt-12 grid border border-[#D8CFC0] md:grid-cols-3"
          >
            <StatCard
              label="ARTWORKS SAVED"
              value={String(
                stats.favoriteCount ?? data.favorites.length,
              ).padStart(2, "0")}
              note="Tác phẩm đã lưu"
            />

            <StatCard
              label="RECENTLY VIEWED"
              value={String(
                stats.recentCount ?? data.recentlyViewed.length,
              ).padStart(2, "0")}
              note="Vừa xem gần đây"
            />

            <article className="relative min-h-[250px] border-t border-[#3D332E] bg-[#1C1715] p-8 text-[#F7F4EF] md:border-l md:border-t-0">
              <small className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                YOUR TASTE
              </small>

              <b className="mt-10 block max-w-[270px] font-['Playfair_Display'] text-3xl font-medium leading-tight text-[#F7F4EF]">
                {topCategory}
              </b>

              <span className="absolute bottom-7 left-8 text-[8px] uppercase tracking-[0.2em] text-[#A39585]">
                Chủ đề yêu thích
              </span>

              <span className="absolute right-7 top-5 font-['Playfair_Display'] text-6xl text-[#D4AF37]/15">
                ◇
              </span>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================
          3. CURATED DASHBOARD SETS
      ===================================================== */}
      <div className="bg-[#F7F4EF]">
        <DashboardSet
          number="II"
          title="Dành riêng cho bạn"
          accent="tuyển chọn."
          subtitle="CURATED BY ARTMIND"
          description="Những tác phẩm được chọn dựa trên hành trình khám phá và dấu vết thẩm mỹ của bạn."
          items={data.recommendations}
          empty="Hãy khám phá thêm tranh để gợi ý ngày càng phù hợp."
        />

        <DashboardSet
          number="III"
          title="Vừa xem"
          accent="gần đây."
          subtitle="YOUR VISUAL MEMORY"
          description="Những tác phẩm bạn vừa dừng lại để quan sát trong hành trình gần nhất."
          items={data.recentlyViewed}
          empty="Bạn chưa xem tác phẩm nào."
        />

        <DashboardSet
          number="IV"
          title="Những điều"
          accent="bạn yêu."
          subtitle="PRIVATE COLLECTION"
          description="Kho lưu giữ cá nhân cho những tác phẩm bạn muốn quay lại xem thêm một lần nữa."
          items={data.favorites}
          empty="Bạn chưa lưu tác phẩm nào."
        />
      </div>

      {/* =====================================================
          4. CLOSING NOTE
      ===================================================== */}
      <section className="relative overflow-hidden border-t border-[#E0D7C8] bg-[#EAE2D2] px-6 py-24 text-center md:px-12 md:py-32">
        <span className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 font-['Playfair_Display'] text-[180px] leading-none text-[#9B2C2C]/[0.07] md:text-[240px]">
          “
        </span>

        <div data-reveal="rise" className="relative mx-auto max-w-5xl">
          <span className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#9B2C2C]">
            YOUR VISUAL STORY / ARTMIND
          </span>

          <blockquote className="mx-auto mt-8 max-w-4xl font-['Playfair_Display'] text-4xl font-medium leading-[1.08] tracking-[-0.025em] text-[#2A2421] md:text-6xl">
            Gu thẩm mỹ không được tạo ra
            <br />
            <em className="font-normal text-[#9B2C2C]">trong một khoảnh khắc.</em>
          </blockquote>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#524640]">
            Nó được hình thành từ từng tác phẩm khiến bạn dừng lại, từng màu sắc
            khiến bạn nhớ và từng câu chuyện bạn muốn giữ.
          </p>

          <div className="mx-auto mt-10 flex max-w-md items-center gap-5" aria-hidden="true">
            <span className="h-px flex-1 bg-[#C8BBA8]" />
            <span className="h-2 w-2 rotate-45 border border-[#9B2C2C]" />
            <span className="h-px flex-1 bg-[#C8BBA8]" />
          </div>

          <Link
            to="/gallery"
            className="group mt-9 inline-flex items-center gap-5 bg-[#D4AF37] px-6 py-4 text-[8px] font-bold uppercase tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528]"
          >
            TIẾP TỤC KHÁM PHÁ
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, note }) {
  return (
    <article className="group relative min-h-[250px] border-b border-[#D8CFC0] bg-[#F7F4EF] p-8 transition-colors duration-300 hover:bg-[#EDE6D8] last:border-b-0 md:border-b-0 md:border-r">
      <small className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#7A6C63]">
        {label}
      </small>

      <b className="mt-7 block font-['Playfair_Display'] text-7xl font-normal leading-none text-[#9B2C2C]">
        {value}
      </b>

      <span className="absolute bottom-7 left-8 text-[8px] uppercase tracking-[0.2em] text-[#7A6C63]">
        {note}
      </span>

      <span className="absolute right-7 top-6 text-[#9B2C2C] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
        ↗
      </span>
    </article>
  );
}

function DashboardSet({
  number,
  title,
  accent,
  subtitle,
  description,
  items,
  empty,
}) {
  return (
    <section className="border-b border-[#E0D7C8] bg-[#F7F4EF] px-6 py-24 md:px-12 md:py-28 lg:px-20">
      <div className="mx-auto max-w-[1450px]">
        <header
          data-reveal="rise"
          className="mb-12 grid gap-8 border-b border-[#D8CFC0] pb-8 md:grid-cols-[1fr_auto] md:items-end"
        >
          <div>
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                {number} / {subtitle}
              </span>
              <span
                data-reveal="line"
                style={{ "--reveal-delay": "180ms" }}
                className="h-px w-20 bg-[#C8BBA8]"
              />
            </div>

            <h2 className="mt-5 font-['Playfair_Display'] text-4xl font-medium tracking-[-0.03em] text-[#2A2421] md:text-6xl">
              {title} <em className="font-normal text-[#9B2C2C]">{accent}</em>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#524640]">
              {description}
            </p>
          </div>

          <div className="flex items-end gap-3">
            <span className="font-['Playfair_Display'] text-5xl font-normal leading-none text-[#9B2C2C] md:text-6xl">
              {String(items.length).padStart(2, "0")}
            </span>
            <span className="pb-1 text-[8px] uppercase leading-4 tracking-[0.22em] text-[#7A6C63]">
              hồ sơ
              <br />
              tác phẩm
            </span>
          </div>
        </header>

        {items.length ? (
          <div
            data-reveal="soft"
            style={{ "--reveal-delay": "100ms" }}
          >
            <GalleryGrid items={items} />
          </div>
        ) : (
          <div
            data-reveal="rise"
            className="flex min-h-[330px] flex-col items-center justify-center border-y border-[#D8CFC0] bg-[#EDE6D8] px-6 text-center"
          >
            <span className="font-['Playfair_Display'] text-7xl text-[#9B2C2C]/25">
              ◇
            </span>

            <span className="mt-5 text-[8px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
              Empty collection
            </span>

            <h3 className="mt-4 font-['Playfair_Display'] text-3xl font-medium text-[#2A2421]">
              Chưa có tác phẩm.
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#524640]">
              {empty}
            </p>

            <Link
              to="/gallery"
              className="group mt-8 inline-flex items-center gap-5 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528]"
            >
              MỞ PHÒNG TRANH
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
