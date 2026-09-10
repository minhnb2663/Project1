import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../redux/AuthContext";
import GalleryGrid from "../components/gallery/GalleryGrid";
import Loader from "../components/common/Loader";
import {
  clearCollection,
  getCollection,
  removeFromCollection,
} from "../services/collectionApi";

function useRevealOnScroll(refreshKey) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    // Progressive enhancement: nội dung vẫn hiển thị nếu JS/observer không hoạt động.
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

export default function CollectionPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
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
    if (authLoading) return undefined;

    if (!user) {
      setItems([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    getCollection()
      .then((response) => {
        if (!cancelled) setItems(response.data || []);
      })
      .catch((error) => {
        if (cancelled) return;
        setItems([]);
        toast.error(
          error?.response?.data?.message || "Không thể tải bộ sưu tập lúc này.",
        );
        console.error("Load collection failed:", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const savedItemIds = useMemo(
    () =>
      new Set(
        items
          .map((item) => item?._id || item?.id)
          .filter(Boolean)
          .map(String),
      ),
    [items],
  );

  const handleRemoveFromCollection = async (item) => {
    const itemId = item?._id || item?.id;
    if (!itemId) return;

    const normalizedId = String(itemId);
    if (pendingItemIds.has(normalizedId)) return;

    const previousItems = items;

    setPendingItemIds((current) => {
      const next = new Set(current);
      next.add(normalizedId);
      return next;
    });

    // Optimistic UI
    setItems((current) =>
      current.filter(
        (savedItem) =>
          String(savedItem?._id || savedItem?.id) !== normalizedId,
      ),
    );

    try {
      await removeFromCollection(itemId);
      toast.success("Đã bỏ tác phẩm khỏi bộ sưu tập");

      window.dispatchEvent(
        new CustomEvent("artmind:collection-updated", {
          detail: { action: "remove", paintingId: normalizedId },
        }),
      );
    } catch (error) {
      setItems(previousItems);
      toast.error(
        error?.response?.data?.message ||
          "Không thể xóa tác phẩm khỏi bộ sưu tập.",
      );
      console.error("Remove from collection failed:", error);
    } finally {
      setPendingItemIds((current) => {
        const next = new Set(current);
        next.delete(normalizedId);
        return next;
      });
    }
  };

  const handleClearCollection = async () => {
    if (!items.length || clearing) return;

    const previousItems = items;
    setClearing(true);
    setItems([]);

    try {
      await clearCollection();
      toast.success("Đã xóa toàn bộ bộ sưu tập");

      window.dispatchEvent(
        new CustomEvent("artmind:collection-updated", {
          detail: { action: "clear" },
        }),
      );
    } catch (error) {
      setItems(previousItems);
      toast.error(
        error?.response?.data?.message || "Không thể xóa bộ sưu tập lúc này.",
      );
      console.error("Clear collection failed:", error);
    } finally {
      setClearing(false);
    }
  };

  useRevealOnScroll(
    `${authLoading ? "auth" : "ready"}-${loading ? "loading" : "loaded"}-${items.length}-${clearing ? "clearing" : "idle"}`,
  );

  if (authLoading || loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F4EF]">
        <div className="flex flex-col items-center gap-5">
          <Loader />
          <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#7A6C63]">
            ĐANG MỞ BỘ SƯU TẬP
          </span>
        </div>
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

        @keyframes collectionDrift {
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

          .collection-motion {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
      <section className="relative overflow-hidden border-b border-[#3D332E] bg-[#1C1715] px-6 pb-14 pt-28 text-[#F7F4EF] md:px-12 md:pb-16 md:pt-32 lg:px-20">
        <div className="collection-motion pointer-events-none absolute -inset-[8%] opacity-[0.14] [animation:collectionDrift_16s_ease-in-out_infinite] [background-image:radial-gradient(circle_at_16%_20%,#D4AF37_0,transparent_24%),radial-gradient(circle_at_84%_38%,#9B2C2C_0,transparent_23%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:84px_84px]" />

        <div className="relative mx-auto max-w-[1450px]">
          <div data-reveal="soft" style={{ "--reveal-delay": "60ms" }} className="flex items-center gap-4 text-[8px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            <span className="h-px w-10 bg-[#D4AF37]" />
            ARTMIND / PERSONAL COLLECTION
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div data-reveal="rise" style={{ "--reveal-delay": "110ms" }}>
              <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#A39585]">
                Selected by you
              </p>
              <h1 className="max-w-5xl font-['Playfair_Display'] text-5xl font-medium leading-[0.92] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[92px]">
                Bộ sưu tập
                <br />
                <em className="font-normal text-[#D4AF37]">yêu thích</em>
                <span className="text-[#9B2C2C]">.</span>
              </h1>
            </div>

            <div data-reveal="soft" style={{ "--reveal-delay": "180ms" }} className="border-t border-[#4A3E38] pt-6 lg:w-[310px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="font-['Playfair_Display'] text-xl leading-snug text-[#F7F4EF]">
                Không gian riêng cho những tác phẩm khiến bạn muốn dừng lại lâu hơn.
              </p>
              <p className="mt-4 text-sm leading-7 text-[#BBAF9F]">
                Những tác phẩm bạn lưu từ Gallery sẽ xuất hiện tại đây để xem lại bất cứ lúc nào.
              </p>
            </div>
          </div>

          <div data-reveal="soft" style={{ "--reveal-delay": "230ms" }} className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-[#3D332E] pt-5">
            <div className="flex items-end gap-3">
              <span className="font-['Playfair_Display'] text-5xl leading-none text-[#D4AF37]">
                {String(items.length).padStart(2, "0")}
              </span>
              <span className="pb-1 text-[8px] uppercase leading-4 tracking-[0.22em] text-[#A39585]">
                tác phẩm
                <br />
                đã lưu
              </span>
            </div>

            <Link
              to="/gallery"
              className="group inline-flex items-center gap-4 border-b border-[#D4AF37] pb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#F7F4EF] transition hover:text-[#D4AF37]"
            >
              KHÁM PHÁ THÊM
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 md:py-24 lg:px-20">
        <div className="mx-auto max-w-[1450px]">
          <header data-reveal="rise" className="mb-12 grid gap-7 border-b border-[#D8CFC0] pb-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                  I / Saved artwork
                </span>
                <span
                  data-reveal="line"
                  style={{ "--reveal-delay": "180ms" }}
                  className="h-px w-20 bg-[#C8BBA8]"
                />
              </div>
              <h2 className="mt-4 font-['Playfair_Display'] text-4xl font-medium tracking-[-0.03em] md:text-6xl">
                Những tác phẩm{" "}
                <em className="font-normal text-[#9B2C2C]">bạn đã chọn.</em>
              </h2>
            </div>

            {!!items.length && (
              <button
                type="button"
                onClick={handleClearCollection}
                disabled={clearing}
                className="justify-self-start border-b border-[#9B2C2C]/40 pb-1 text-[8px] font-bold uppercase tracking-[0.22em] text-[#9B2C2C] transition hover:border-[#9B2C2C] disabled:cursor-not-allowed disabled:opacity-50 md:justify-self-end"
              >
                {clearing ? "ĐANG XÓA..." : "XÓA TẤT CẢ"}
              </button>
            )}
          </header>

          {items.length ? (
            <div
              key={`collection-${items.length}`}
              data-reveal="soft"
              style={{ "--reveal-delay": "100ms" }}
            >
              <GalleryGrid
                items={items}
                onRemoveFromCollection={handleRemoveFromCollection}
                savedItemIds={savedItemIds}
                pendingItemIds={pendingItemIds}
                collectionMode="remove"
              />
            </div>
          ) : (
            <div data-reveal="rise" className="flex min-h-[430px] flex-col items-center justify-center border-y border-[#D8CFC0] bg-[#EDE6D8] px-6 text-center">
              <span className="font-['Playfair_Display'] text-7xl text-[#9B2C2C]/25">◇</span>
              <span className="mt-5 text-[8px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                Empty collection
              </span>
              <h3 className="mt-4 font-['Playfair_Display'] text-3xl font-medium md:text-4xl">
                Bộ sưu tập của bạn đang trống.
              </h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#524640]">
                Khi bắt gặp một tác phẩm bạn yêu thích trong Gallery, hãy thêm nó vào bộ sưu tập. Tác phẩm sẽ xuất hiện tại đây.
              </p>
              <Link
                to="/gallery"
                className="group mt-8 inline-flex items-center gap-5 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528]"
              >
                ĐẾN GALLERY
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[#E0D7C8] bg-[#EAE2D2] px-6 py-20 text-center md:px-12 md:py-24">
        <div data-reveal="rise" className="mx-auto max-w-4xl">
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
            ARTMIND / YOUR ARCHIVE
          </span>
          <blockquote className="mt-7 font-['Playfair_Display'] text-3xl font-medium leading-[1.12] tracking-[-0.025em] md:text-5xl">
            Một bộ sưu tập bắt đầu từ
            <br />
            <em className="font-normal text-[#9B2C2C]">một khoảnh khắc rung động.</em>
          </blockquote>
        </div>
      </section>
    </main>
  );
}
