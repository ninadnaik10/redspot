import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import {
  Flame,
  Plus,
  Globe,
  Trash2,
  ExternalLink,
  LogOut,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8000";

function getScriptTag(siteId) {
  return `<script
  defer
  src="${API_BASE}/track.js"
  data-site-id="${siteId}">
</script>`;
}

/* ── Add Website Dialog ── */
function AddWebsiteDialog({ open, onClose, token, onCreated }) {
  const [step, setStep] = useState("form"); // "form" | "script"
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdSite, setCreatedSite] = useState(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setStep("form");
    setName("");
    setUrl("");
    setError("");
    setSubmitting(false);
    setCreatedSite(null);
    setCopied(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    let finalUrl = url.trim();
    if (finalUrl && !finalUrl.startsWith("http")) {
      finalUrl = "http://" + finalUrl;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/websites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), url: finalUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add website");
      }
      const data = await res.json();
      setCreatedSite(data);
      setStep("script");
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getScriptTag(createdSite.site_id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            {step === "form" ? "Add Website" : "Install Tracking Script"}
          </h2>
          <button
            className="rounded-md p-1 text-slate-400 hover:text-slate-600"
            onClick={handleClose}
          >
            <X className="size-4" />
          </button>
        </div>

        {step === "form" ? (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Website Name
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
                onChange={(e) => setName(e.target.value)}
                placeholder="My Website"
                required
                type="text"
                value={name}
              />
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Website URL
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                type="text"
                value={url}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button size="sm" variant="flat" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={submitting}
                size="sm"
                type="submit"
              >
                Create
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <p className="mb-3 text-sm text-slate-600">
              Add this script to your website's{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">
                &lt;head&gt;
              </code>{" "}
              or before the closing{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">
                &lt;/body&gt;
              </code>{" "}
              tag:
            </p>

            <div className="relative rounded-lg border border-slate-200 bg-slate-900 p-4">
              <pre className="overflow-x-auto text-sm leading-relaxed text-green-400">
                <code>{getScriptTag(createdSite.site_id)}</code>
              </pre>
              <button
                className="absolute right-2 top-2 rounded-md bg-slate-800 p-1.5 text-slate-400 transition hover:text-white"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="size-4 text-green-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <Button color="primary" size="sm" onPress={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Dashboard Page ── */
export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchWebsites = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/websites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWebsites(await res.json());
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  async function handleDelete(websiteId) {
    try {
      await fetch(`${API_BASE}/api/v1/websites/${websiteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWebsites((prev) => prev.filter((w) => w.id !== websiteId));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-red-600 text-white">
              <Flame className="size-4" />
            </span>
            <span className="text-lg font-semibold text-slate-950">
              Redspot
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user?.name}</span>
            <button
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              onClick={logout}
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Websites</h1>
          <Button
            color="primary"
            size="sm"
            onPress={() => setDialogOpen(true)}
          >
            <Plus className="size-4" />
            Add Website
          </Button>
        </div>

        {/* Website List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
          </div>
        ) : websites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-20 text-center">
            <Globe className="mx-auto mb-3 size-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              No websites yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Add your first website to start tracking
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {websites.map((site) => (
              <div
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                key={site.id}
                onClick={() => navigate(`/site/${site.id}`)}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-red-50 group-hover:text-red-600">
                      <Globe className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {site.name}
                      </h3>
                    </div>
                  </div>
                  <button
                    className="shrink-0 rounded-md p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(site.id);
                    }}
                    title="Delete website"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ExternalLink className="size-3" />
                  <span className="truncate">{site.url}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Added {new Date(site.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Website Dialog */}
      <AddWebsiteDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        token={token}
        onCreated={fetchWebsites}
      />
    </div>
  );
}