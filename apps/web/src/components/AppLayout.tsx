import { Link, Outlet } from "react-router-dom";
import { useCurrentUser, useLogout } from "../lib/auth";

export function AppLayout() {
  const { data } = useCurrentUser();
  const logout = useLogout();
  const user = data?.user;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="bg-white/80 backdrop-blur border-b border-ink/8 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/">
            <img src="/daydrive-logo.svg" alt="DayDrive" className="h-10 w-auto" />
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="text-amber-600 hover:text-amber-500 font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 transition"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/portal"
                  className="text-ink/60 hover:text-ink font-medium px-3 py-1.5 rounded-lg hover:bg-ink/5 transition"
                >
                  My documents
                </Link>
                <span className="text-ink/30 hidden sm:block">{user.email}</span>
                <button
                  onClick={() => logout.mutate()}
                  className="text-ink/60 hover:text-ink font-medium px-3 py-1.5 rounded-lg hover:bg-ink/5 transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-ink/60 hover:text-ink font-medium px-3 py-1.5 rounded-lg hover:bg-ink/5 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-ink text-paper font-bold px-4 py-1.5 hover:bg-ink-700 transition shadow"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="relative max-w-2xl mx-auto px-4 py-10">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-ink/8 py-6 px-4 text-center text-xs text-ink/40">
        © 2023 DayDrive · Underwritten by Highway Insurance Company Limited ·{" "}
        <span>Authorised and regulated by the FCA</span>
      </footer>
    </div>
  );
}
