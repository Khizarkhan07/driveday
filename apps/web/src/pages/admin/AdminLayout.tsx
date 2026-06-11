import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../../lib/auth";

export function AdminLayout() {
  const { data, isLoading } = useCurrentUser();
  const user = data?.user;

  if (isLoading) return null;
  if (!user || user.role !== "ADMIN") return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex bg-ink-950">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-ink-800/60 flex flex-col">
        <div className="px-5 py-4 border-b border-ink-800/60">
          <Link to="/" className="flex items-center gap-2">
            <img src="/daydrive-logo.svg" alt="Day Drive" className="h-8 w-auto" />
          </Link>
          <p className="text-xs text-ink-500 mt-1 font-medium uppercase tracking-wider">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 text-sm">
          {[
            { to: "/admin", label: "Dashboard", end: true },
            { to: "/admin/users", label: "Users" },
            { to: "/admin/policies", label: "Policies" },
            { to: "/admin/events", label: "Event log" },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg font-medium transition ${
                  isActive
                    ? "bg-brand-400/15 text-brand-400"
                    : "text-ink-400 hover:text-white hover:bg-ink-800"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-ink-800/60 text-xs text-ink-500 truncate">{user.email}</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
