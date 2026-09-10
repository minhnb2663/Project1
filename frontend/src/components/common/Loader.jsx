export default function Loader() {
  return (
    <div
      className="flex min-h-[300px] w-full items-center justify-center bg-transparent"
      aria-label="Đang tải"
      role="status"
    >
      <div className="flex flex-col items-center text-center">
        {/* =========================
            BIỂU TƯỢNG LOADING
        ========================= */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* VÒNG NGOÀI */}
          <span className="absolute inset-0 animate-spin rounded-full border border-[#b7a486] border-t-[#8b6c3f]" />

          {/* VÒNG TRONG */}
          <span className="absolute inset-[8px] animate-[spin_2s_linear_infinite_reverse] rounded-full border border-[#c8b99e] border-b-[#8b6c3f]" />

          {/* KIM CƯƠNG */}
          <span className="h-3 w-3 rotate-45 border border-[#8b6c3f] bg-[#f3ecdd]" />
        </div>

        {/* =========================
            TEXT
        ========================= */}
        <span className="mt-6 text-[8px] font-bold tracking-[4px] text-[#8b6c3f]">
          ARTMIND ARCHIVE
        </span>

        <p className="mt-3 font-['Playfair_Display'] text-lg italic text-[#625544]">
          Đang tuyển chọn tác phẩm…
        </p>

        {/* =========================
            DECOR
        ========================= */}
        <div className="mt-5 flex w-40 items-center gap-3">
          <span className="h-px flex-1 bg-[#b7a486]" />

          <span className="h-1.5 w-1.5 rotate-45 bg-[#9a7b52]" />

          <span className="h-px flex-1 bg-[#b7a486]" />
        </div>
      </div>
    </div>
  );
}
