import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-[#f3ecdd] px-6 text-[#2d271f]">

      {/* =========================
          NỀN TRANG TRÍ
      ========================= */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.75),transparent_30%),linear-gradient(135deg,#f7f0e3,#e9ddc8)]" />

      {/* VÒNG TRÒN CỔ ĐIỂN */}
      <div className="absolute -left-44 -top-44 h-[500px] w-[500px] rounded-full border border-[#8b6c3f]/10" />

      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full border border-[#8b6c3f]/10" />

      {/* 404 LỚN PHÍA SAU */}
      <span className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 font-['Playfair_Display'] text-[360px] leading-none text-[#8b6c3f]/[0.035] lg:block">
        404
      </span>

      {/* =========================
          NỘI DUNG
      ========================= */}
      <section className="relative z-10 w-full max-w-4xl text-center">

        {/* LABEL */}
        <div className="flex items-center justify-center gap-4">

          <span className="h-px w-12 bg-[#9d825b]" />

          <span className="text-[9px] font-bold tracking-[4px] text-[#8b6c3f]">
            ARTMIND / LOST ARCHIVE
          </span>

          <span className="h-px w-12 bg-[#9d825b]" />

        </div>


        {/* 404 */}
        <div className="mt-8 font-['Playfair_Display'] text-[110px] font-medium leading-none text-[#302820] sm:text-[150px] md:text-[190px]">
          404
        </div>


        {/* DECOR */}
        <div className="mx-auto my-8 flex max-w-xs items-center gap-4">

          <span className="h-px flex-1 bg-[#ad9b7c]" />

          <span className="h-3 w-3 rotate-45 border border-[#8b6c3f]" />

          <span className="h-px flex-1 bg-[#ad9b7c]" />

        </div>


        {/* TITLE */}
        <h1 className="font-['Playfair_Display'] text-3xl font-medium md:text-5xl">

          Bức tường này

          <br />

          <em className="font-normal text-[#8b6c3f]">
            đang trống.
          </em>

        </h1>


        {/* DESCRIPTION */}
        <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-[#786d5d]">
          Trang bạn đang tìm kiếm có thể đã được di chuyển,
          đổi tên hoặc không còn nằm trong phòng tranh ArtMind.
        </p>


        {/* BUTTON */}
        <Link
          to="/"
          className="group mt-9 inline-flex items-center gap-6 border border-[#9e8057] bg-[#302820] px-6 py-4 text-[9px] font-bold tracking-[2px] text-[#eadcc7] transition hover:bg-[#8b6c3f]"
        >
          TRỞ VỀ TRANG CHỦ

          <span className="text-base transition group-hover:translate-x-2">
            →
          </span>
        </Link>


        {/* FOOT NOTE */}
        <div className="mt-14 text-[8px] tracking-[3px] text-[#94846d]">
          ERROR 404 · ARTWORK NOT FOUND · MMXXVI
        </div>

      </section>

    </main>
  );
}