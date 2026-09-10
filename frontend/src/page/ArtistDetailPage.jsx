import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { artist } from "../services/artistApi";
import GalleryGrid from "../components/gallery/GalleryGrid";
import Loader from "../components/common/Loader";

export default function ArtistDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  // =========================
  // LẤY THÔNG TIN NGHỆ SĨ
  // =========================
  useEffect(() => {
    window.scrollTo(0, 0);

    artist(slug)
      .then(setData)
      .catch(() => setData(null));
  }, [slug]);

  if (!data) return <Loader />;

  const a = data.data;

  return (
    <main className="overflow-hidden bg-[#f3ecdd] text-[#2c261f]">
      {/* =====================================================
          1. THÔNG TIN NGHỆ SĨ
      ===================================================== */}
      <article className="relative overflow-hidden border-b border-[#b8a98d]">
        {/* NỀN GIẤY CỔ */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.75),transparent_30%),linear-gradient(135deg,#f8f1e3,#e8dcc7)]" />

        {/* VÒNG TRÒN TRANG TRÍ */}
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-[#8b6c3f]/10" />

        <div className="absolute -right-20 top-40 h-[330px] w-[330px] rounded-full border border-[#8b6c3f]/10" />

        <div className="relative mx-auto max-w-[1500px] px-6 py-14 md:px-12 lg:px-20">
          {/* =========================
              HEADER NHỎ
          ========================= */}
          <div className="mb-14 flex flex-col justify-between gap-4 border-b border-[#b8a98d] pb-6 sm:flex-row sm:items-center">
            <Link
              to="/artists"
              className="group flex items-center gap-3 text-[9px] font-bold tracking-[3px] text-[#725f45]"
            >
              <span className="transition group-hover:-translate-x-1">←</span>
              CHỈ MỤC NGHỆ SĨ
            </Link>

            <span className="text-[8px] tracking-[3px] text-[#94846d]">
              ARTMIND REVIEW / BIOGRAPHY
            </span>
          </div>

          {/* =========================
              NỘI DUNG CHÍNH
          ========================= */}
          <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            {/* =========================
                ẢNH NGHỆ SĨ
            ========================= */}
            <figure className="relative">
              {/* KHUNG NGOÀI */}
              <div className="relative mx-auto max-w-[430px] border border-[#a89270] bg-[#e8ddca] p-3 shadow-[0_30px_70px_rgba(62,49,32,0.18)]">
                {/* KHUNG TRONG */}
                <div className="border-[6px] border-[#3a3026] bg-[#332a22] p-2">
                  <img
                    src={a.portrait}
                    alt={a.name}
                    className="aspect-[4/5] w-full object-cover grayscale-[20%]"
                  />
                </div>

                {/* GÓC TRANG TRÍ */}
                <span className="absolute -left-3 -top-3 h-10 w-10 border-l border-t border-[#8b6c3f]" />

                <span className="absolute -bottom-3 -right-3 h-10 w-10 border-b border-r border-[#8b6c3f]" />
              </div>

              {/* CHÚ THÍCH */}
              <figcaption className="mx-auto mt-6 flex max-w-[430px] justify-between border-t border-[#b8a98d] pt-3 text-[8px] tracking-[2px] text-[#7f705d]">
                <span>{a.name}</span>

                <span>{a.nationality}</span>
              </figcaption>

              {/* SỐ TRANG TRÍ */}
              <span className="absolute -bottom-10 -left-3 hidden font-['Playfair_Display'] text-[100px] italic leading-none text-[#8b6c3f]/10 md:block">
                01
              </span>
            </figure>

            {/* =========================
                TIỂU SỬ
            ========================= */}
            <div className="relative">
              {/* THỜI KỲ / PHONG CÁCH */}
              <small className="block text-[9px] font-semibold tracking-[3px] text-[#8b6c3f]">
                {a.period}

                {a.styles?.length ? ` / ${a.styles.join(" · ")}` : ""}
              </small>

              {/* TÊN NGHỆ SĨ */}
              <h1 className="mt-6 font-['Playfair_Display'] text-5xl font-medium leading-[0.95] tracking-tight sm:text-6xl lg:text-[82px]">
                {a.name}
              </h1>

              {/* ĐƯỜNG TRANG TRÍ */}
              <div className="my-9 flex items-center gap-4">
                <span className="h-2 w-2 rotate-45 border border-[#8b6c3f]" />

                <span className="h-px w-28 bg-[#a58d68]" />

                <span className="text-[8px] tracking-[3px] text-[#8e806c]">
                  ARTIST ARCHIVE
                </span>
              </div>

              {/* CÂU NÓI */}
              {a.quote && (
                <blockquote className="max-w-2xl border-l border-[#9c8056] pl-7 font-['Playfair_Display'] text-2xl italic leading-relaxed text-[#65523b] md:text-3xl">
                  “{a.quote}”
                </blockquote>
              )}

              {/* TIỂU SỬ */}
              <div className="mt-9 max-w-2xl">
                <span className="mb-3 block text-[8px] font-bold tracking-[3px] text-[#907957]">
                  BIOGRAPHY
                </span>

                <p
                  className="
                    text-sm
                    leading-8
                    text-[#685f52]
                    first-letter:float-left
                    first-letter:mr-3
                    first-letter:mt-2
                    first-letter:font-['Playfair_Display']
                    first-letter:text-6xl
                    first-letter:leading-[0.7]
                    first-letter:text-[#8b6c3f]
                  "
                >
                  {a.biography}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* =====================================================
          2. DẢI THÔNG TIN GIỮA
      ===================================================== */}
      <section className="border-b border-[#b8a98d] bg-[#302820] px-6 py-4 text-[#eadcc5]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 overflow-hidden">
          <span className="whitespace-nowrap text-[8px] tracking-[3px]">
            ARTMIND ARTIST ARCHIVE
          </span>

          <span className="h-px flex-1 bg-white/10" />

          <span className="hidden whitespace-nowrap text-[8px] tracking-[3px] md:block">
            {a.nationality}
          </span>

          <span className="hidden h-px flex-1 bg-white/10 md:block" />

          <span className="whitespace-nowrap text-[8px] tracking-[3px]">
            EST. 2026
          </span>
        </div>
      </section>

      {/* =====================================================
          3. TÁC PHẨM CỦA NGHỆ SĨ
      ===================================================== */}
      <section className="bg-[#f8f4ec] px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1500px]">
          {/* HEADER */}
          <header className="mb-16 grid gap-8 border-b border-[#b8a98d] pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="text-[9px] font-bold tracking-[4px] text-[#8b6c3f]">
                02 / TÁC PHẨM TRONG KHO LƯU TRỮ
              </span>

              <h2 className="mt-5 font-['Playfair_Display'] text-4xl font-medium leading-[1.05] md:text-6xl">
                Một số dấu ấn
                <br />
                của <em className="font-normal text-[#8b6c3f]">{a.name}.</em>
              </h2>
            </div>

            {/* SỐ TÁC PHẨM */}
            <div className="flex items-end gap-3">
              <b className="font-['Playfair_Display'] text-5xl font-normal text-[#8b6c3f]">
                {String(data.artworks?.length || 0).padStart(2, "0")}
              </b>

              <span className="pb-2 text-[8px] tracking-[2px] text-[#887965]">
                WORKS
              </span>
            </div>
          </header>

          {/* =========================
              GALLERY
          ========================= */}
          {data.artworks?.length ? (
            <GalleryGrid items={data.artworks} />
          ) : (
            <div className="flex min-h-[250px] flex-col items-center justify-center border border-dashed border-[#b8a98d] text-center">
              <span className="font-['Playfair_Display'] text-5xl text-[#ad9878]">
                ◇
              </span>

              <p className="mt-4 text-sm text-[#786d5d]">
                Chưa có tác phẩm của nghệ sĩ này trong kho lưu trữ.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          4. CUỐI TRANG
      ===================================================== */}
      <section className="bg-[#302820] px-6 py-20 text-center text-[#eadfce]">
        <span className="text-[8px] tracking-[4px] text-[#af966e]">
          CONTINUE EXPLORING
        </span>

        <h3 className="mx-auto mt-5 max-w-2xl font-['Playfair_Display'] text-3xl md:text-5xl">
          Mỗi nghệ sĩ là một
          <br />
          <em className="font-normal text-[#c5a16b]">cách nhìn thế giới.</em>
        </h3>

        <Link
          to="/artists"
          className="group mt-9 inline-flex items-center gap-6 border border-[#a98d63] px-6 py-4 text-[9px] font-bold tracking-[2px] transition hover:bg-[#b69768] hover:text-[#302820]"
        >
          KHÁM PHÁ NGHỆ SĨ KHÁC
          <span className="text-base transition group-hover:translate-x-2">
            →
          </span>
        </Link>
      </section>
    </main>
  );
}
