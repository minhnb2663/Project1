import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../redux/AuthContext";
import { paintings } from "../services/paintingApi";
import { categories } from "../services/categoryApi";
import GalleryGrid from "../components/gallery/GalleryGrid";
import Loader from "../components/common/Loader";
import {
  addToCollection,
  getCollection,
  removeFromCollection,
} from "../services/collectionApi";

const PAGE_SIZE = 12;

function useRevealOnScroll(refreshKey) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    // Progressive enhancement: content remains visible by default.
    // Only elements registered by this effect are temporarily hidden for reveal.
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

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const directoryRef = useRef(null);
  const { user, loading: authLoading } = useAuth();
  const [authRequiredOpen, setAuthRequiredOpen] = useState(false);
  const [savedItemIds, setSavedItemIds] = useState(() => new Set());
  const [pendingItemIds, setPendingItemIds] = useState(() => new Set());

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
    categories()
      .then((response) => setCats(response.data || []))
      .catch(() => setCats([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    paintings({
      page,
      limit: PAGE_SIZE,
      sort: "-createdAt",
      ...(active ? { category: active } : {}),
    })
      .then((response) => {
        if (cancelled) return;

        const nextTotal = response.pagination?.total ?? 0;
        const nextPages = response.pagination?.pages ?? Math.ceil(nextTotal / PAGE_SIZE);
        const lastPage = Math.max(1, nextPages);

        // Reload the last available page if the collection has become smaller.
        if (page > lastPage) {
          cancelled = true;
          setPage(lastPage);
          return;
        }

        setItems(response.data || []);
        setTotal(nextTotal);
        setTotalPages(nextPages);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setTotalPages(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active, page]);

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    const numbers = [];

    if (start > 1) numbers.push(1);
    if (start > 2) numbers.push("start-ellipsis");
    for (let number = start; number <= end; number += 1) {
      numbers.push(number);
    }
    if (end < totalPages - 1) numbers.push("end-ellipsis");
    if (end < totalPages) numbers.push(totalPages);

    return numbers;
  }, [page, totalPages]);

  const handleCategoryChange = (categoryId) => {
    if (categoryId === active) return;
    setLoading(true);
    setActive(categoryId);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    if (loading || nextPage === page || nextPage < 1 || nextPage > totalPages) return;
    setLoading(true);
    setPage(nextPage);
    directoryRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
  };

  const activeCategory = useMemo(
    () => cats.find((category) => category._id === active),
    [active, cats]
  );

  useEffect(() => {
    if (authLoading) return undefined;

    if (!user) {
      setSavedItemIds(new Set());
      return undefined;
    }

    let cancelled = false;

    getCollection()
      .then((response) => {
        if (cancelled) return;

        setSavedItemIds(
          new Set(
            (response.data || [])
              .map((item) => item?._id || item?.id)
              .filter(Boolean)
              .map(String),
          ),
        );
      })
      .catch((error) => {
        if (cancelled) return;
        setSavedItemIds(new Set());

        if (error?.response?.status !== 401) {
          toast.error(
            error?.response?.data?.message ||
              "Không thể tải trạng thái bộ sưu tập.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const handleAddToCollection = async (item) => {
    if (!user) {
      setAuthRequiredOpen(true);
      return;
    }

    const itemId = item?._id || item?.id;
    if (!itemId) {
      toast.error("Không xác định được tác phẩm cần lưu.");
      return;
    }

    const normalizedId = String(itemId);

    if (savedItemIds.has(normalizedId) || pendingItemIds.has(normalizedId)) {
      return;
    }

    setPendingItemIds((current) => {
      const next = new Set(current);
      next.add(normalizedId);
      return next;
    });

    // Optimistic UI: đổi nút ngay khi user bấm.
    setSavedItemIds((current) => {
      const next = new Set(current);
      next.add(normalizedId);
      return next;
    });

    try {
      await addToCollection(itemId);
      toast.success("Đã thêm vào bộ sưu tập");

      window.dispatchEvent(
        new CustomEvent("artmind:collection-updated", {
          detail: { action: "add", paintingId: normalizedId },
        }),
      );
    } catch (error) {
      setSavedItemIds((current) => {
        const next = new Set(current);
        next.delete(normalizedId);
        return next;
      });

      if (error?.response?.status === 401) {
        setAuthRequiredOpen(true);
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Không thể thêm tác phẩm vào bộ sưu tập.",
        );
      }

      console.error("Add to collection failed:", error);
    } finally {
      setPendingItemIds((current) => {
        const next = new Set(current);
        next.delete(normalizedId);
        return next;
      });
    }
  };

  const handleRemoveFromCollection = async (item) => {
    if (!user) {
      setAuthRequiredOpen(true);
      return;
    }

    const itemId = item?._id || item?.id;
    if (!itemId) {
      toast.error("Không xác định được tác phẩm cần xóa.");
      return;
    }

    const normalizedId = String(itemId);

    if (!savedItemIds.has(normalizedId) || pendingItemIds.has(normalizedId)) {
      return;
    }

    setPendingItemIds((current) => {
      const next = new Set(current);
      next.add(normalizedId);
      return next;
    });

    // Optimistic UI: đổi nút về "Thêm vào bộ sưu tập" ngay khi bấm xóa.
    setSavedItemIds((current) => {
      const next = new Set(current);
      next.delete(normalizedId);
      return next;
    });

    try {
      await removeFromCollection(itemId);
      toast.success("Đã xóa khỏi bộ sưu tập");

      window.dispatchEvent(
        new CustomEvent("artmind:collection-updated", {
          detail: { action: "remove", paintingId: normalizedId },
        }),
      );
    } catch (error) {
      // Rollback nếu backend xóa thất bại.
      setSavedItemIds((current) => {
        const next = new Set(current);
        next.add(normalizedId);
        return next;
      });

      if (error?.response?.status === 401) {
        setAuthRequiredOpen(true);
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Không thể xóa tác phẩm khỏi bộ sưu tập.",
        );
      }

      console.error("Remove from collection failed:", error);
    } finally {
      setPendingItemIds((current) => {
        const next = new Set(current);
        next.delete(normalizedId);
        return next;
      });
    }
  };

  const goToAuth = (path) => {
    if (typeof window === "undefined") return;

    const redirect = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`${path}?redirect=${encodeURIComponent(redirect)}`);
  };

  // Re-initialize reveal after each category or page request, including equal-size pages.
  useRevealOnScroll(
    `${loading ? "loading" : "ready"}-${active || "all"}-${page}-${items.length}`
  );

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

        @keyframes galleryDrift {
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

          .gallery-motion {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          1. HERO / ARTWORK ARCHIVE
      ===================================================== */}
      <section className="relative min-h-[600px] overflow-hidden border-b border-[#3D332E] bg-[#1C1715] text-[#F7F4EF] md:min-h-[650px]">
        <div className="gallery-motion pointer-events-none absolute -inset-[8%] opacity-[0.16] [animation:galleryDrift_16s_ease-in-out_infinite] [background-image:radial-gradient(circle_at_18%_22%,#D4AF37_0,transparent_27%),radial-gradient(circle_at_82%_34%,#9B2C2C_0,transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:84px_84px]" />

        <span className="pointer-events-none absolute -right-8 -top-20 hidden font-['Playfair_Display'] text-[310px] italic leading-none text-white/[0.025] lg:block">
          G
        </span>

        <div className="relative mx-auto grid min-h-[600px] max-w-[1500px] items-end gap-12 px-6 pb-16 pt-28 md:min-h-[650px] md:px-12 lg:grid-cols-[0.68fr_1.45fr_0.87fr] lg:px-20 lg:pb-20 lg:pt-32">
          <div
            data-reveal="soft"
            style={{ "--reveal-delay": "60ms" }}
            className="border-l border-[#4A3E38] pl-5"
          >
            <div className="flex items-center gap-4 text-[8px] font-bold tracking-[0.3em] text-[#D4AF37]">
              <span className="h-px w-10 bg-[#D4AF37]" />
              ARTMIND / GALLERY
            </div>

            <p className="mt-6 font-['Playfair_Display'] text-xl text-[#E0D7C8]">
              Artwork archive
            </p>

            <p className="mt-2 text-[8px] uppercase tracking-[0.26em] text-[#A39585]">
              MMXXVI · Volume I
            </p>
          </div>

          <div data-reveal="rise" style={{ "--reveal-delay": "110ms" }}>
            <span className="mb-5 block text-[9px] font-semibold uppercase tracking-[0.32em] text-[#A39585]">
              Curated digital collection
            </span>

            <h1 className="font-['Playfair_Display'] text-6xl font-medium leading-[0.86] tracking-[-0.045em] sm:text-7xl lg:text-[92px] xl:text-[108px]">
              Hồ sơ
              <br />
              <em className="font-normal text-[#D4AF37]">nghệ thuật</em>
              <span className="text-[#9B2C2C]">.</span>
            </h1>
          </div>

          <div
            data-reveal="soft"
            style={{ "--reveal-delay": "180ms" }}
            className="border-t border-[#4A3E38] pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0"
          >
            <p className="font-['Playfair_Display'] text-xl leading-snug text-[#F7F4EF]">
              Một kho lưu trữ luôn tiếp tục mở ra.
            </p>

            <p className="mt-4 max-w-md text-sm leading-7 text-[#D0C5B6]">
              Những tác phẩm, nghệ sĩ và câu chuyện thị giác được ArtMind tuyển chọn,
              phân loại và đặt cạnh nhau để tạo nên những liên tưởng mới.
            </p>
          </div>
        </div>

        <div className="relative border-t border-[#3D332E] px-6 py-4 md:px-12 lg:px-20">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between text-[7px] uppercase tracking-[0.28em] text-[#A39585]">
            <span>ART × MEMORY</span>
            <span className="hidden md:block">CURATED BY ARTMIND</span>
            <span>{String(total).padStart(2, "0")} WORKS</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. CATEGORY FILTER
      ===================================================== */}
      <section className="sticky top-20 z-30 border-b border-[#E0D7C8] bg-[#F7F4EF]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1500px] items-center gap-6 overflow-x-auto px-6 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-12 lg:px-20">
          <span className="shrink-0 border-r border-[#D8CFC0] pr-6 text-[8px] font-bold uppercase tracking-[0.28em] text-[#9B2C2C]">
            CHUYÊN MỤC
          </span>

          <button
            type="button"
            onClick={() => handleCategoryChange("")}
            aria-pressed={!active}
            className={`shrink-0 border-b px-1 py-2 text-[9px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B2C2C] ${
              !active
                ? "border-[#9B2C2C] text-[#9B2C2C]"
                : "border-transparent text-[#7A6C63] hover:text-[#2A2421]"
            }`}
          >
            TẤT CẢ
          </button>

          {cats.map((category) => {
            const isActive = active === category._id;

            return (
              <button
                key={category._id}
                type="button"
                onClick={() => handleCategoryChange(category._id)}
                aria-pressed={isActive}
                className={`shrink-0 border-b px-1 py-2 text-[9px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B2C2C] ${
                  isActive
                    ? "border-[#9B2C2C] text-[#9B2C2C]"
                    : "border-transparent text-[#7A6C63] hover:text-[#2A2421]"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          3. ARTWORK DIRECTORY
      ===================================================== */}
      <section ref={directoryRef} className="scroll-mt-40 bg-[#F7F4EF] px-6 py-24 md:px-12 md:py-28 lg:px-20">
        <div className="mx-auto max-w-[1450px]">
          <header
            data-reveal="rise"
            className="mb-12 grid gap-8 border-b border-[#D8CFC0] pb-8 md:grid-cols-[1fr_auto] md:items-end"
          >
            <div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                  I / Artwork directory
                </span>
                <span
                  data-reveal="line"
                  style={{ "--reveal-delay": "180ms" }}
                  className="h-px w-20 bg-[#C8BBA8]"
                />
              </div>

              <h2 className="mt-5 font-['Playfair_Display'] text-4xl font-medium tracking-[-0.03em] text-[#2A2421] md:text-6xl">
                Kho lưu trữ <em className="font-normal text-[#9B2C2C]">nghệ thuật.</em>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#524640]">
                {activeCategory
                  ? `Đang xem tuyển chọn thuộc chuyên mục “${activeCategory.name}”.`
                  : "Khám phá toàn bộ tác phẩm đang có trong bộ sưu tập ArtMind."}
              </p>
            </div>

            <div className="flex items-end gap-3">
              <span className="font-['Playfair_Display'] text-5xl font-normal leading-none text-[#9B2C2C] md:text-6xl">
                {String(total).padStart(2, "0")}
              </span>
              <span className="pb-1 text-[8px] uppercase leading-4 tracking-[0.22em] text-[#7A6C63]">
                hồ sơ
                <br />
                tác phẩm
              </span>
            </div>
          </header>

          {loading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 border-y border-[#D8CFC0]">
              <Loader />
              <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#7A6C63]">
                ĐANG MỞ KHO LƯU TRỮ
              </span>
            </div>
          ) : items.length ? (
            <div
              key={`gallery-${active || "all"}-${page}-${items.length}`}
              data-reveal="soft"
              style={{ "--reveal-delay": "100ms" }}
            >
              <GalleryGrid
                items={items}
                onAddToCollection={handleAddToCollection}
                onRemoveFromCollection={handleRemoveFromCollection}
                savedItemIds={savedItemIds}
                pendingItemIds={pendingItemIds}
                collectionMode="toggle"
              />
            </div>
          ) : (
            <div
              data-reveal="rise"
              className="flex min-h-[390px] flex-col items-center justify-center border-y border-[#D8CFC0] bg-[#EDE6D8] px-6 text-center"
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
                Chuyên mục này hiện chưa có tác phẩm trong kho lưu trữ ArtMind.
              </p>
              <button
                type="button"
                onClick={() => handleCategoryChange("")}
                className="group mt-8 inline-flex items-center gap-5 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B2C2C]"
              >
                XEM TẤT CẢ
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <nav
              aria-label="Phân trang tác phẩm"
              className="mt-16 flex flex-col items-center gap-6 border-t border-[#D8CFC0] pt-8"
            >
              <p role="status" className="text-center text-sm text-[#7A6C63]">
                Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total} tác phẩm
                <span className="ml-2">· Trang {page} / {totalPages}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  aria-label="Trang trước"
                  className="min-h-11 border border-[#D8CFC0] px-4 text-sm text-[#524640] transition-colors hover:border-[#9B2C2C] hover:text-[#9B2C2C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B2C2C] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Trước
                </button>

                {pageNumbers.map((number) =>
                  typeof number === "number" ? (
                    <button
                      key={number}
                      type="button"
                      onClick={() => handlePageChange(number)}
                      aria-label={`Trang ${number}`}
                      aria-current={page === number ? "page" : undefined}
                      className={`grid h-11 min-w-11 place-items-center border px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B2C2C] ${
                        page === number
                          ? "border-[#9B2C2C] bg-[#9B2C2C] text-[#F7F4EF]"
                          : "border-[#D8CFC0] text-[#524640] hover:border-[#9B2C2C] hover:text-[#9B2C2C]"
                      }`}
                    >
                      {number}
                    </button>
                  ) : (
                    <span key={number} aria-hidden="true" className="px-1 text-[#7A6C63]">
                      …
                    </span>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Trang sau"
                  className="min-h-11 border border-[#D8CFC0] px-4 text-sm text-[#524640] transition-colors hover:border-[#9B2C2C] hover:text-[#9B2C2C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B2C2C] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sau →
                </button>
              </div>
            </nav>
          )}
        </div>
      </section>

      {authRequiredOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1C1715]/70 px-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="collection-auth-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAuthRequiredOpen(false);
          }}
        >
          <div className="w-full max-w-md border border-[#D8CFC0] bg-[#F7F4EF] p-7 shadow-2xl md:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#9B2C2C]">
                  Personal collection
                </span>
                <h3
                  id="collection-auth-title"
                  className="mt-3 font-['Playfair_Display'] text-3xl font-medium tracking-[-0.025em] text-[#2A2421]"
                >
                  Đăng nhập để lưu tác phẩm.
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setAuthRequiredOpen(false)}
                className="grid h-9 w-9 shrink-0 place-items-center border border-[#D8CFC0] text-lg text-[#524640] transition hover:border-[#9B2C2C] hover:text-[#9B2C2C]"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <p className="mt-5 text-sm leading-7 text-[#524640]">
              Bạn cần có tài khoản ArtMind để thêm tác phẩm vào bộ sưu tập cá nhân và xem lại sau.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => goToAuth("/login")}
                className="inline-flex items-center justify-center bg-[#9B2C2C] px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#7f2323]"
              >
                ĐĂNG NHẬP
              </button>
              <button
                type="button"
                onClick={() => goToAuth("/register")}
                className="inline-flex items-center justify-center border border-[#9B2C2C] px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B2C2C] transition hover:bg-[#9B2C2C] hover:text-white"
              >
                TẠO TÀI KHOẢN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          4. CLOSING NOTE
      ===================================================== */}
      <section className="relative overflow-hidden border-t border-[#E0D7C8] bg-[#EAE2D2] px-6 py-24 text-center md:px-12 md:py-32">
        <span className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 font-['Playfair_Display'] text-[180px] leading-none text-[#9B2C2C]/[0.07] md:text-[240px]">
          “
        </span>

        <div data-reveal="rise" className="relative mx-auto max-w-5xl">
          <span className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#9B2C2C]">
            GALLERY / ARTMIND ARCHIVE
          </span>

          <blockquote className="mx-auto mt-8 max-w-4xl font-['Playfair_Display'] text-4xl font-medium leading-[1.08] tracking-[-0.025em] text-[#2A2421] md:text-6xl">
            Mỗi tác phẩm là một
            <br />
            <em className="font-normal text-[#9B2C2C]">dấu vết của thời gian.</em>
          </blockquote>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#524640]">
            Một bộ sưu tập không chỉ giữ lại hình ảnh. Nó giữ lại những cách nhìn,
            những bối cảnh và những điều từng khiến con người dừng lại.
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
