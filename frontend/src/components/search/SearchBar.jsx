import { useState } from "react";

export default function SearchBar({ value = "", onSearch, busy }) {
  const [q, setQ] = useState(value);

  const submit = (e) => {
    e.preventDefault();

    const query = q.trim();

    if (!query || busy) return;

    onSearch(query);
  };

  return (
    <form
      onSubmit={submit}
      className="group flex flex-col gap-3 bg-[#f8f2e7] sm:flex-row sm:items-center"
    >
      {/* =========================
          ICON SEARCH
      ========================= */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#ad9979] text-xl text-[#8b6c3f]">
        ⌕
      </div>

      {/* =========================
          INPUT
      ========================= */}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Thử “tranh phong cảnh màu nước trên giấy”"
        aria-label="Tìm kiếm tác phẩm bằng AI"
        className="
          min-w-0
          flex-1
          border-0
          bg-transparent
          px-2
          py-4
          text-sm
          text-[#342d25]
          outline-none
          placeholder:text-[#9e927e]
          focus:ring-0
        "
      />

      {/* =========================
          BUTTON
      ========================= */}
      <button
        type="submit"
        disabled={busy || !q.trim()}
        className="
          group/button
          flex
          min-h-12
          shrink-0
          items-center
          justify-between
          gap-5
          border
          border-[#8b6c3f]
          bg-[#302820]
          px-5
          text-[8px]
          font-bold
          tracking-[2px]
          text-[#eadcc6]
          transition
          hover:bg-[#8b6c3f]
          disabled:cursor-not-allowed
          disabled:border-[#b9aa8f]
          disabled:bg-[#d8cdb9]
          disabled:text-[#938773]
        "
      >
        <span>{busy ? "ĐANG TÌM…" : "KHÁM PHÁ"}</span>

        <span
          className={`text-base transition ${
            busy ? "animate-pulse" : "group-hover/button:translate-x-1"
          }`}
        >
          {busy ? "◇" : "→"}
        </span>
      </button>
    </form>
  );
}
