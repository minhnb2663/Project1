import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import GalleryGrid from "../components/gallery/GalleryGrid";
import { search } from "../services/searchApi";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const query = (searchParams.get("q") || "").trim();

  const [items, setItems] = useState([]);
  const [intent, setIntent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const lastQueryRef = useRef("");

  // =========================================================
  // LUÔN MỞ SEARCH PAGE Ở ĐẦU TRANG
  // =========================================================
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
  }, []);

  // =========================================================
  // CHẠY AI SEARCH
  // =========================================================
  const run = useCallback(async (q) => {
    const value = q?.trim();

    if (!value) return;

    setBusy(true);
    setDone(false);
    setItems([]);
    setIntent(null);

    try {
      const result = await search(value);

      setItems(result.data || []);
      setIntent(result.intent || null);
      setDone(true);
    } catch (error) {
      console.error("Search error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tìm kiếm lúc này"
      );
    } finally {
      setBusy(false);
    }
  }, []);

  // =========================================================
  // NHẬN QUERY TỪ NAVBAR
  //
  // /search?q=tranh...
  // =========================================================
  useEffect(() => {
    if (!query) {
      lastQueryRef.current = "";

      setItems([]);
      setIntent(null);
      setDone(false);

      return;
    }

    // tránh gọi lại cùng query không cần thiết
    if (lastQueryRef.current === query) return;

    lastQueryRef.current = query;

    run(query);
  }, [query, run]);

  // =========================================================
  // GỢI Ý
  // =========================================================
  const searchSuggestion = (value) => {
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#2A2421]">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section
        className="
          relative
          overflow-hidden
          border-b
          border-[#3D332E]
          bg-[#1C1715]
          text-[#F7F4EF]
        "
      >
        {/* GLOW */}
        <div
          className="
            pointer-events-none
            absolute
            -left-40
            -top-48
            h-[520px]
            w-[520px]
            rounded-full
            bg-[#D4AF37]/10
            blur-[120px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-40
            top-0
            h-[450px]
            w-[450px]
            rounded-full
            bg-[#9B2C2C]/10
            blur-[120px]
          "
        />

        {/* DECORATIVE CIRCLES */}
        <div className="pointer-events-none absolute -left-44 -top-44 h-[480px] w-[480px] rounded-full border border-[#D4AF37]/10" />

        <div className="pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full border border-[#D4AF37]/10" />

        <div
          className="
            relative
            mx-auto
            max-w-[1500px]
            px-6
            py-16
            text-center
            md:px-12
            md:py-20
            lg:px-20
          "
        >
          {/* EYEBROW */}
          <div className="flex items-center justify-center gap-4">

            <span className="h-px w-10 bg-[#D4AF37]" />

            <span className="text-[9px] font-bold tracking-[0.34em] text-[#D4AF37]">
              ✦ ARTMIND INTELLIGENCE
            </span>

            <span className="h-px w-10 bg-[#D4AF37]" />
          </div>

          {/* TITLE */}
          {query ? (
            <>
              <p className="mt-7 text-[9px] uppercase tracking-[0.28em] text-[#8F8178]">
                KẾT QUẢ TÌM KIẾM CHO
              </p>

              <h1
                className="
                  mx-auto
                  mt-4
                  max-w-5xl
                  font-['Playfair_Display']
                  text-4xl
                  font-medium
                  leading-[1.05]
                  tracking-[-0.035em]
                  sm:text-5xl
                  lg:text-[64px]
                "
              >
                “
                <em className="font-normal text-[#D4AF37]">
                  {query}
                </em>
                ”
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#B8ADA0]">
                ARTMIND đang sử dụng ngôn ngữ tự nhiên để tìm
                những tác phẩm phù hợp nhất với mô tả của bạn.
              </p>
            </>
          ) : (
            <>
              <h1
                className="
                  mx-auto
                  mt-8
                  max-w-4xl
                  font-['Playfair_Display']
                  text-4xl
                  font-medium
                  leading-[1.05]
                  tracking-[-0.035em]
                  sm:text-5xl
                  lg:text-[64px]
                "
              >
                Hãy mô tả điều
                <br />

                <em className="font-normal text-[#D4AF37]">
                  bạn muốn cảm nhận.
                </em>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#B8ADA0]">
                Nhập mô tả vào thanh ARTMIND AI SEARCH phía trên
                để bắt đầu.
              </p>
            </>
          )}
        </div>
      </section>

      {/* =====================================================
          QUICK SUGGESTIONS
      ===================================================== */}
      <section className="border-b border-[#D8CFC0] bg-[#EEE7DB]">

        <div
          className="
            mx-auto
            flex
            max-w-[1500px]
            flex-col
            gap-5
            px-6
            py-6
            md:px-12
            lg:flex-row
            lg:items-center
            lg:px-20
          "
        >
          <div className="shrink-0">

            <span className="text-[8px] font-bold tracking-[0.3em] text-[#9B2C2C]">
              GỢI Ý TÌM KIẾM
            </span>

            <p className="mt-1 text-[10px] text-[#776B61]">
              Thử một vài mô tả từ kho lưu trữ
            </p>
          </div>

          <div className="hidden h-9 w-px bg-[#C8BBA8] lg:block" />

          <div className="flex flex-wrap gap-2">

            <Suggestion
              onClick={() =>
                searchSuggestion("tranh thiên nhiên sơn dầu")
              }
            >
              Thiên nhiên sơn dầu
            </Suggestion>

            <Suggestion
              onClick={() =>
                searchSuggestion(
                  "tranh trừu tượng hiện đại trên toan"
                )
              }
            >
              Trừu tượng hiện đại
            </Suggestion>

            <Suggestion
              onClick={() =>
                searchSuggestion("tranh phong cảnh màu nước")
              }
            >
              Phong cảnh màu nước
            </Suggestion>

            <Suggestion
              onClick={() =>
                searchSuggestion(
                  "tranh chân dung cổ điển màu tối"
                )
              }
            >
              Chân dung cổ điển
            </Suggestion>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOADING
      ===================================================== */}
      {busy && (
        <section className="bg-[#ECE4D5] px-6 py-24 md:px-12 lg:px-20">

          <div
            className="
              mx-auto
              flex
              max-w-[900px]
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                animate-pulse
                items-center
                justify-center
                border
                border-[#9B2C2C]
                bg-[#1C1715]
                text-xl
                text-[#D4AF37]
              "
            >
              ✦
            </div>

            <span className="mt-7 text-[8px] font-bold tracking-[0.3em] text-[#9B2C2C]">
              ARTMIND AI / SEARCHING
            </span>

            <h2 className="mt-4 font-['Playfair_Display'] text-3xl text-[#2A2421] md:text-4xl">
              Đang phân tích yêu cầu của bạn...
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#776B61]">
              ARTMIND đang tìm kiếm những tác phẩm phù hợp nhất
              với chủ đề, màu sắc, chất liệu và phong cách bạn mô tả.
            </p>
          </div>
        </section>
      )}

      {/* =====================================================
          AI INTERPRETATION
      ===================================================== */}
      {!busy && intent && (
        <section
          className="
            relative
            overflow-hidden
            border-b
            border-[#D8CFC0]
            bg-[#F7F4EF]
            px-6
            py-9
            md:px-12
            lg:px-20
          "
        >
          <span
            className="
              pointer-events-none
              absolute
              -right-3
              -top-12
              hidden
              font-['Playfair_Display']
              text-[150px]
              italic
              leading-none
              text-[#9B2C2C]/[0.035]
              md:block
            "
          >
            AI
          </span>

          <div
            className="
              relative
              mx-auto
              flex
              max-w-[1100px]
              flex-col
              gap-5
              md:flex-row
              md:items-center
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                border
                border-[#3D332E]
                bg-[#1C1715]
                text-lg
                text-[#D4AF37]
              "
            >
              ✦
            </div>

            <div className="min-w-0">

              <div className="flex items-center gap-4">

                <span className="text-[8px] font-bold tracking-[0.3em] text-[#9B2C2C]">
                  ARTMIND AI / INTERPRETATION
                </span>

                <span className="hidden h-px w-16 bg-[#C8BBA8] sm:block" />
              </div>

              <p className="mt-2 font-['Playfair_Display'] text-lg leading-7 text-[#2A2421] md:text-xl">

                AI đã hiểu:{" "}

                <span className="text-[#9B2C2C]">
                  {Object.entries(intent.filters || {})
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" · ") ||
                    "tìm theo mức độ liên quan"}
                </span>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          RESULTS
      ===================================================== */}
      {!busy && done && (
        <section
          className="
            relative
            bg-[#ECE4D5]
            px-6
            py-16
            md:px-12
            md:py-20
            lg:px-20
          "
        >
          <div className="mx-auto max-w-[1500px]">

            {/* RESULT HEADER */}
            <header
              className="
                mb-12
                flex
                flex-col
                justify-between
                gap-8
                border-b
                border-[#C8BBA8]
                pb-8
                md:flex-row
                md:items-end
              "
            >
              <div>

                <div className="flex items-center gap-4">

                  <span className="text-[9px] font-bold tracking-[0.3em] text-[#9B2C2C]">
                    SEARCH RESULTS
                  </span>

                  <span className="h-px w-20 bg-[#C8BBA8]" />
                </div>

                <h2
                  className="
                    mt-5
                    font-['Playfair_Display']
                    text-4xl
                    font-medium
                    leading-[1.04]
                    tracking-[-0.025em]
                    text-[#2A2421]
                    md:text-5xl
                  "
                >
                  Những tác phẩm
                  <br />

                  <em className="font-normal text-[#9B2C2C]">
                    được tìm thấy.
                  </em>
                </h2>
              </div>

              <div className="flex items-end gap-3">

                <b
                  className="
                    font-['Playfair_Display']
                    text-6xl
                    font-normal
                    leading-none
                    text-[#D4AF37]
                    md:text-7xl
                  "
                >
                  {String(items.length).padStart(2, "0")}
                </b>

                <span className="pb-1 text-[8px] uppercase leading-4 tracking-[0.22em] text-[#7A6C63]">
                  Search
                  <br />
                  Results
                </span>
              </div>
            </header>

            {/* GALLERY */}
            {items.length ? (
              <GalleryGrid items={items} />
            ) : (
              <div
                className="
                  relative
                  flex
                  min-h-[380px]
                  flex-col
                  items-center
                  justify-center
                  overflow-hidden
                  border
                  border-dashed
                  border-[#C8BBA8]
                  bg-[#F7F4EF]/55
                  px-6
                  text-center
                "
              >
                <span
                  className="
                    pointer-events-none
                    absolute
                    -right-8
                    -top-16
                    font-['Playfair_Display']
                    text-[190px]
                    italic
                    leading-none
                    text-[#2A2421]/[0.025]
                  "
                >
                  0
                </span>

                <span className="font-['Playfair_Display'] text-6xl text-[#D4AF37]">
                  ◇
                </span>

                <h3 className="mt-5 font-['Playfair_Display'] text-2xl text-[#2A2421]">
                  Chưa tìm thấy tác phẩm phù hợp
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7 text-[#524640]">
                  Hãy thử mô tả bằng màu sắc, chất liệu,
                  chủ đề hoặc cảm xúc khác.
                </p>

                <button
                  onClick={() =>
                    searchSuggestion("tranh thiên nhiên sơn dầu")
                  }
                  className="
                    group
                    mt-7
                    inline-flex
                    items-center
                    gap-4
                    bg-[#D4AF37]
                    px-5
                    py-3
                    text-[9px]
                    font-bold
                    tracking-[0.22em]
                    text-[#2A2421]
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#b89528]
                  "
                >
                  THỬ MỘT GỢI Ý

                  <span className="text-base transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}
      {!query && !busy && (
        <section
          className="
            relative
            overflow-hidden
            bg-[#F7F4EF]
            px-6
            py-24
            text-center
            md:px-12
          "
        >
          <span
            className="
              pointer-events-none
              absolute
              left-1/2
              top-2
              -translate-x-1/2
              font-['Playfair_Display']
              text-[190px]
              leading-none
              text-[#9B2C2C]/[0.05]
            "
          >
            “
          </span>

          <div className="relative mx-auto max-w-4xl">

            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#9B2C2C]">
              ARTMIND / SEARCH
            </p>

            <blockquote className="mt-8 font-['Playfair_Display'] text-3xl font-medium leading-[1.08] text-[#2A2421] md:text-5xl">

              Hãy bắt đầu bằng

              <br />

              <em className="font-normal text-[#9B2C2C]">
                một cảm giác.
              </em>
            </blockquote>

            <p className="mx-auto mt-7 max-w-lg text-sm leading-7 text-[#524640]">
              Bạn không cần biết tên trường phái hay tên nghệ sĩ.
              Chỉ cần nhập điều bạn đang tìm vào thanh AI Search
              phía trên.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}

// =========================================================
// SUGGESTION
// =========================================================
function Suggestion({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        inline-flex
        items-center
        gap-3
        border
        border-[#C8BBA8]
        bg-[#F7F4EF]
        px-4
        py-2.5
        text-[9px]
        font-semibold
        tracking-[0.08em]
        text-[#524640]
        transition
        duration-300
        hover:-translate-y-0.5
        hover:border-[#9B2C2C]
        hover:bg-[#9B2C2C]
        hover:text-[#F7F4EF]
      "
    >
      <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-transform duration-300 group-hover:scale-150" />

      {children}
    </button>
  );
}