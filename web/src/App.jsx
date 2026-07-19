import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Viewer from "./components/Viewer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./contexts/AuthContext";

const API_BASE = "http://localhost:8000";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return children;
}

function HeatmapViewer() {
  const { websiteId } = useParams();
  const { token } = useAuth();
  const [siteUrl, setSiteUrl] = useState("");
  const [path, setPath] = useState("/");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWebsite() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/websites/${websiteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSiteUrl(data.url);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    fetchWebsite();
  }, [websiteId, token]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        siteUrl={siteUrl}
        path={path}
        onPathChange={setPath}
      />
      <Viewer siteUrl={siteUrl} path={path} apiBase={API_BASE} />
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate replace to="/" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate replace to="/" /> : <RegisterPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/site/:websiteId"
        element={
          <ProtectedRoute>
            <HeatmapViewer />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
