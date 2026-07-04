import { useState } from "react";
import { Button, Card, Chip, Typography } from "@heroui/react";
import { Flame, Globe, ArrowRight, Layers, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function Sidebar({ siteUrl, onUrlChange, path, onPathChange }) {
  const { user, logout } = useAuth();
  const [inputUrl, setInputUrl] = useState(siteUrl);
  const [inputPath, setInputPath] = useState(path);

  function handleSubmit(e) {
    e.preventDefault();
    let url = inputUrl.trim();
    if (url && !url.startsWith("http")) {
      url = "http://" + url;
    }
    onUrlChange(url);
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4">
        <span className="grid size-8 place-items-center rounded-lg bg-red-600 text-white">
          <Flame className="size-4" />
        </span>
        <span className="text-lg font-semibold text-slate-950">Redspot</span>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <div>
          <Typography className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
            Target Site
          </Typography>
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <Globe className="size-4 shrink-0 text-slate-400" />
              <input
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://localhost:5174"
                type="text"
                value={inputUrl}
              />
            </div>
            <Button fullWidth size="sm" type="submit">
              Load Site
              <ArrowRight className="size-3.5" />
            </Button>
          </form>
        </div>

        <div>
          <Typography className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
            Page Path
          </Typography>
          <div className="flex gap-2">
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="/"
              type="text"
              value={inputPath}
            />
            <Button
              size="sm"
              onPress={() => onPathChange(inputPath.trim() || "/")}
            >
              Go
            </Button>
          </div>
        </div>

        <div>
          <Typography className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
            View Mode
          </Typography>
          <div className="flex flex-col gap-1">
            <ViewModeItem active icon={Layers} label="Heatmap" />
            <ViewModeItem icon={BarChart3} label="Stats" />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Card className="bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Chip color="success" size="sm" variant="soft">
                Live
              </Chip>
              <span className="text-xs text-slate-500">Tracking active</span>
            </div>
          </Card>

          {user && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700">
                  {user.name}
                </p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                className="ml-2 shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                onClick={logout}
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function PageItem({ label, active }) {
  return (
    <button
      className={`rounded-md px-3 py-1.5 text-left text-sm transition ${
        active
          ? "bg-slate-100 font-medium text-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function ViewModeItem({ icon: Icon, label, active }) {
  return (
    <button
      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition ${
        active
          ? "bg-slate-100 font-medium text-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

export default Sidebar;