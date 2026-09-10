import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[#6f604b] bg-[#302820] text-[#eaddc8]">
      {/* =====================================================
          PHẦN CHÍNH
      ===================================================== */}
      <div className="mx-auto grid max-w-[1500px] gap-12 px-6 py-16 md:grid-cols-2 md:px-12 lg:grid-cols-[1.4fr_0.7fr_0.7fr] lg:px-20">
        {/* =================================================
            THƯƠNG HIỆU
        ================================================= */}
        <div className="max-w-md">
          <Link to="/" className="inline-flex items-center gap-4">
            {/* LOGO */}
            <div className="relative flex h-12 w-12 items-center justify-center border border-[#a98a5d]">
              <span className="font-['Playfair_Display'] text-xl text-[#d1ad76]">
                A
              </span>

              <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-[#a98a5d]" />

              <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-[#a98a5d]" />
            </div>

            <div>
              <b className="block font-['Playfair_Display'] text-xl font-medium tracking-[2px]">
                ARTMIND
              </b>

              <small className="mt-1 block text-[6px] tracking-[3px] text-[#8f816e]">
                DIGITAL ART ARCHIVE
              </small>
            </div>
          </Link>

          <p className="mt-7 max-w-sm text-sm leading-7 text-[#aaa090]">
            Khám phá nghệ thuật bằng sự tò mò của con người và sức mạnh của công
            nghệ thông minh.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <span className="h-2 w-2 rotate-45 border border-[#b89563]" />

            <span className="h-px w-20 bg-[#6d5c46]" />

            <span className="text-[7px] tracking-[3px] text-[#857867]">
              ART × INTELLIGENCE
            </span>
          </div>
        </div>

        {/* =================================================
            KHÁM PHÁ
        ================================================= */}
        <div>
          <span className="text-[8px] font-bold tracking-[3px] text-[#c2a06b]">
            01 / KHÁM PHÁ
          </span>

          <nav className="mt-6 flex flex-col">
            <FooterLink to="/gallery">Phòng tranh</FooterLink>

            <FooterLink to="/artists">Nghệ sĩ</FooterLink>

            <FooterLink to="/search">Tìm kiếm AI</FooterLink>

            <FooterLink to="/recognize">Nhận diện hình ảnh</FooterLink>
          </nav>
        </div>

        {/* =================================================
            CÁ NHÂN
        ================================================= */}
        <div>
          <span className="text-[8px] font-bold tracking-[3px] text-[#c2a06b]">
            02 / CÁ NHÂN
          </span>

          <nav className="mt-6 flex flex-col">
            <FooterLink to="/dashboard">Bộ sưu tập của tôi</FooterLink>

            <FooterLink to="/orders">Đơn hàng</FooterLink>

            <FooterLink to="/login">Tài khoản</FooterLink>

            <FooterLink to="/contact">Liên hệ</FooterLink>
          </nav>
        </div>
      </div>

      {/* =====================================================
          ĐƯỜNG PHÂN CÁCH
      ===================================================== */}
      <div className="mx-auto max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="h-px bg-[#5d4f3e]" />
      </div>

      {/* =====================================================
          FOOTER BOTTOM
      ===================================================== */}
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-12 lg:px-20">
        <small className="text-[7px] tracking-[2px] text-[#847766]">
          © 2026 ARTMIND · ALL RIGHTS RESERVED
        </small>

        <div className="flex items-center gap-4">
          <span className="hidden h-px w-12 bg-[#685842] sm:block" />

          <span className="text-[7px] tracking-[3px] text-[#847766]">
            CURATED BY INTUITION
          </span>

          <span className="h-2 w-2 rotate-45 border border-[#92764f]" />

          <span className="text-[7px] tracking-[3px] text-[#847766]">
            MMXXVI
          </span>
        </div>
      </div>
    </footer>
  );
}

// =========================================================
// LINK FOOTER
// =========================================================
function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between border-b border-white/[0.08] py-3 text-xs text-[#b8ad9d] transition hover:text-[#d1ae78]"
    >
      <span>{children}</span>

      <span className="translate-x-0 text-[#8f7552] opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
        →
      </span>
    </Link>
  );
}
