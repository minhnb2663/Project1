import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../redux/AuthContext";
import { useCart } from "../../redux/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const accountRef = useRef(null);

  // Đồng bộ text trên header với query hiện tại của /search
  useEffect(() => {
    if (location.pathname === "/search") {
      const params = new URLSearchParams(location.search);
      setSearch(params.get("q") || "");
    }
  }, [location.pathname, location.search]);

  // Đóng menu tài khoản khi bấm ra ngoài hoặc chuyển trang
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  const navStyle = ({ isActive }) =>
    `relative py-4 text-[11px] font-semibold tracking-[1px] transition ${
      isActive
        ? "text-[#9b6d2e]"
        : "text-[#4c4439] hover:text-[#9b6d2e]"
    }`;

  // =====================================================
  // AI SEARCH
  // =====================================================
  const handleSearch = (e) => {
    e.preventDefault();

    const query = search.trim();

    if (!query) return;

    setOpen(false);
    setAccountOpen(false);

    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // =====================================================
  // ACCOUNT
  // =====================================================
  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#faf7f1] shadow-[0_2px_15px_rgba(45,39,31,0.08)]">

      {/* =====================================================
          TOP BAR
      ===================================================== */}
      <div className="bg-[#302820] px-5 py-2 text-center text-[9px] font-medium tracking-[1.5px] text-[#eadbc4]">
        KHÁM PHÁ NGHỆ THUẬT • SƯU TẦM TÁC PHẨM YÊU THÍCH • AI ART DISCOVERY
      </div>

      {/* =====================================================
          MAIN HEADER
      ===================================================== */}
      <div className="border-b border-[#ddd3c2] bg-[#faf7f1]">
        <div className="mx-auto flex h-[78px] max-w-[1500px] items-center gap-6 px-5 md:px-8 lg:px-10">

          {/* =================================================
              LOGO
          ================================================= */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center bg-[#302820]">

              <span className="font-['Playfair_Display'] text-xl text-[#dcb97b]">
                A
              </span>

              <span className="absolute -right-[3px] -top-[3px] h-3 w-3 border-r border-t border-[#b98942]" />

              <span className="absolute -bottom-[3px] -left-[3px] h-3 w-3 border-b border-l border-[#b98942]" />
            </div>

            <div className="hidden flex-col sm:flex">
              <span className="font-['Playfair_Display'] text-xl font-semibold tracking-[2px] text-[#302820]">
                ARTMIND
              </span>

              <span className="text-[6px] tracking-[2.8px] text-[#958671]">
                DIGITAL ART ARCHIVE
              </span>
            </div>
          </Link>

          {/* =================================================
              AI SEARCH CHÍNH
          ================================================= */}
          <form
            onSubmit={handleSearch}
            className="mx-auto hidden max-w-[720px] flex-1 md:flex"
          >
            <div
              className="
                group
                flex
                h-12
                w-full
                items-center
                overflow-hidden
                border
                border-[#cdbb9d]
                bg-white
                transition
                duration-300
                focus-within:border-[#9b6d2e]
                focus-within:shadow-[0_4px_20px_rgba(90,65,35,0.10)]
              "
            >

              {/* AI ICON */}
              <div className="flex h-full w-12 shrink-0 items-center justify-center text-[#a5742d]">
                <span className="text-base">✦</span>
              </div>

              {/* INPUT */}
              <div className="flex min-w-0 flex-1 flex-col justify-center pr-3">

                <span className="mb-[1px] text-[6px] font-bold tracking-[2.2px] text-[#9b6d2e]">
                  ARTMIND AI SEARCH
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Mô tả tác phẩm bạn muốn tìm..."
                  aria-label="Tìm kiếm tranh bằng AI"
                  className="
                    w-full
                    bg-transparent
                    text-[12px]
                    text-[#40372e]
                    outline-none
                    placeholder:text-[#a99a86]
                  "
                />
              </div>

              {/* SEARCH BUTTON */}
              <button
                type="submit"
                disabled={!search.trim()}
                className="
                  flex
                  h-full
                  shrink-0
                  items-center
                  gap-3
                  bg-[#302820]
                  px-5
                  text-white
                  transition
                  hover:bg-[#9b6d2e]
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                <span className="hidden text-[8px] font-bold tracking-[1.5px] lg:block">
                  TÌM KIẾM
                </span>

                <span className="text-base">
                  →
                </span>
              </button>
            </div>
          </form>

          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">

            {/* WISHLIST */}
            {user && (
              <Link
                to="/collection"
                className="group hidden h-11 items-center gap-2 px-3 lg:flex"
              >
                <span className="text-[22px] text-[#4c4439] transition group-hover:text-[#9b6d2e]">
                  ♡
                </span>

                <div className="hidden flex-col xl:flex">
                  <span className="text-[8px] text-[#978a78]">
                    YÊU THÍCH
                  </span>

                  <span className="text-[10px] font-semibold text-[#42392f]">
                    Bộ sưu tập
                  </span>
                </div>
              </Link>
            )}

            {/* ACCOUNT */}
            {user ? (
              <div
                ref={accountRef}
                className="relative hidden sm:block"
              >
                <button
                  type="button"
                  onClick={() => setAccountOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className="group flex h-11 items-center gap-3 px-2"
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-[#e5cfaa]
                      font-['Playfair_Display']
                      text-sm
                      font-semibold
                      text-[#493b2d]
                      transition
                      group-hover:bg-[#d4b477]
                    "
                  >
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>

                  <div className="hidden flex-col xl:flex">
                    <span className="text-[8px] text-[#978a78]">
                      XIN CHÀO
                    </span>

                    <span className="max-w-[100px] truncate text-[10px] font-semibold text-[#42392f]">
                      {user.name || "Tài khoản"}
                    </span>
                  </div>

                  <span
                    className={`hidden text-[9px] text-[#8d7d68] transition-transform xl:block ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] z-[70] w-48 overflow-hidden border border-[#ddd0bc] bg-[#fffdf9] py-1 shadow-[0_12px_30px_rgba(48,40,32,0.16)]"
                  >
                    <Link
                      to={user?.role === "admin" ? "/admin" : "/dashboard"}
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[10px] font-semibold tracking-[0.5px] text-[#42392f] transition hover:bg-[#f4ecdf] hover:text-[#9b6d2e]"
                    >
                      <span className="text-sm">♙</span>
                      XEM HỒ SƠ
                    </Link>

                    <div className="mx-3 h-px bg-[#e8dfd1]" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-[10px] font-semibold tracking-[0.5px] text-[#7b3e32] transition hover:bg-[#f7eae5]"
                    >
                      <span className="text-sm">↪</span>
                      ĐĂNG XUẤT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="group hidden h-11 items-center gap-3 px-3 sm:flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c8b99f]">
                  <span className="text-sm text-[#4b4035]">
                    ♙
                  </span>
                </div>

                <div className="hidden flex-col xl:flex">
                  <span className="text-[8px] text-[#978a78]">
                    TÀI KHOẢN
                  </span>

                  <span className="text-[10px] font-semibold text-[#42392f] group-hover:text-[#9b6d2e]">
                    Đăng nhập
                  </span>
                </div>
              </Link>
            )}

            {/* =================================================
                CART
            ================================================= */}
            <Link
              to="/cart"
              className="
                group
                relative
                flex
                h-11
                items-center
                gap-3
                border-l
                border-[#ded3c1]
                pl-3
                sm:pl-4
              "
            >
              <div className="relative">

                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-[#3e352c] transition group-hover:stroke-[#9b6d2e]"
                >
                  <path
                    d="M3 4H5L7.2 14.2C7.4 15.2 8.3 16 9.4 16H17.5C18.5 16 19.4 15.3 19.7 14.3L21 8H6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <circle
                    cx="10"
                    cy="20"
                    r="1"
                    strokeWidth="1.5"
                  />

                  <circle
                    cx="18"
                    cy="20"
                    r="1"
                    strokeWidth="1.5"
                  />
                </svg>

                {count > 0 && (
                  <span
                    className="
                      absolute
                      -right-2
                      -top-2
                      flex
                      h-[18px]
                      min-w-[18px]
                      items-center
                      justify-center
                      rounded-full
                      bg-[#9b6d2e]
                      px-1
                      text-[8px]
                      font-bold
                      text-white
                    "
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </div>

              <div className="hidden flex-col xl:flex">
                <span className="text-[8px] text-[#978a78]">
                  GIỎ HÀNG
                </span>

                <span className="text-[10px] font-semibold text-[#42392f] group-hover:text-[#9b6d2e]">
                  {count || 0} sản phẩm
                </span>
              </div>
            </Link>

            {/* =================================================
                MOBILE MENU BUTTON
            ================================================= */}
            <button
              onClick={() => setOpen(!open)}
              className="
                ml-1
                flex
                h-10
                w-10
                flex-col
                items-center
                justify-center
                gap-[5px]
                border
                border-[#cfc1aa]
                lg:hidden
              "
              aria-label="Mở menu"
            >
              <span
                className={`h-px w-5 bg-[#3b332a] transition ${
                  open
                    ? "translate-y-[6px] rotate-45"
                    : ""
                }`}
              />

              <span
                className={`h-px w-5 bg-[#3b332a] transition ${
                  open ? "opacity-0" : ""
                }`}
              />

              <span
                className={`h-px w-5 bg-[#3b332a] transition ${
                  open
                    ? "-translate-y-[6px] -rotate-45"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          DESKTOP NAVIGATION
      ===================================================== */}
      <div className="hidden border-b border-[#dfd6c8] bg-[#f7f2e9] lg:block">

        <div className="relative mx-auto flex h-[50px] max-w-[1500px] items-center px-10">

          <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-8">

            <NavLink
              to="/"
              className={navStyle}
            >
              TRANG CHỦ
            </NavLink>

            <NavLink
              to="/gallery"
              className={navStyle}
            >
              TRANH NGHỆ THUẬT
            </NavLink>

            <NavLink
              to="/artists"
              className={navStyle}
            >
              NGHỆ SĨ
            </NavLink>

            <NavLink
              to="/recognize"
              className={navStyle}
            >
              NHẬN DIỆN TRANH
            </NavLink>

            <NavLink
              to="/about"
              className={navStyle}
            >
              GIỚI THIỆU
            </NavLink>

            <NavLink
              to="/contact"
              className={navStyle}
            >
              LIÊN HỆ
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-6 text-[9px] tracking-[1px] text-[#7e7160]">
            <span>
              ✓ BẢO MẬT THANH TOÁN
            </span>

            <span>
              ✓ HỖ TRỢ KHÁCH HÀNG
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}
      {open && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            border-b
            border-[#c8b89e]
            bg-[#faf7f1]
            shadow-xl
            lg:hidden
          "
        >

          {/* MOBILE AI SEARCH */}
          <form
            onSubmit={handleSearch}
            className="border-b border-[#ded3c1] p-4 md:hidden"
          >
            <div className="flex h-12 border border-[#cfc1aa] bg-white">

              <div className="flex w-11 items-center justify-center text-[#9b6d2e]">
                ✦
              </div>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mô tả tác phẩm muốn tìm..."
                className="min-w-0 flex-1 px-2 text-[11px] outline-none"
              />

              <button
                type="submit"
                className="w-12 bg-[#302820] text-white"
              >
                →
              </button>
            </div>
          </form>

          <div className="flex flex-col px-5 py-3">

            <NavLink
              to="/"
              className={navStyle}
              onClick={() => setOpen(false)}
            >
              TRANG CHỦ
            </NavLink>

            <NavLink
              to="/gallery"
              className={navStyle}
              onClick={() => setOpen(false)}
            >
              TRANH NGHỆ THUẬT
            </NavLink>

            <NavLink
              to="/artists"
              className={navStyle}
              onClick={() => setOpen(false)}
            >
              NGHỆ SĨ
            </NavLink>

            <NavLink
              to="/recognize"
              className={navStyle}
              onClick={() => setOpen(false)}
            >
              NHẬN DIỆN TRANH
            </NavLink>

            <NavLink
              to="/about"
              className={navStyle}
              onClick={() => setOpen(false)}
            >
              GIỚI THIỆU
            </NavLink>

            <NavLink
              to="/contact"
              className={navStyle}
              onClick={() => setOpen(false)}
            >
              LIÊN HỆ
            </NavLink>

            {!user && (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="
                  mt-3
                  flex
                  h-11
                  items-center
                  justify-center
                  bg-[#302820]
                  text-[10px]
                  font-semibold
                  tracking-[1.5px]
                  text-white
                "
              >
                ĐĂNG NHẬP
              </Link>
            )}

            {user && (
              <Link
                to="/collection"
                onClick={() => setOpen(false)}
                className="
                  mt-3
                  flex
                  h-11
                  items-center
                  justify-center
                  border
                  border-[#bba989]
                  text-[10px]
                  font-semibold
                  tracking-[1px]
                  text-[#443a30]
                  transition
                  hover:border-[#9b6d2e]
                  hover:text-[#9b6d2e]
                "
              >
                ♡ &nbsp; BỘ SƯU TẬP CỦA TÔI
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}