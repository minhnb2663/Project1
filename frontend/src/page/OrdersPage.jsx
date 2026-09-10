import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { myOrders } from "../services/orderApi";
import Loader from "../components/common/Loader";

const money = (v) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(v || 0);

const labels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const statusStyle = {
  pending: "border-[#D4AF37]/55 bg-[#D4AF37]/10 text-[#B89528]",
  confirmed: "border-[#D0C5B6]/35 bg-white/[0.04] text-[#D0C5B6]",
  shipping: "border-[#78948E]/55 bg-[#78948E]/10 text-[#A8C0BA]",
  completed: "border-[#839B79]/55 bg-[#839B79]/10 text-[#B4C8AA]",
  cancelled: "border-[#9B2C2C]/55 bg-[#9B2C2C]/10 text-[#D98C8C]",
};

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const heroRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Luôn đưa trang về đầu khi component được load/reload.
    const previousScrollRestoration = window.history.scrollRestoration;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  useEffect(() => {
    myOrders()
      .then((x) => setOrders(x.data || []))
      .catch(() => setOrders([]));
  }, []);

  const handlePointerMove = (event) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setPointer({
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const resetPointer = () => setPointer({ x: 0, y: 0 });

  if (!orders) return <Loader />;

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F4EF] text-[#2A2421] selection:bg-[#9B2C2C] selection:text-[#F7F4EF]">
      <style>{`
        /* Safe motion: content is visible by default.
           If CSS animation fails or JS is delayed, no text can remain hidden. */
        [data-order-reveal] {
          --reveal-delay: 90ms;
          opacity: 1;
          transform: none;
          filter: none;
        }

        [data-order-reveal="rise"] {
          animation: ordersRevealRise 900ms cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay) both;
        }

        [data-order-reveal="soft"] {
          animation: ordersRevealSoft 850ms cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay) both;
        }

        [data-order-reveal="line"] {
          transform-origin: left center;
          animation: ordersRevealLine 900ms cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay) both;
        }

        @keyframes ordersRevealRise {
          from { transform: translate3d(0, 34px, 0); filter: blur(2px); }
          to { transform: translate3d(0, 0, 0); filter: blur(0); }
        }

        @keyframes ordersRevealSoft {
          from { transform: translate3d(0, 20px, 0); }
          to { transform: translate3d(0, 0, 0); }
        }

        @keyframes ordersRevealLine {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes ordersDrift {
          0%, 100% { transform: translate3d(-2%, -1%, 0) scale(1); }
          50% { transform: translate3d(2%, 1.5%, 0) scale(1.04); }
        }

        @keyframes ordersFloat {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-10px,0); }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-order-reveal] {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            animation: none !important;
            transition: none !important;
          }

          .orders-motion {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          01. HERO / ORDER ARCHIVE COVER
      ===================================================== */}
      <section
        ref={heroRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={resetPointer}
        className="relative min-h-[560px] overflow-hidden border-b border-[#3D332E] bg-[#1C1715] text-[#F7F4EF] md:min-h-[620px]"
      >
        <div className="orders-motion pointer-events-none absolute -inset-[8%] opacity-[0.18] [animation:ordersDrift_14s_ease-in-out_infinite] [background-image:radial-gradient(circle_at_20%_20%,#D4AF37_0,transparent_28%),radial-gradient(circle_at_78%_38%,#9B2C2C_0,transparent_26%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10 mx-auto grid min-h-[560px] max-w-[1600px] md:min-h-[620px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative flex flex-col justify-between border-[#3D332E] px-6 pb-12 pt-28 md:px-12 lg:border-r lg:px-16 lg:pb-14 xl:px-24">
            <div>
              <div className="mb-10 flex items-center gap-4 text-[9px] font-semibold tracking-[0.34em] text-[#D4AF37]">
                <span className="h-px w-12 bg-[#D4AF37]" />
                ARTMIND / ORDER ARCHIVE
              </div>

              <div className="relative">
                <span className="absolute -top-7 left-0 font-['Playfair_Display'] text-[11px] italic tracking-[0.22em] text-[#D4AF37]/80">
                  Collection MMXXVI
                </span>

                <h1
                  className="orders-motion font-['Playfair_Display'] text-[58px] font-medium leading-[0.88] tracking-[-0.045em] sm:text-[74px] md:text-[92px] xl:text-[112px]"
                  style={{
                    transform: `translate3d(${pointer.x * -9}px, ${pointer.y * -9}px, 0)`,
                  }}
                >
                  Đơn hàng
                  <span className="text-[#D4AF37]">/</span>
                  <br />
                  <em className="font-normal text-[#9B2C2C]">của bạn.</em>
                </h1>
              </div>

              <div className="mt-10 grid max-w-2xl gap-8 sm:grid-cols-[1fr_1.1fr] sm:items-start">
                <p className="font-['Playfair_Display'] text-2xl leading-tight text-[#F7F4EF] md:text-3xl">
                  Mỗi lựa chọn là một phần của
                  <em className="font-normal text-[#D4AF37]"> bộ sưu tập riêng.</em>
                </p>

                <div className="border-l border-[#4A3E38] pl-6">
                  <p className="text-sm leading-7 text-[#D0C5B6]">
                    Theo dõi trạng thái, giá trị và những tác phẩm bạn đã lựa chọn
                    trong một không gian nhất quán với trải nghiệm ArtMind.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-end justify-between gap-6 border-t border-[#3D332E] pt-6">
              <div className="text-[8px] uppercase leading-5 tracking-[0.25em] text-[#A39585]">
                Collected with intention
                <br />
                Remembered with feeling
              </div>
              <div className="font-['Playfair_Display'] text-3xl italic text-[#D4AF37]/60">05</div>
            </div>
          </div>

          <div className="relative flex min-h-[360px] items-end overflow-hidden bg-[#120F0E] p-7 md:p-10 lg:min-h-full lg:p-12">
            <div
              className="orders-motion absolute left-[12%] top-[10%] h-[58%] w-[58%] border border-[#D4AF37]/20 bg-[#D4AF37]/[0.035]"
              style={{
                transform: `translate3d(${pointer.x * 12}px, ${pointer.y * 12}px, 0) rotate(-4deg)`,
              }}
            />
            <div
              className="orders-motion absolute right-[10%] top-[20%] h-[48%] w-[44%] border border-[#9B2C2C]/25 bg-[#9B2C2C]/[0.04]"
              style={{
                transform: `translate3d(${pointer.x * -16}px, ${pointer.y * -16}px, 0) rotate(5deg)`,
              }}
            />
            <span className="orders-motion absolute right-6 top-0 font-['Playfair_Display'] text-[210px] italic leading-none text-white/[0.025] [animation:ordersFloat_7s_ease-in-out_infinite] md:text-[280px]">
              O
            </span>

            <div className="relative z-10 w-full border-t border-white/20 pt-7">
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Collection status
              </p>
              <div className="mt-4 flex items-end justify-between gap-6">
                <div>
                  <div className="font-['Playfair_Display'] text-6xl font-medium leading-none text-[#F7F4EF] md:text-7xl">
                    {String(orders.length).padStart(2, "0")}
                  </div>
                  <p className="mt-3 text-[9px] uppercase tracking-[0.25em] text-white/50">
                    Recorded orders
                  </p>
                </div>

                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-4 border-b border-[#D4AF37] pb-2 text-[8px] font-bold tracking-[0.22em] text-[#F7F4EF]"
                >
                  TIẾP TỤC KHÁM PHÁ
                  <span className="text-base transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          02. PURCHASE RECORDS
      ===================================================== */}
      <section className="border-b border-[#E0D7C8] bg-[#ECE4D5] px-6 py-20 md:px-12 md:py-28 lg:px-20">
        <div className="mx-auto max-w-[1500px]">
          <header
            data-order-reveal="rise"
            className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end"
          >
            <div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                  I / Purchase records
                </span>
                <span
                  data-order-reveal="line"
                  style={{ "--reveal-delay": "160ms" }}
                  className="h-px w-20 bg-[#C8BBA8]"
                />
              </div>

              <h2 className="mt-5 font-['Playfair_Display'] text-5xl font-medium tracking-[-0.03em] text-[#2A2421] md:text-7xl">
                Lịch sử <em className="font-normal text-[#9B2C2C]">sưu tập.</em>
              </h2>
            </div>

            <div className="flex items-end gap-3 border-l border-[#C8BBA8] pl-6">
              <b className="font-['Playfair_Display'] text-5xl font-normal text-[#D4AF37]">
                {String(orders.length).padStart(2, "0")}
              </b>
              <span className="pb-1 text-[8px] uppercase tracking-[0.25em] text-[#7A6C63]">
                Orders
              </span>
            </div>
          </header>

          {orders.length ? (
            <div className="border-t border-[#CFC3B1]">
              {orders.map((order, index) => (
                <article
                  key={order._id}
                  data-order-reveal="rise"
                  style={{ "--reveal-delay": `${80 + index * 95}ms` }}
                  className="group relative grid gap-7 overflow-hidden border-b border-[#CFC3B1] py-8 transition-[padding,background-color] duration-700 hover:bg-white/35 hover:px-4 md:grid-cols-[1.15fr_0.9fr] md:items-center lg:grid-cols-[1.1fr_330px_170px_160px] lg:gap-8"
                >
                  <span className="pointer-events-none absolute right-4 top-2 font-['Playfair_Display'] text-[84px] italic leading-none text-[#2A2421]/[0.035] transition duration-700 group-hover:text-[#9B2C2C]/[0.06]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#8A7768]">
                      <span className="h-px w-6 bg-[#D4AF37]" />
                      #{order._id.slice(-8).toUpperCase()}
                    </div>

                    <h3 className="mt-4 font-['Playfair_Display'] text-3xl font-medium leading-tight text-[#2A2421]">
                      {order.items.length} tác phẩm
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[8px] uppercase tracking-[0.2em] text-[#7A6C63]">
                      <span>ArtMind collection order</span>
                      <span className="h-1 w-1 rotate-45 bg-[#9B2C2C]" />
                      <span>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-end -space-x-2.5">
                    {order.items.slice(0, 4).map((x, imageIndex) => (
                      <div
                        key={`${x.painting}-${imageIndex}`}
                        className="relative h-24 w-20 overflow-hidden border-[3px] border-[#ECE4D5] bg-[#1C1715] shadow-[0_12px_28px_rgba(42,36,33,0.13)] transition duration-700 group-hover:-translate-y-1"
                        style={{ transform: `rotate(${(imageIndex - 1.5) * 1.4}deg)` }}
                      >
                        <img
                          src={x.image}
                          alt={x.title}
                          className="h-full w-full object-cover transition duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    ))}

                    {order.items.length > 4 && (
                      <div className="relative flex h-24 w-20 items-center justify-center border-[3px] border-[#ECE4D5] bg-[#1C1715] text-[9px] font-bold tracking-[0.12em] text-[#D4AF37] shadow-[0_12px_28px_rgba(42,36,33,0.13)]">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="relative z-10">
                    <span className="block text-[7px] font-bold uppercase tracking-[0.25em] text-[#8A7768]">
                      Total value
                    </span>
                    <b className="mt-2 block font-['Playfair_Display'] text-2xl font-medium text-[#9B2C2C]">
                      {money(order.total)}
                    </b>
                  </div>

                  <div className="relative z-10 lg:text-right">
                    <span
                      className={`inline-flex border px-3.5 py-2 text-[8px] font-bold uppercase tracking-[0.12em] ${
                        statusStyle[order.status] || statusStyle.pending
                      }`}
                    >
                      {labels[order.status] || order.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              data-order-reveal="rise"
              className="relative flex min-h-[470px] flex-col items-center justify-center overflow-hidden border border-[#CFC3B1] bg-[#F7F4EF] px-6 text-center"
            >
              <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-['Playfair_Display'] text-[300px] leading-none text-[#9B2C2C]/[0.025]">
                ◇
              </span>
              <span className="relative font-['Playfair_Display'] text-7xl leading-none text-[#D4AF37]/60">◇</span>
              <span className="relative mt-5 text-[8px] font-bold uppercase tracking-[0.32em] text-[#9B2C2C]">
                Empty archive
              </span>
              <h2 className="relative mt-5 font-['Playfair_Display'] text-4xl font-medium text-[#2A2421] md:text-5xl">
                Chưa có đơn hàng.
              </h2>
              <p className="relative mt-5 max-w-md text-sm leading-7 text-[#6F6259]">
                Khi bạn lựa chọn một tác phẩm, lịch sử sưu tập của bạn sẽ xuất hiện tại đây.
              </p>
              <Link
                to="/gallery"
                className="group relative mt-9 inline-flex items-center gap-5 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528] hover:shadow-[0_10px_30px_rgba(212,175,55,0.18)]"
              >
                VÀO PHÒNG TRANH
                <span className="text-base transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          03. CLOSING NOTE
      ===================================================== */}
      <section className="relative overflow-hidden bg-[#1C1715] px-6 py-24 text-center text-[#F7F4EF] md:px-12 md:py-32">
        <span className="orders-motion absolute left-1/2 top-0 -translate-x-1/2 font-['Playfair_Display'] text-[190px] leading-none text-white/[0.025] [animation:ordersFloat_6s_ease-in-out_infinite] md:text-[260px]">
          “
        </span>

        <div data-order-reveal="rise" className="relative mx-auto max-w-5xl">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#D4AF37]">
            ArtMind / Collection note
          </p>

          <blockquote className="mt-8 font-['Playfair_Display'] text-4xl font-medium leading-[1.08] tracking-[-0.025em] md:text-6xl">
            Mỗi tác phẩm được chọn
            <br />
            <em className="font-normal text-[#D4AF37]">đều trở thành một phần câu chuyện.</em>
          </blockquote>

          <div className="mx-auto mt-10 flex max-w-md items-center gap-5">
            <span className="h-px flex-1 bg-[#4A3E38]" />
            <span className="text-[8px] uppercase tracking-[0.28em] text-[#A39585]">
              Your ArtMind Collection
            </span>
            <span className="h-px flex-1 bg-[#4A3E38]" />
          </div>
        </div>
      </section>
    </main>
  );
}
