import { createContext, useContext, useEffect, useState } from "react";
import * as auth from "../services/authApi";
const Context = createContext(null);
export const useAuth = () => useContext(Context);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("art_token")) {
      setLoading(false);
      return;
    }
    auth
      .me()
      .then((x) => setUser(x.user))
      .catch(() => localStorage.removeItem("art_token"))
      .finally(() => setLoading(false));
  }, []);
  const commit = (x) => {
    localStorage.setItem("art_token", x.token);
    setUser(x.user);
    return x.user;
  };
  const signIn = async (x) => commit(await auth.login(x));
  const signUp = async (x) => commit(await auth.register(x));
  const logout = () => {
    localStorage.removeItem("art_token");
    setUser(null);
  };
  return (
    <Context.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </Context.Provider>
  );
}
