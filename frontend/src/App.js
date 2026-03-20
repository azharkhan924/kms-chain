import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Landing           from "./pages/Landing";
import Login             from "./pages/Login";
import AdminLogin        from "./pages/AdminLogin";
import Register          from "./pages/Register";
import UserDashboard     from "./pages/UserDashboard";
import VerifierDashboard from "./pages/VerifierDashboard";
import AdminDashboard    from "./pages/AdminDashboard";
import PublicVerify      from "./pages/PublicVerify";
import NotFound          from "./pages/NotFound";
import Certificate       from "./pages/Certificate";
import "./styles/global.css";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="full-loader">
      <div className="spinner" />
      <span style={{ fontSize:12, color:"var(--text-4)", marginTop:8 }}>Loading…</span>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

/* Logged-in users go to their dashboard; guests see the landing page */
const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-loader"><div className="spinner" /></div>;
  if (!user) return <Landing />;
  if (user.role === "ADMIN")    return <Navigate to="/admin"    replace />;
  if (user.role === "VERIFIER") return <Navigate to="/verifier" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "var(--surface)",
                color:      "var(--text-1)",
                border:     "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize:   "13px",
                fontFamily: "Inter, sans-serif",
                boxShadow:  "var(--shadow-md)",
              },
              success: { iconTheme: { primary:"#16a34a", secondary:"#fff" } },
              error:   { iconTheme: { primary:"#dc2626", secondary:"#fff" } },
            }}
          />
          <Routes>
            <Route path="/"            element={<HomeRoute />} />
            <Route path="/verify"      element={<PublicVerify />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/dashboard"   element={<ProtectedRoute allowedRoles={["USER"]}><UserDashboard /></ProtectedRoute>} />
            <Route path="/verifier"    element={<ProtectedRoute allowedRoles={["VERIFIER","ADMIN"]}><VerifierDashboard /></ProtectedRoute>} />
            <Route path="/admin"       element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/certificate/:id" element={<Certificate />} />
          <Route path="*"            element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
