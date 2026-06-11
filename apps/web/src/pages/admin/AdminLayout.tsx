import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../../lib/auth";

export function AdminLayout() {
  const { data, isLoading } = useCurrentUser();
  const user = data?.user;

  if (isLoading) return null;
  if (!user || user.role !== "ADMIN") return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-ink/8 flex flex-col bg-white">
        <div className="px-5 py-4 border-b border-ink/8">
          <Link to="/">
            <img src="/daydrive-logo.svg" alt="DayDrive" className="h-8 w-auto" />
          </Link>
          <p className="text-xs text-amber-600 mt-1 font-semibold uppercase tracking-wider">Admin</p>
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
                    ? "bg-mint/15 text-mint-700"
                    : "text-ink/60 hover:text-ink hover:bg-ink/5"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-ink/8 text-xs text-ink/40 truncate">{user.email}</div>
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
