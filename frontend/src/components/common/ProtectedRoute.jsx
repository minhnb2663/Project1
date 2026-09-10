import { Navigate } from "react-router-dom";
import { useAuth } from "../../redux/AuthContext";
import Loader from "./Loader";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
}
