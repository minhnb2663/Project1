import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../redux/CartContext";

const fallback =
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80";

const money = (v) => new Intl.NumberFormat("vi-VN").format(v || 0) + " ₫";

export default function PaintingCard({
  item,
  index = 0,
  onAddToCollection,
  onRemoveFromCollection,
  isSaved = false,
  isCollectionPending = false,
  collectionMode = "add",
}) {
  const { add } = useCart();

  const image =
    item.images?.find((x) => x.isPrimary)?.url ||
    item.images?.[0]?.url ||
    fallback;

  // =========================
  // THÊM VÀO GIỎ HÀNG
  // =========================
  const buy = () => {
    add({
      _id: item._id,
      title: item.title,
      artist: item.artist,
      price: item.price,
      image,
    });

    toast.success("Đã thêm vào giỏ hàng");
  };

  return (
    <article className="group relative">
      {/* =====================================================
          1. HÌNH ẢNH / KHUNG TRANH
      ===================================================== */}
      <Link to={`/paintings/${item._id}`} className="relative block">
        {/* SỐ THỨ TỰ */}
        <span className="absolute -left-2 -top-8 z-10 font-['Playfair_Display'] text-sm text-[#927752]">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* GÓC TRANG TRÍ */}
        <span className="absolute -left-3 -top-3 z-10 h-10 w-10 border-l border-t border-[#9a7c53]" />

        <span className="absolute -bottom-3 -right-3 z-10 h-10 w-10 border-b border-r border-[#9a7c53]" />

        {/* KHUNG NGOÀI */}
        <div className="border border-[#a58b63] bg-[#cbb58f] p-[6px] shadow-[0_15px_35px_rgba(62,46,28,0.12)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_25px_55px_rgba(62,46,28,0.18)]">
          {/* KHUNG TỐI */}
          <div className="overflow-hidden border-[5px] border-[#33291f] bg-[#211b16]">
            <img
              src={image}
              alt={item.title}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            />
          </div>
        </div>

        {/* HOVER OVERLAY */}
        <div className="pointer-events-none absolute inset-[11px] flex items-end bg-gradient-to-t from-[#211b16]/50 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100">
          <span className="m-5 text-[8px] font-bold tracking-[3px] text-[#eee0c9]">
            VIEW ARTWORK ↗
          </span>
        </div>
      </Link>

      {/* =====================================================
          2. THÔNG TIN TÁC PHẨM
      ===================================================== */}
      <div className="pt-7">
        {/* CATEGORY */}
        <div className="flex items-center gap-3">
          <span className="h-px w-7 bg-[#9d8159]" />

          <small className="text-[7px] font-bold uppercase tracking-[2px] text-[#8b7250]">
            {item.category?.name || "Hồ sơ nghệ thuật"}
            {" · "}
            {item.style || "Tuyển chọn"}
          </small>
        </div>

        {/* TITLE */}
        <h3 className="mt-4 font-['Playfair_Display'] text-2xl font-medium leading-tight text-[#342c24]">
          <Link
            to={`/paintings/${item._id}`}
            className="transition duration-300 hover:text-[#8b6c3f]"
          >
            {item.title}
          </Link>
        </h3>

        {/* ARTIST */}
        <b className="mt-2 block text-[9px] font-semibold uppercase tracking-[2px] text-[#856c4b]">
          {item.artist}
        </b>

        {/* DESCRIPTION */}
        <p className="mt-4 line-clamp-3 text-xs leading-6 text-[#786d5d]">
          {item.description ||
            "Một tác phẩm được tuyển chọn trong kho lưu trữ ArtMind."}
        </p>

        {/* =====================================================
            3. GIÁ + GIỎ HÀNG
        ===================================================== */}
        {item.isAvailable !== false && Number(item.price) > 0 && (
          <div className="mt-6 flex items-center justify-between border-y border-[#bbaa8d] py-4">
            {/* PRICE */}
            <div>
              <span className="block text-[7px] font-bold tracking-[2px] text-[#94836b]">
                ACQUISITION
              </span>

              <b className="mt-1 block font-['Playfair_Display'] text-lg font-medium text-[#715433]">
                {money(item.price)}
              </b>
            </div>

            {/* ADD CART */}
            <button
              type="button"
              onClick={buy}
              className="group/cart border border-[#9d8058] bg-[#302820] px-4 py-3 text-[8px] font-bold tracking-[1.5px] text-[#eaddc7] transition hover:bg-[#8b6c3f]"
            >
              <span className="mr-2 text-sm">＋</span>
              GIỎ HÀNG
            </button>
          </div>
        )}

        {(onAddToCollection || onRemoveFromCollection) && (
          <button
            type="button"
            disabled={isCollectionPending}
            aria-pressed={isSaved}
            onClick={() => {
              // Ở Gallery: chưa lưu => thêm, đã lưu => xóa.
              // Ở CollectionPage: luôn là thao tác xóa.
              if (collectionMode === "remove" || isSaved) {
                onRemoveFromCollection?.(item);
                return;
              }

              onAddToCollection?.(item);
            }}
            className={`group/collection mt-5 flex w-full items-center justify-between border-b pb-4 text-left transition ${
              isCollectionPending
                ? "cursor-wait border-[#c3b398] text-[#8b806f] opacity-60"
                : collectionMode === "remove" || isSaved
                  ? "border-[#c3b398] text-[#9B2C2C] hover:border-[#9B2C2C] hover:text-[#7f2323]"
                  : "border-[#c3b398] text-[#766247] hover:border-[#8b6c3f] hover:text-[#8b6c3f]"
            }`}
          >
            <span className="text-[8px] font-bold uppercase tracking-[2px]">
              {isCollectionPending
                ? collectionMode === "remove" || isSaved
                  ? "Đang xóa..."
                  : "Đang lưu..."
                : collectionMode === "remove" || isSaved
                  ? "Xóa khỏi bộ sưu tập"
                  : "Thêm vào bộ sưu tập"}
            </span>

            <span
              aria-hidden="true"
              className="font-['Playfair_Display'] text-lg transition group-hover/collection:translate-x-1"
            >
              {collectionMode === "remove" || isSaved ? "×" : "+"}
            </span>
          </button>
        )}

        {/* =====================================================
            4. ĐỌC HỒ SƠ
        ===================================================== */}
        <Link
          to={`/paintings/${item._id}`}
          className="group/link mt-5 flex items-center justify-between border-b border-[#c3b398] pb-4"
        >
          <span className="text-[8px] font-bold uppercase tracking-[2px] text-[#766247] transition group-hover/link:text-[#8b6c3f]">
            Đọc hồ sơ
          </span>

          <span className="font-['Playfair_Display'] text-lg text-[#8b6c3f] transition group-hover/link:translate-x-2">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
