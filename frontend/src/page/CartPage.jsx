import { useEffect, useLayoutEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../redux/CartContext";
import { useAuth } from "../redux/AuthContext";
import { createOrder } from "../services/orderApi";

// Prevent the browser from restoring the previous scroll position on reload.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

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

export default function Cart() {
  const cart = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  const [checkout, setCheckout] = useState(false);
  const [busy, setBusy] = useState(false);

  const [shipping, setShipping] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    note: "",
  });

  // Always start Cart at the top. useLayoutEffect runs before paint,
  // matching the scroll-restoration behavior used on HomePage.
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

  useRevealOnScroll(`${cart.items.length}-${checkout ? "checkout" : "summary"}`);

  // =========================
  // PHÍ VẬN CHUYỂN
  // =========================
  const fee = cart.subtotal >= 10000000 ? 0 : 250000;

  // =========================
  // TẠO ĐƠN HÀNG
  // =========================
  const submit = async (e) => {
    e.preventDefault();

    if (!user) {
      return nav("/login", {
        state: { from: "/cart" },
      });
    }

    setBusy(true);

    try {
      const response = await createOrder({
        items: cart.items.map((x) => ({
          painting: x._id,
          quantity: x.quantity,
        })),
        shipping,
      });

      cart.clear();

      toast.success("Đơn hàng đã được tạo");

      nav(`/orders?created=${response.data._id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F4EF] text-[#2A2421] selection:bg-[#9B2C2C] selection:text-[#F7F4EF]">
      <style>{`
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

        [data-reveal].is-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }

        @keyframes artmindCartDrift {
          0%, 100% { transform: translate3d(-2%, -1%, 0) scale(1); }
          50% { transform: translate3d(2%, 1.5%, 0) scale(1.04); }
        }

        @keyframes artmindCartFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -12px, 0); }
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

          .artmind-cart-motion {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
      {/* =====================================================
          1. HEADER GIỎ HÀNG
      ===================================================== */}
      <section className="relative overflow-hidden border-b border-[#3D332E] bg-[#1C1715] px-6 py-20 text-[#F7F4EF] md:px-12 lg:px-20">
        <div className="artmind-cart-motion pointer-events-none absolute -inset-[8%] opacity-[0.18] [animation:artmindCartDrift_14s_ease-in-out_infinite] [background-image:radial-gradient(circle_at_20%_20%,#D4AF37_0,transparent_28%),radial-gradient(circle_at_78%_38%,#9B2C2C_0,transparent_26%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />

        {/* CHỮ TRANG TRÍ */}
        <span className="absolute -right-12 -top-24 hidden font-['Playfair_Display'] text-[300px] leading-none text-[#F7F4EF]/[0.025] lg:block">
          C
        </span>

        {/* VÒNG TRÒN */}
        <div className="absolute -left-48 -top-48 h-[520px] w-[520px] rounded-full border border-[#D4AF37]/10" />

        <div className="absolute -left-24 -top-24 h-[320px] w-[320px] rounded-full border border-[#D4AF37]/10" />

        <div className="relative mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[1fr_0.5fr] lg:items-end">
          {/* TITLE */}
          <div>
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-[#D4AF37]" />

              <span className="text-[8px] font-bold tracking-[4px] text-[#D4AF37]">
                ARTMIND SHOP / PRIVATE COLLECTION
              </span>
            </div>

            <h1 className="mt-7 font-['Playfair_Display'] text-5xl font-medium leading-[0.95] sm:text-6xl lg:text-[78px]">
              Giỏ hàng
              <br />
              <em className="font-normal text-[#D4AF37]">của bạn.</em>
            </h1>
          </div>

          {/* DESCRIPTION */}
          <div className="border-l border-[#4A3E38] pl-6">
            <span className="font-['Playfair_Display'] text-4xl text-[#D4AF37]">
              {String(cart.count).padStart(2, "0")}
            </span>

            <p className="mt-3 max-w-sm text-sm leading-7 text-[#D0C5B6]">
              {cart.count} tác phẩm đang chờ được đưa về không gian của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. GIỎ HÀNG TRỐNG
      ===================================================== */}
      {!cart.items.length ? (
        <section className="px-6 py-20 md:px-12 lg:px-20">
          <div data-reveal="rise" className="mx-auto flex min-h-[480px] max-w-[1100px] flex-col items-center justify-center border border-dashed border-[#D8CFC0] bg-[#EDE6D8] text-center">
            <span className="font-['Playfair_Display'] text-7xl text-[#9B2C2C]/30">
              ◇
            </span>

            <span className="mt-5 text-[8px] font-bold tracking-[4px] text-[#9B2C2C]">
              EMPTY COLLECTION
            </span>

            <h2 className="mt-5 font-['Playfair_Display'] text-3xl font-medium md:text-4xl">
              Giỏ hàng đang trống.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-[#524640]">
              Hãy chọn một tác phẩm khiến bạn muốn dừng lại lâu hơn.
            </p>

            <Link
              to="/gallery"
              className="group mt-8 inline-flex items-center gap-6 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528] hover:shadow-[0_10px_30px_rgba(212,175,55,0.18)]"
            >
              KHÁM PHÁ PHÒNG TRANH
              <span className="transition group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </Link>
          </div>
        </section>
      ) : (
        /* =====================================================
            3. CÓ SẢN PHẨM TRONG GIỎ
        ===================================================== */
        <section className="px-6 py-16 md:px-12 lg:px-20">
          <div className="mx-auto grid max-w-[1500px] gap-12 xl:grid-cols-[1fr_390px]">
            {/* =================================================
                DANH SÁCH TRANH
            ================================================= */}
            <section>
              {/* HEADER */}
              <div data-reveal="rise" className="mb-7 flex items-end justify-between border-b border-[#D8CFC0] pb-5">
                <div>
                  <span className="text-[8px] font-bold tracking-[3px] text-[#9B2C2C]">
                    01 / SELECTED WORKS
                  </span>

                  <h2 className="mt-3 font-['Playfair_Display'] text-3xl font-medium">
                    Tác phẩm đã chọn
                  </h2>
                </div>

                <span className="text-[8px] tracking-[2px] text-[#7A6C63]">
                  {String(cart.items.length).padStart(2, "0")} WORKS
                </span>
              </div>

              {/* =================================================
                  TỪNG SẢN PHẨM
              ================================================= */}
              <div className="border-t border-[#D8CFC0]">
                {cart.items.map((item, index) => (
                  <article
                    key={item._id}
                    data-reveal="soft"
                    style={{ "--reveal-delay": `${90 + index * 110}ms` }}
                    className="group relative grid gap-6 border-b border-[#D8CFC0] py-7 transition-colors duration-500 hover:bg-white/30 md:grid-cols-[50px_120px_1fr_auto] md:items-center"
                  >
                    {/* SỐ THỨ TỰ */}
                    <span className="font-['Playfair_Display'] text-xl text-[#D4AF37]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* ẢNH TRANH */}
                    <Link to={`/paintings/${item._id}`} className="block">
                      <div className="w-[120px] border border-[#D4AF37] bg-[#C8BBA8] p-1.5 shadow-[0_12px_30px_rgba(42,36,33,0.10)] transition duration-500 group-hover:-translate-y-1">
                        <div className="overflow-hidden border-[4px] border-[#1C1715]">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-[145px] w-full object-cover transition duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                          />
                        </div>
                      </div>
                    </Link>

                    {/* THÔNG TIN */}
                    <div>
                      <small className="text-[8px] font-bold uppercase tracking-[2px] text-[#7A6C63]">
                        {item.artist}
                      </small>

                      <h3 className="mt-2 font-['Playfair_Display'] text-2xl font-medium leading-tight">
                        <Link
                          to={`/paintings/${item._id}`}
                          className="transition hover:text-[#9B2C2C]"
                        >
                          {item.title}
                        </Link>
                      </h3>

                      <b className="mt-4 block font-['Playfair_Display'] text-lg font-normal text-[#9B2C2C]">
                        {money(item.price)}
                      </b>

                      {/* MOBILE QUANTITY */}
                      <div className="mt-5 flex items-center justify-between md:hidden">
                        <Quantity
                          quantity={item.quantity}
                          onDecrease={() =>
                            cart.update(item._id, item.quantity - 1)
                          }
                          onIncrease={() =>
                            cart.update(item._id, item.quantity + 1)
                          }
                        />

                        <button
                          onClick={() => cart.remove(item._id)}
                          className="text-[8px] font-bold tracking-[2px] text-[#9B2C2C] hover:text-[#6F1D1D]"
                        >
                          XÓA
                        </button>
                      </div>
                    </div>

                    {/* DESKTOP ACTION */}
                    <div className="hidden flex-col items-end gap-5 md:flex">
                      <Quantity
                        quantity={item.quantity}
                        onDecrease={() =>
                          cart.update(item._id, item.quantity - 1)
                        }
                        onIncrease={() =>
                          cart.update(item._id, item.quantity + 1)
                        }
                      />

                      <button
                        onClick={() => cart.remove(item._id)}
                        className="text-[7px] font-bold tracking-[2px] text-[#9B2C2C] transition hover:text-[#6F1D1D]"
                      >
                        XÓA KHỎI GIỎ
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* =================================================
                ORDER SUMMARY
            ================================================= */}
            <aside data-reveal="rise" style={{ "--reveal-delay": "180ms" }} className="self-start border border-[#C8BBA8] bg-[#EDE6D8] p-2 shadow-[0_18px_50px_rgba(42,36,33,0.08)] xl:sticky xl:top-28">
              <div className="border border-[#D8CFC0] bg-[#F7F4EF] p-7">
                {/* HEADER */}
                <div className="border-b border-[#D8CFC0] pb-6">
                  <span className="text-[8px] font-bold tracking-[3px] text-[#9B2C2C]">
                    02 / ORDER SUMMARY
                  </span>

                  <h2 className="mt-3 font-['Playfair_Display'] text-3xl font-medium">
                    Tổng đơn hàng
                  </h2>
                </div>

                {/* =================================================
                    GIÁ
                ================================================= */}
                <div className="py-6">
                  <SummaryRow label="Tạm tính" value={money(cart.subtotal)} />

                  <SummaryRow
                    label="Vận chuyển"
                    value={fee ? money(fee) : "Miễn phí"}
                  />

                  {/* THÔNG BÁO SHIP */}
                  <div className="mt-5 border-l border-[#D4AF37] pl-4">
                    <p className="text-[8px] leading-5 text-[#7A6C63]">
                      Miễn phí vận chuyển cho đơn hàng từ 10.000.000₫.
                    </p>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="border-y border-[#D8CFC0] py-6">
                  <span className="text-[8px] font-bold tracking-[2px] text-[#9B2C2C]">
                    TỔNG CỘNG
                  </span>

                  <b className="mt-3 block font-['Playfair_Display'] text-3xl font-medium text-[#2A2421]">
                    {money(cart.subtotal + fee)}
                  </b>
                </div>

                {/* =================================================
                    CHƯA MỞ CHECKOUT
                ================================================= */}
                {!checkout ? (
                  <button
                    onClick={() => {
                      if (!user) {
                        nav("/login", {
                          state: {
                            from: "/cart",
                          },
                        });
                        return;
                      }

                      setCheckout(true);
                    }}
                    className="group mt-7 flex w-full items-center justify-between bg-[#D4AF37] px-5 py-4 text-[8px] font-bold tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528] hover:shadow-[0_10px_30px_rgba(212,175,55,0.18)]"
                  >
                    TIẾP TỤC THANH TOÁN
                    <span className="transition group-hover:translate-x-1 group-hover:-translate-y-1">
                      ↗
                    </span>
                  </button>
                ) : (
                  /* =================================================
                      FORM GIAO HÀNG
                  ================================================= */
                  <form onSubmit={submit} data-reveal="soft" style={{ "--reveal-delay": "60ms" }} className="mt-7">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-[8px] font-bold tracking-[3px] text-[#9B2C2C]">
                        SHIPPING DETAILS
                      </span>

                      <button
                        type="button"
                        onClick={() => setCheckout(false)}
                        className="text-[7px] font-bold tracking-[1px] text-[#7A6C63] hover:text-[#9B2C2C]"
                      >
                        ← QUAY LẠI
                      </button>
                    </div>

                    {/* NGƯỜI NHẬN */}
                    <Field label="Người nhận">
                      <input
                        required
                        value={shipping.name}
                        onChange={(e) =>
                          setShipping({
                            ...shipping,
                            name: e.target.value,
                          })
                        }
                        placeholder="Họ và tên"
                        className={inputStyle}
                      />
                    </Field>

                    {/* ĐIỆN THOẠI */}
                    <Field label="Số điện thoại">
                      <input
                        required
                        pattern="[0-9 +]{9,15}"
                        value={shipping.phone}
                        onChange={(e) =>
                          setShipping({
                            ...shipping,
                            phone: e.target.value,
                          })
                        }
                        placeholder="09xx xxx xxx"
                        className={inputStyle}
                      />
                    </Field>

                    {/* ĐỊA CHỈ */}
                    <Field label="Địa chỉ">
                      <textarea
                        required
                        rows="3"
                        value={shipping.address}
                        onChange={(e) =>
                          setShipping({
                            ...shipping,
                            address: e.target.value,
                          })
                        }
                        placeholder="Địa chỉ nhận tác phẩm"
                        className={`${inputStyle} resize-none`}
                      />
                    </Field>

                    {/* GHI CHÚ */}
                    <Field label="Ghi chú">
                      <textarea
                        rows="2"
                        value={shipping.note}
                        onChange={(e) =>
                          setShipping({
                            ...shipping,
                            note: e.target.value,
                          })
                        }
                        placeholder="Ghi chú cho đơn hàng..."
                        className={`${inputStyle} resize-none`}
                      />
                    </Field>

                    {/* COD */}
                    <div className="mb-6 flex items-center gap-3 border border-[#D8CFC0] bg-[#EDE6D8] p-4 transition duration-300 hover:border-[#D4AF37]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#D4AF37] text-[#9B2C2C]">
                        ◇
                      </span>

                      <div>
                        <b className="block text-[8px] tracking-[2px] text-[#2A2421]">
                          THANH TOÁN COD
                        </b>

                        <small className="mt-1 block text-[8px] leading-4 text-[#7A6C63]">
                          Thanh toán khi nhận hàng.
                        </small>
                      </div>
                    </div>

                    {/* CONFIRM */}
                    <button
                      disabled={busy}
                      className="group flex w-full items-center justify-between bg-[#D4AF37] px-5 py-4 text-[8px] font-bold tracking-[0.22em] text-[#2A2421] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b89528] hover:shadow-[0_10px_30px_rgba(212,175,55,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>
                        {busy ? "ĐANG TẠO ĐƠN…" : "XÁC NHẬN ĐẶT HÀNG"}
                      </span>

                      <span className="transition group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* =====================================================
          4. FOOTER MESSAGE
      ===================================================== */}
      <section className="relative overflow-hidden border-t border-[#E0D7C8] bg-[#EAE2D2] px-6 py-20 text-center">
        <span className="artmind-cart-motion pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 font-['Playfair_Display'] text-[170px] leading-none text-[#9B2C2C]/[0.08] [animation:artmindCartFloat_6s_ease-in-out_infinite] md:text-[220px]">“</span>
        <div data-reveal="rise" className="relative">
        <span className="text-[8px] tracking-[4px] text-[#9B2C2C]">
          COLLECTED WITH INTENTION
        </span>

        <blockquote className="mx-auto mt-5 max-w-3xl font-['Playfair_Display'] text-3xl font-medium leading-tight md:text-5xl">
          Một tác phẩm không chỉ
          <br />
          <em className="font-normal text-[#9B2C2C]">lấp đầy một bức tường.</em>
        </blockquote>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#524640]">
          Nó trở thành một phần của không gian, ký ức và câu chuyện mà bạn lựa
          chọn giữ lại.
        </p>

        <div className="mx-auto mt-9 flex max-w-sm items-center gap-4">
          <span className="h-px flex-1 bg-[#C8BBA8]" />

          <span className="h-2 w-2 rotate-45 border border-[#9B2C2C]" />

          <span className="h-px flex-1 bg-[#C8BBA8]" />
        </div>
        </div>
      </section>
    </main>
  );
}

// =========================================================
// NÚT TĂNG / GIẢM SỐ LƯỢNG
// =========================================================
function Quantity({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center border border-[#D8CFC0]">
      <button
        type="button"
        onClick={onDecrease}
        className="flex h-9 w-9 items-center justify-center text-lg text-[#524640] transition hover:bg-[#EDE6D8] hover:text-[#9B2C2C]"
      >
        −
      </button>

      <strong className="flex h-9 min-w-10 items-center justify-center border-x border-[#D8CFC0] font-['Playfair_Display'] text-sm font-normal">
        {quantity}
      </strong>

      <button
        type="button"
        onClick={onIncrease}
        className="flex h-9 w-9 items-center justify-center text-lg text-[#524640] transition hover:bg-[#EDE6D8] hover:text-[#9B2C2C]"
      >
        +
      </button>
    </div>
  );
}

// =========================================================
// DÒNG TẠM TÍNH / VẬN CHUYỂN
// =========================================================
function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2">
      <small className="text-[9px] text-[#7A6C63]">{label}</small>

      <b className="font-['Playfair_Display'] text-sm font-medium text-[#2A2421]">
        {value}
      </b>
    </div>
  );
}

// =========================================================
// LABEL FORM
// =========================================================
function Field({ label, children }) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-[7px] font-bold uppercase tracking-[2px] text-[#9B2C2C]">
        {label}
      </span>

      {children}
    </label>
  );
}

// =========================================================
// STYLE INPUT
// =========================================================
const inputStyle = `
  w-full
  border-0
  border-b
  border-[#C8BBA8]
  bg-transparent
  px-0
  py-3
  text-sm
  text-[#2A2421]
  outline-none
  transition
  placeholder:text-[#A39585]
  focus:border-[#D4AF37]
`;
