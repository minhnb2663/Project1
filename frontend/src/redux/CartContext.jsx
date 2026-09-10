import { createContext, useContext, useEffect, useMemo, useState } from "react";
const CartContext = createContext(null),
  KEY = "artmind_cart";
export const useCart = () => useContext(CartContext);
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);
  const add = (item) =>
    setItems((current) => {
      const found = current.find((x) => x._id === item._id);
      return found
        ? current.map((x) =>
            x._id === item._id
              ? { ...x, quantity: Math.min(x.quantity + 1, 10) }
              : x,
          )
        : [...current, { ...item, quantity: 1 }];
    });
  const update = (id, quantity) =>
    setItems((current) =>
      current.map((x) =>
        x._id === id
          ? { ...x, quantity: Math.max(1, Math.min(quantity, 10)) }
          : x,
      ),
    );
  const remove = (id) =>
    setItems((current) => current.filter((x) => x._id !== id));
  const clear = () => setItems([]);
  const value = useMemo(
    () => ({
      items,
      add,
      update,
      remove,
      clear,
      count: items.reduce((s, x) => s + x.quantity, 0),
      subtotal: items.reduce(
        (s, x) => s + (Number(x.price) || 0) * x.quantity,
        0,
      ),
    }),
    [items],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
