import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../redux/AuthContext";
import { AuthShell } from "./LoginPage";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [busy, setBusy] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // =========================
  // XỬ LÝ ĐĂNG KÝ
  // =========================
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      await signUp(form);

      toast.success("Bộ sưu tập của bạn đã sẵn sàng");

      navigate("/dashboard");
    } catch (x) {
      toast.error(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      mode="register"
      title={
        <>
          Bắt đầu
          <br />
          <i>hành trình.</i>
        </>
      }
      note="Tạo không gian nghệ thuật của riêng bạn chỉ trong vài giây."
    >
      {/* =====================================================
          FORM ĐĂNG KÝ
      ===================================================== */}
      <form onSubmit={submit} className="mt-10 space-y-6">
        {/* =========================
            HỌ VÀ TÊN
        ========================= */}
        <label className="block">
          <span className="mb-2 block text-[9px] font-bold uppercase tracking-[2px] text-[#806b4b]">
            Họ và tên
          </span>

          <input
            type="text"
            required
            autoComplete="name"
            placeholder="Tên của bạn"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="
              w-full
              border-0 border-b border-[#c0b094]
              bg-transparent
              px-0 py-3
              text-sm text-[#342d25]
              outline-none
              transition
              placeholder:text-[#aaa08f]
              focus:border-[#8b6c3f]
            "
          />
        </label>

        {/* =========================
            EMAIL
        ========================= */}
        <label className="block">
          <span className="mb-2 block text-[9px] font-bold uppercase tracking-[2px] text-[#806b4b]">
            Email
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
            className="
              w-full
              border-0 border-b border-[#c0b094]
              bg-transparent
              px-0 py-3
              text-sm text-[#342d25]
              outline-none
              transition
              placeholder:text-[#aaa08f]
              focus:border-[#8b6c3f]
            "
          />
        </label>

        {/* =========================
            MẬT KHẨU
        ========================= */}
        <label className="block">
          <span className="mb-2 block text-[9px] font-bold uppercase tracking-[2px] text-[#806b4b]">
            Mật khẩu
          </span>

          <input
            type="password"
            required
            minLength="6"
            autoComplete="new-password"
            placeholder="Tối thiểu 6 ký tự"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="
              w-full
              border-0 border-b border-[#c0b094]
              bg-transparent
              px-0 py-3
              text-sm text-[#342d25]
              outline-none
              transition
              placeholder:text-[#aaa08f]
              focus:border-[#8b6c3f]
            "
          />
        </label>

        {/* =========================
            GHI CHÚ NHỎ
        ========================= */}
        <div className="flex items-start gap-3 border-l border-[#b79d76] pl-4">
          <span className="mt-[3px] text-[#8b6c3f]">◇</span>

          <p className="text-[9px] leading-5 text-[#897b68]">
            Bằng việc tạo tài khoản, bạn bắt đầu xây dựng bộ sưu tập nghệ thuật
            cá nhân trên ArtMind.
          </p>
        </div>

        {/* =========================
            NÚT TẠO TÀI KHOẢN
        ========================= */}
        <button
          disabled={busy}
          className="
            group
            flex w-full
            items-center justify-between
            border border-[#8b6c3f]
            bg-[#302820]
            px-6 py-4
            text-[9px]
            font-bold
            tracking-[2px]
            text-[#eadcc6]
            transition
            hover:bg-[#8b6c3f]
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <span>{busy ? "ĐANG KHỞI TẠO…" : "TẠO TÀI KHOẢN"}</span>

          <b className="text-lg transition group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </b>
        </button>
      </form>

      {/* =====================================================
          CHUYỂN SANG ĐĂNG NHẬP
      ===================================================== */}
      <div className="mt-8 border-t border-[#c2b296] pt-6 text-center">
        <span className="text-[9px] tracking-[1px] text-[#887b68]">
          Đã là thành viên?{" "}
        </span>

        <Link
          to="/login"
          className="text-[9px] font-bold tracking-[1px] text-[#8b6c3f] transition hover:text-[#5d472d]"
        >
          ĐĂNG NHẬP →
        </Link>
      </div>
    </AuthShell>
  );
}
