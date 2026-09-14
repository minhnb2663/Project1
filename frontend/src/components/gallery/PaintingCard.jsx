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

  const hasCollectionAction = Boolean(onAddToCollection || onRemoveFromCollection);
  const isCollectionToggle = collectionMode === "toggle";

  const handleCollectionAction = () => {
    if (isCollectionPending) return;

    if (collectionMode === "remove" || (isCollectionToggle && isSaved)) {
      onRemoveFromCollection?.(item);
      return;
    }

    onAddToCollection?.(item);
  };

  const collectionHeartButton = isCollectionToggle && hasCollectionAction ? (
    <button
      type="button"
      onClick={handleCollectionAction}
      disabled={isCollectionPending}
      aria-pressed={isSaved}
      aria-label={
        isCollectionPending
          ? "Đang cập nhật bộ sưu tập"
          : isSaved
            ? "Xóa khỏi bộ sưu tập"
            : "Thêm vào bộ sưu tập"
      }
      title={isSaved ? "Xóa khỏi bộ sưu tập" : "Thêm vào bộ sưu tập"}
      className={`group/heart grid h-[42px] w-[42px] shrink-0 place-items-center border transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B2C2C] ${
        isCollectionPending
          ? "cursor-wait border-[#c3b398] text-[#9b8d7a] opacity-60"
          : isSaved
            ? "border-[#9B2C2C] bg-[#9B2C2C] text-[#F7F4EF] hover:bg-[#7f2323]"
            : "border-[#9d8058] text-[#715433] hover:border-[#9B2C2C] hover:text-[#9B2C2C]"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`h-[18px] w-[18px] transition-transform duration-300 group-hover/heart:scale-110 ${
          isCollectionPending ? "animate-pulse" : ""
        }`}
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    </button>
  ) : null;

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

            <div className="flex items-center gap-2">
              {collectionHeartButton}

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
          </div>
        )}

        {isCollectionToggle &&
          hasCollectionAction &&
          (item.isAvailable === false || Number(item.price) <= 0) && (
            <div className="mt-6 flex justify-end border-y border-[#bbaa8d] py-4">
              {collectionHeartButton}
            </div>
          )}

        {!isCollectionToggle && hasCollectionAction && (
          <button
            type="button"
            disabled={isCollectionPending || (collectionMode === "add" && isSaved)}
            aria-pressed={isSaved}
            onClick={handleCollectionAction}
            className={`group/collection mt-5 flex w-full items-center justify-between border-b pb-4 text-left transition ${
              isCollectionPending
                ? "cursor-wait border-[#c3b398] text-[#8b806f] opacity-60"
                : collectionMode === "remove"
                  ? "border-[#c3b398] text-[#9B2C2C] hover:border-[#9B2C2C]"
                  : isSaved
                    ? "cursor-default border-[#c3b398] text-[#8b806f]"
                    : "border-[#c3b398] text-[#766247] hover:border-[#8b6c3f] hover:text-[#8b6c3f]"
            }`}
          >
            <span className="text-[8px] font-bold uppercase tracking-[2px]">
              {isCollectionPending
                ? collectionMode === "remove"
                  ? "Đang xóa..."
                  : "Đang lưu..."
                : collectionMode === "remove"
                  ? "Bỏ khỏi bộ sưu tập"
                  : isSaved
                    ? "Đã thêm vào bộ sưu tập"
                    : "Thêm vào bộ sưu tập"}
            </span>

            <span
              aria-hidden="true"
              className="font-['Playfair_Display'] text-lg transition group-hover/collection:translate-x-1"
            >
              {collectionMode === "remove" ? "×" : isSaved ? "✓" : "+"}
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
