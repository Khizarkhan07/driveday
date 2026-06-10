import { Link, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser, useLogout } from "../lib/auth";

export function AppLayout() {
  const { data } = useCurrentUser();
  const logout = useLogout();
  const user = data?.user;
  const isLanding = useLocation().pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-ink-950">
      <header className="bg-ink-950/80 backdrop-blur border-b border-ink-800/60 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/daydrive-logo.svg" alt="Day Drive" className="h-12 w-auto" />
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                <Link
                  to="/portal"
                  className="text-ink-300 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-ink-800 transition"
                >
                  My documents
                </Link>
                <span className="text-ink-600 hidden sm:block">{user.email}</span>
                <button
                  onClick={() => logout.mutate()}
                  className="text-ink-400 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-ink-800 transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-ink-300 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-ink-800 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-brand-400 text-ink-950 font-bold px-4 py-1.5 hover:bg-brand-300 transition shadow-lg shadow-brand-400/20"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {isLanding ? (
          <Outlet />
        ) : (
          <div className="relative">
            {/* Subtle ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-400/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative max-w-2xl mx-auto px-4 py-10">
              <Outlet />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-ink-800/60 py-6 px-4 text-center text-xs text-ink-600">
        © 2023 Day Drive · Underwritten by Highway Insurance Company Limited ·{" "}
        <span>Authorised and regulated by the FCA</span>
      </footer>
    </div>
  );
}
