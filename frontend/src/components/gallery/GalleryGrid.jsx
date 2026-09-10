import PaintingCard from "./PaintingCard";

export default function GalleryGrid({
  items = [],
  onAddToCollection,
  onRemoveFromCollection,
  savedItemIds = new Set(),
  pendingItemIds = new Set(),
  collectionMode = "add",
}) {
  const hasId = (source, itemId) => {
    if (!itemId) return false;
    const normalized = String(itemId);

    if (source instanceof Set) return source.has(normalized);
    if (Array.isArray(source)) return source.map(String).includes(normalized);
    return false;
  };

  if (items.length) {
    return (
      <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const itemId = item?._id || item?.id;

          return (
            <PaintingCard
              key={itemId || index}
              item={item}
              index={index}
              onAddToCollection={onAddToCollection}
              onRemoveFromCollection={onRemoveFromCollection}
              isSaved={hasId(savedItemIds, itemId)}
              isCollectionPending={hasId(pendingItemIds, itemId)}
              collectionMode={collectionMode}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden border border-dashed border-[#b3a080] bg-[#eee4d2] px-6 text-center">
      <span className="absolute right-5 top-0 font-['Playfair_Display'] text-[120px] leading-none text-[#8b6c3f]/[0.035]">
        00
      </span>

      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#9c7f57]">
        <span className="font-['Playfair_Display'] text-3xl text-[#8b6c3f]">◇</span>
      </div>

      <span className="mt-6 text-[8px] font-bold tracking-[4px] text-[#8b6c3f]">
        EMPTY ARCHIVE
      </span>

      <h3 className="mt-4 font-['Playfair_Display'] text-3xl font-medium text-[#342c24]">
        Chưa tìm thấy tác phẩm
      </h3>

      <p className="mt-3 max-w-md text-sm leading-7 text-[#786d5d]">
        Hãy thử một chuyên mục hoặc từ khóa khác.
      </p>

      <div className="mt-8 flex w-full max-w-xs items-center gap-4">
        <span className="h-px flex-1 bg-[#b4a183]" />
        <span className="h-2 w-2 rotate-45 border border-[#8b6c3f]" />
        <span className="h-px flex-1 bg-[#b4a183]" />
      </div>
    </div>
  );
}
