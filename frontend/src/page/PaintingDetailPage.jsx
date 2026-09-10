import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { painting, downloadUrl } from "../services/paintingApi";
import {
  addToCollection,
  getCollection,
  removeFromCollection,
} from "../services/collectionApi";
import { useAuth } from "../redux/AuthContext";
import Loader from "../components/common/Loader";
import GalleryGrid from "../components/gallery/GalleryGrid";

export default function Detail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [collectionBusy, setCollectionBusy] = useState(false);

  // =========================
  // LẤY CHI TIẾT TÁC PHẨM
  // =========================
  useEffect(() => {
    window.scrollTo(0, 0);

    painting(id)
      .then((x) => {
        setData(x.data);
        setSimilar((x.similar || []).filter(Boolean));
      })
      .catch((e) => toast.error(e.message));
  }, [id]);

  // =========================
  // KIỂM TRA TÁC PHẨM ĐÃ NẰM TRONG BỘ SƯU TẬP CHƯA
  // =========================
  useEffect(() => {
    if (authLoading) return undefined;

    if (!user) {
      setIsSaved(false);
      return undefined;
    }

    let cancelled = false;

    getCollection()
      .then((response) => {
        if (cancelled) return;

        const saved = (response.data || []).some(
          (item) => String(item?._id || item?.id) === String(id),
        );

        setIsSaved(saved);
      })
      .catch((error) => {
        if (cancelled) return;

        setIsSaved(false);

        if (error?.response?.status !== 401) {
          console.error("Load collection state failed:", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, user, authLoading]);

  if (!data) return <Loader />;

  const image =
    data.images?.find((x) => x.isPrimary)?.url || data.images?.[0]?.url;

  // =========================
  // THÊM / XÓA KHỎI BỘ SƯU TẬP
  // =========================
  const save = async () => {
    if (!user) {
      return toast.error("Vui lòng đăng nhập để lưu tác phẩm");
    }

    if (collectionBusy) return;

    setCollectionBusy(true);

    try {
      if (isSaved) {
        await removeFromCollection(id);
        setIsSaved(false);
        toast.success("Đã xóa khỏi bộ sưu tập");

        window.dispatchEvent(
          new CustomEvent("artmind:collection-updated", {
            detail: { action: "remove", paintingId: String(id) },
          }),
        );
      } else {
        await addToCollection(id);
        setIsSaved(true);
        toast.success("Đã thêm vào bộ sưu tập");

        window.dispatchEvent(
          new CustomEvent("artmind:collection-updated", {
            detail: { action: "add", paintingId: String(id) },
          }),
        );
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        toast.error(
          error?.response?.data?.message ||
            (isSaved
              ? "Không thể xóa tác phẩm khỏi bộ sưu tập."
              : "Không thể thêm tác phẩm vào bộ sưu tập."),
        );
      }

      console.error("Collection action failed:", error);
    } finally {
      setCollectionBusy(false);
    }
  };

  return (
    <main className="overflow-hidden bg-[#f2eadb] text-[#2d271f]">
      {/* =====================================================
          1. PHẦN ĐẦU HỒ SƠ
      ===================================================== */}
      <article>
        <header className="relative overflow-hidden border-b border-[#ad9b7c] bg-[#eee4d2]">
          {/* NỀN TRANG TRÍ */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.75),transparent_30%)]" />

          <span className="absolute -right-10 -top-24 hidden font-['Playfair_Display'] text-[300px] leading-none text-[#8b6c3f]/[0.035] lg:block">
            D
          </span>

          <div className="relative mx-auto max-w-[1500px] px-6 py-12 md:px-12 lg:px-20">
            {/* =========================
                THANH TRÊN
            ========================= */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#b5a588] pb-5 sm:flex-row sm:items-center">
              <Link
                to="/gallery"
                className="group flex items-center gap-3 text-[8px] font-bold tracking-[3px] text-[#755f40]"
              >
                <span className="transition group-hover:-translate-x-1">←</span>
                TRỞ LẠI KHO LƯU TRỮ
              </Link>

              <span className="text-[8px] tracking-[3px] text-[#94846d]">
                ARTMIND REVIEW / HỒ SƠ{" "}
                {String(data._id).slice(-4).toUpperCase()}
              </span>
            </div>

            {/* =========================
                TIÊU ĐỀ
            ========================= */}
            <div className="grid gap-12 py-14 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[4px] text-[#8b6c3f]">
                  {data.category?.name || "NGHỆ THUẬT"}
                  {" · "}
                  {data.style || "TUYỂN CHỌN"}
                </span>

                <h1 className="mt-5 max-w-4xl font-['Playfair_Display'] text-5xl font-medium leading-[0.95] tracking-tight sm:text-6xl lg:text-[82px]">
                  {data.title}
                </h1>

                <p className="mt-6 text-sm text-[#766a59]">
                  một tác phẩm của{" "}
                  <b className="font-['Playfair_Display'] text-lg font-medium text-[#5f4a30]">
                    {data.artist}
                  </b>
                </p>
              </div>

              {/* QUOTE */}
              <blockquote className="border-l border-[#9d8158] pl-7 font-['Playfair_Display'] text-xl italic leading-8 text-[#66543b] md:text-2xl">
                “Mỗi tác phẩm là một cuộc đối thoại chưa bao giờ thực sự kết
                thúc.”
              </blockquote>
            </div>
          </div>
        </header>

        {/* =====================================================
            2. HÌNH ẢNH TÁC PHẨM
        ===================================================== */}
        <section className="bg-[#302820] px-6 py-20 text-[#eadfce] md:px-12 lg:px-20">
          <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[1fr_270px]">
            {/* =========================
                TRANH
            ========================= */}
            <figure>
              <div className="mx-auto max-w-[900px] border border-[#9c7d51] bg-[#c9b388] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="border-[7px] border-[#211a15] bg-[#17130f] p-3">
                  {image ? (
                    <img
                      src={image}
                      alt={data.title}
                      className="mx-auto max-h-[760px] w-full object-contain"
                    />
                  ) : (
                    <div className="flex min-h-[500px] items-center justify-center bg-[#201b16] text-sm text-[#8f806d]">
                      Hình ảnh tác phẩm
                    </div>
                  )}
                </div>
              </div>

              {/* CHÚ THÍCH TRANH */}
              <figcaption className="mx-auto mt-5 max-w-[900px] border-t border-white/10 pt-4 text-[9px] leading-5 tracking-[1px] text-[#a99e8d]">
                <b className="text-[#c5a570]">HÌNH 01.</b> {data.title},{" "}
                {data.artist}. {data.colorMedium || "Chất liệu chưa xác định"}{" "}
                trên {data.surfaceMaterial || "bề mặt chưa xác định"}.
              </figcaption>
            </figure>

            {/* =========================
                THÔNG TIN TÁC PHẨM
            ========================= */}
            <aside className="border-t border-[#75634b] lg:border-l lg:border-t-0 lg:pl-7">
              <span className="mb-8 block text-[8px] font-bold tracking-[4px] text-[#c4a36e]">
                OBJECT RECORD
              </span>

              <Info label="HỌA SĨ" value={data.artist} />

              <Info label="PHONG CÁCH" value={data.style || "Chưa phân loại"} />

              <Info label="CHẤT LIỆU" value={data.colorMedium || "Chưa rõ"} />

              <Info label="BỀ MẶT" value={data.surfaceMaterial || "Chưa rõ"} />

              <Info label="LƯỢT ĐỌC" value={data.viewCount || 0} />

              <div className="mt-10 flex items-center gap-3">
                <span className="h-2 w-2 rotate-45 border border-[#b99763]" />

                <span className="h-px flex-1 bg-[#685944]" />
              </div>
            </aside>
          </div>
        </section>

        {/* =====================================================
            3. GHI CHÚ BIÊN TẬP
        ===================================================== */}
        <section className="relative bg-[#f1e8d8] px-6 py-24 md:px-12 lg:px-20">
          {/* SỐ LỚN */}
          <span className="absolute right-[4%] top-4 hidden font-['Playfair_Display'] text-[220px] italic leading-none text-[#806a49]/[0.04] lg:block">
            01
          </span>

          <div className="relative mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[160px_1fr_0.75fr]">
            {/* =========================
                LABEL
            ========================= */}
            <div>
              <span className="font-['Playfair_Display'] text-5xl font-normal text-[#8b6c3f]">
                01
              </span>

              <b className="mt-4 block text-[8px] leading-5 tracking-[3px] text-[#75644d]">
                GHI CHÚ
                <br />
                BIÊN TẬP
              </b>
            </div>

            {/* =========================
                DESCRIPTION
            ========================= */}
            <div>
              <p
                className="
                  max-w-2xl
                  text-sm
                  leading-8
                  text-[#655c4e]

                  first-letter:float-left
                  first-letter:mr-3
                  first-letter:mt-2
                  first-letter:font-['Playfair_Display']
                  first-letter:text-6xl
                  first-letter:leading-[0.7]
                  first-letter:text-[#8b6c3f]
                "
              >
                {data.description ||
                  "Chưa có ghi chú biên tập cho tác phẩm này."}
              </p>

            </div>

          </div>
        </section>

        {/* =====================================================
            4. LƯU / DOWNLOAD
        ===================================================== */}
        <section className="border-y border-[#ab9877] bg-[#e4d7c0] px-6 py-20 md:px-12 lg:px-20">
          <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            {/* TEXT */}
            <div>
              <span className="text-[8px] font-bold tracking-[4px] text-[#896d45]">
                LƯU TRỮ CÁ NHÂN
              </span>

              <h2 className="mt-5 font-['Playfair_Display'] text-4xl font-medium leading-tight md:text-5xl">
                Giữ tác phẩm này
                <br />
                <em className="font-normal text-[#8b6c3f]">trong tâm trí.</em>
              </h2>
            </div>

            {/* FAVORITE / COLLECTION TOGGLE */}
            <button
              type="button"
              onClick={save}
              disabled={collectionBusy}
              aria-pressed={isSaved}
              className={`group min-w-[290px] border px-6 py-4 text-[9px] font-bold tracking-[2px] transition disabled:cursor-wait disabled:opacity-60 ${
                isSaved
                  ? "border-[#9B2C2C] bg-[#9B2C2C] text-white hover:bg-[#7f2323]"
                  : "border-[#9f8057] bg-[#D4AF37] text-[#2A2421] hover:bg-[#b89528]"
              }`}
            >
              <span className="mr-3 font-serif text-lg">
                {collectionBusy ? "…" : isSaved ? "×" : "♡"}
              </span>

              {collectionBusy
                ? isSaved
                  ? "ĐANG XÓA..."
                  : "ĐANG LƯU..."
                : isSaved
                  ? "XÓA KHỎI BỘ SƯU TẬP"
                  : "LƯU VÀO BỘ SƯU TẬP"}
            </button>
          </div>
        </section>
      </article>

      {/* =====================================================
          5. TRANH TƯƠNG TỰ
      ===================================================== */}
      <section className="bg-[#f7f2e9] px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1500px]">
          <header className="mb-16 flex flex-col justify-between gap-8 border-b border-[#b8a98d] pb-10 md:flex-row md:items-end">
            <div>
              <span className="text-[9px] font-bold tracking-[4px] text-[#896d45]">
                02 / ĐỌC TIẾP
              </span>

              <h2 className="mt-5 font-['Playfair_Display'] text-4xl font-medium leading-[1.05] md:text-6xl">
                Những hồ sơ
                <br />
                <em className="font-normal text-[#8b6c3f]">cùng nhịp điệu.</em>
              </h2>
            </div>

            <span className="text-[8px] tracking-[3px] text-[#887761]">
              RELATED ARTWORKS / {String(similar.length).padStart(2, "0")}
            </span>
          </header>

          {/* GALLERY */}
          {similar.length ? (
            <GalleryGrid items={similar} />
          ) : (
            <div className="flex min-h-[250px] flex-col items-center justify-center border border-dashed border-[#baa98b] text-center">
              <span className="font-['Playfair_Display'] text-5xl text-[#a58b64]">
                ◇
              </span>

              <p className="mt-4 text-sm text-[#786d5d]">
                Chưa có tác phẩm tương tự.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          6. FOOT QUOTE
      ===================================================== */}
      <section className="bg-[#302820] px-6 py-20 text-center text-[#eaddc9]">
        <span className="text-[8px] tracking-[4px] text-[#a98d63]">
          ARTMIND REVIEW
        </span>

        <blockquote className="mx-auto mt-5 max-w-3xl font-['Playfair_Display'] text-3xl leading-tight md:text-5xl">
          Một bức tranh có thể im lặng.
          <br />
          <em className="font-normal text-[#c3a16b]">
            Nhưng chưa bao giờ vô lời.
          </em>
        </blockquote>

        <Link
          to="/gallery"
          className="group mt-9 inline-flex items-center gap-5 border border-[#a88b61] px-6 py-4 text-[8px] font-bold tracking-[2px] transition hover:bg-[#b79767] hover:text-[#302820]"
        >
          TRỞ LẠI KHO LƯU TRỮ
          <span className="transition group-hover:translate-x-2">→</span>
        </Link>
      </section>
    </main>
  );
}

// =========================================================
// COMPONENT THÔNG TIN NHỎ
// HỌA SĨ / PHONG CÁCH / CHẤT LIỆU...
// =========================================================
function Info({ label, value }) {
  return (
    <div className="border-b border-white/10 py-5">
      <small className="block text-[7px] tracking-[3px] text-[#897d6c]">
        {label}
      </small>

      <b className="mt-2 block font-['Playfair_Display'] text-lg font-normal text-[#e5d5bb]">
        {value}
      </b>
    </div>
  );
}
