import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Viewer from "./components/Viewer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
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

function Dashboard() {
  const [siteUrl, setSiteUrl] = useState("http://localhost:5174");
  const [path, setPath] = useState("/");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        siteUrl={siteUrl}
        onUrlChange={setSiteUrl}
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
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
