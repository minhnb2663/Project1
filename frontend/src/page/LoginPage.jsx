import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../redux/AuthContext";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [busy, setBusy] = useState(false);

  const { signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      const user = await signIn(form);

      toast.success("Đăng nhập thành công");

      nav(user.role === "admin" ? "/admin" : loc.state?.from || "/dashboard", {
        replace: true,
      });
    } catch (x) {
      toast.error(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      title={
        <>
          Chào mừng
          <br />
          <i>trở lại.</i>
        </>
      }
      note="Tiếp tục hành trình khám phá nghệ thuật được thiết kế riêng cho bạn."
    >
      <form onSubmit={submit} className="mt-10">
        {/* EMAIL */}
        <label className="group block border-t border-black/15 py-5">
          <span className="mb-3 flex items-center justify-between">
            <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-black/45">
              Email
            </span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-black/20">
              01
            </span>
          </span>

          <input
            type="email"
            required
            autoComplete="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="w-full border-0 bg-transparent px-0 py-1 font-['Playfair_Display'] text-xl text-[#111111] outline-none transition placeholder:font-sans placeholder:text-sm placeholder:text-black/25 focus:placeholder:text-black/15"
          />
        </label>

        {/* PASSWORD */}
        <label className="group block border-y border-black/15 py-5">
          <span className="mb-3 flex items-center justify-between">
            <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-black/45">
              Mật khẩu
            </span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-black/20">
              02
            </span>
          </span>

          <input
            type="password"
            required
            minLength="6"
            autoComplete="current-password"
            placeholder="Tối thiểu 6 ký tự"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="w-full border-0 bg-transparent px-0 py-1 font-['Playfair_Display'] text-xl text-[#111111] outline-none transition placeholder:font-sans placeholder:text-sm placeholder:text-black/25 focus:placeholder:text-black/15"
          />
        </label>

        {/* NOTE */}
        <div className="mt-6 grid grid-cols-[auto_1fr] gap-4">
          <span className="mt-1 flex h-8 w-8 items-center justify-center border border-[#ef3f2f]/30 text-[12px] text-[#ef3f2f]">
            ✦
          </span>

          <p className="max-w-sm text-[10px] leading-5 text-black/45">
            Đăng nhập để lưu tác phẩm, quản lý bộ sưu tập và nhận những gợi ý
            nghệ thuật dành riêng cho bạn.
          </p>
        </div>

        {/* SUBMIT */}
        <button
          disabled={busy}
          className="group mt-8 flex w-full items-center justify-between bg-[#111111] px-6 py-5 text-[9px] font-bold uppercase tracking-[0.22em] text-white transition duration-300 hover:bg-[#ef3f2f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</span>

          <span className="text-lg transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </button>
      </form>

      {/* REGISTER */}
      <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[9px] uppercase tracking-[0.14em] text-black/35">
          Chưa có tài khoản?
        </span>

        <Link
          to="/register"
          className="group inline-flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#ef3f2f]"
        >
          Tạo tài khoản
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </AuthShell>
  );
}

/* =========================================================
   SHARED AUTH SHELL — LOGIN + REGISTER
========================================================= */

export function AuthShell({ mode, title, note, children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f0e8] text-[#111111]">
      {/* BACK HOME */}
      <Link
        to="/"
        aria-label="Trở về trang chủ"
        className="group absolute left-5 top-5 z-50 flex h-11 items-center gap-3 border border-white/20 bg-[#ffffff]/90 px-4 text-[8px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:bg-[#ef3f2f] lg:left-8 lg:top-8"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">
          ←
        </span>
        <span>Trang chủ</span>
      </Link>

      <div className="grid min-h-screen lg:grid-cols-[56%_44%]">
        {/* =====================================================
            LEFT / VISUAL STORY
        ===================================================== */}
        <section className="relative hidden min-h-screen overflow-hidden bg-[#111111] lg:block">
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.34] saturate-[0.9]"
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-colorful-ink-mixing-in-water-1578/1080p.mp4"
              type="video/mp4"
            />
          </video>

          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(17,17,17,0.97)_0%,rgba(17,17,17,0.8)_46%,rgba(17,17,17,0.42)_100%)]" />

          {/* LARGE TYPOGRAPHY */}
          <span
            aria-hidden="true"
            className="absolute -left-4 top-[18%] font-['Playfair_Display'] text-[clamp(110px,13vw,220px)] font-medium leading-[0.78] tracking-[-0.07em] text-white/[0.055]"
          >
            ART
          </span>

          {/* LOGO */}
          <div
            className="absolute left-10 top-28 z-20 flex items-center gap-3 text-white"
          >
          </div>

          {/* ARTWORK COMPOSITION */}
          <div className="absolute inset-0" aria-hidden="true">
            <figure className="absolute right-[8%] top-[11%] w-[190px] overflow-hidden bg-white p-2 shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
              <img
                src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=600&q=85"
                alt=""
                className="h-[245px] w-full object-cover"
              />
              <figcaption className="flex items-center justify-between px-1 pb-1 pt-3 text-[6px] uppercase tracking-[0.2em] text-black/50">
                <span>Study 01</span>
                <span>ArtMind</span>
              </figcaption>
            </figure>

            <figure className="absolute right-[30%] top-[39%] w-[220px] overflow-hidden border-[10px] border-[#ef3f2f] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
              <img
                src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=700&q=85"
                alt=""
                className="h-[285px] w-full object-cover"
              />
            </figure>

            <figure className="absolute bottom-[7%] right-[6%] w-[165px] overflow-hidden bg-[#f4f0e8] p-2 shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
              <img
                src="https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=600&q=85"
                alt=""
                className="h-[205px] w-full object-cover"
              />
            </figure>
          </div>

          {/* BOTTOM COPY */}
          <div className="absolute bottom-12 left-10 z-20 max-w-[330px] text-white">
            <span className="text-[8px] font-bold uppercase tracking-[0.36em] text-[#ef3f2f]">
              Members / 2026
            </span>

            <blockquote className="mt-5 font-['Playfair_Display'] text-[54px] font-medium leading-[0.88] tracking-[-0.04em]">
              Art finds
              <br />
              <em className="font-normal text-white/45">you.</em>
            </blockquote>

            <p className="mt-6 max-w-[280px] text-[10px] leading-5 text-white/40">
              Một không gian riêng để lưu giữ những tác phẩm đã khiến bạn dừng
              lại, nhìn lâu hơn và cảm nhận nhiều hơn.
            </p>
          </div>

          {/* MODE INDEX */}
          <div className="absolute bottom-12 right-10 z-20 flex items-center gap-3">
            <span className="h-px w-10 bg-white/20" />
            <span className="font-['Playfair_Display'] text-xl text-white">
              {mode === "login" ? "01" : "02"}
            </span>
          </div>

          {/* VERTICAL LABEL */}
          <span className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rotate-180 text-[7px] font-bold uppercase tracking-[0.38em] text-white/25 [writing-mode:vertical-rl]">
            Curated by intuition
          </span>
        </section>

        {/* =====================================================
            RIGHT / FORM
        ===================================================== */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24 sm:px-10 lg:px-14 xl:px-20">
          {/* GRID BACKGROUND */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.28] [background-image:linear-gradient(to_right,rgba(17,17,17,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.06)_1px,transparent_1px)] [background-size:64px_64px]"
          />

          {/* RED BLOCK */}
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-24 w-24 bg-[#ef3f2f] sm:h-32 sm:w-32"
          />

          {/* GIANT LETTER */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-7 bottom-[-35px] hidden font-['Playfair_Display'] text-[260px] italic leading-none text-black/[0.025] xl:block"
          >
            A
          </span>

          <div className="relative z-10 w-full max-w-[460px]">
            {/* EYEBROW */}
            <div className="flex items-center justify-between border-b border-black/15 pb-4">
              <span className="text-[8px] font-bold uppercase tracking-[0.34em] text-[#ef3f2f]">
                {mode === "login" ? "Welcome back" : "New collector"} / ArtMind
              </span>

              <span className="text-[8px] uppercase tracking-[0.22em] text-black/25">
                MMXXVI
              </span>
            </div>

            {/* TITLE */}
            <h1 className="mt-8 font-['Playfair_Display'] text-[clamp(48px,7vw,76px)] font-medium leading-[0.88] tracking-[-0.05em] text-[#111111] [&_i]:font-normal [&_i]:text-[#ef3f2f]">
              {title}
            </h1>

            {/* NOTE */}
            <div className="mt-7 grid grid-cols-[32px_1fr] gap-4">
              <span className="mt-3 h-px w-8 bg-black/35" />
              <p className="max-w-sm text-[12px] leading-6 text-black/45">
                {note}
              </p>
            </div>

            {children}

            {/* MOBILE BRAND NOTE */}
            <div className="mt-12 border-t border-black/10 pt-5 lg:hidden">
              <p className="font-['Playfair_Display'] text-xl">
                ArtMind
                <em className="ml-2 font-normal text-[#ef3f2f]">
                  / Art × Intelligence
                </em>
              </p>
            </div>
          </div>

          <small className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[7px] font-semibold uppercase tracking-[0.2em] text-black/25">
            © 2026 ArtMind · Digital Art Archive
          </small>
        </section>
      </div>
    </main>
  );
}
