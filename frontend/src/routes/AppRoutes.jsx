import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ProtectedRoute from "../components/common/ProtectedRoute";
import ChatWidget from "../components/chatbot/ChatWidget";
import Loader from "../components/common/Loader";
import { useAuth } from "../redux/AuthContext";
import Home from "../page/HomePage";
import About from "../page/AboutPage";
import Contact from "../page/ContactPage";
import Gallery from "../page/GalleryPage";
import Artists from "../page/ArtistsPage";
import ArtistDetail from "../page/ArtistDetailPage";
import Search from "../page/SearchPage";
import Detail from "../page/PaintingDetailPage";
import Login from "../page/LoginPage";
import Register from "../page/RegisterPage";
import Dashboard from "../page/DashboardPage";
import Admin from "../page/AdminPage";
import Recognize from "../page/UploadRecognitionPage";
import NotFound from "../page/NotFoundPage";
import Cart from "../page/CartPage";
import Orders from "../page/OrdersPage";
import Collection from "../page/CollectionPage";
function ClientLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Admin />;
}
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ClientLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/:slug" element={<ArtistDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/paintings/:id" element={<Detail />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/collection"
          element={
            <ProtectedRoute>
              <Collection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route path="/recognize" element={<Recognize />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin/*" element={<AdminRoute />} />
    </Routes>
  );
}
