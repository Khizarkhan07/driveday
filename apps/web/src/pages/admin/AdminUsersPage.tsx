import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge, Card } from "../../components/ui";

interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  _count: { policies: number };
}

interface UsersResponse {
  users: UserRow[];
  total: number;
  page: number;
  pages: number;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { timeZone: "Europe/London" });
}

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [input, setInput] = useState("");

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ["admin", "users", search, page],
    queryFn: () => api.get(`/admin/users?search=${encodeURIComponent(search)}&page=${page}`),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(input);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Users</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by email or name…"
          className="flex-1 rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-sm text-white placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-400 text-ink-950 font-bold px-5 py-2.5 text-sm hover:bg-brand-300 transition"
        >
          Search
        </button>
      </form>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <p className="text-ink-400 text-sm p-6">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700/60 text-ink-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-5 py-3 font-semibold">Role</th>
                <th className="text-left px-5 py-3 font-semibold">Policies</th>
                <th className="text-left px-5 py-3 font-semibold">Last login</th>
                <th className="text-left px-5 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((u) => (
                <tr key={u.id} className="border-b border-ink-800/40 hover:bg-ink-800/40 transition last:border-0">
                  <td className="px-5 py-3">
                    <Link to={`/admin/users/${u.id}`} className="hover:text-brand-400 transition">
                      <p className="text-white font-medium">{u.firstName} {u.lastName}</p>
                      <p className="text-ink-400 text-xs">{u.email}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={u.role === "ADMIN" ? "warning" : "neutral"}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-ink-300">{u._count.policies}</td>
                  <td className="px-5 py-3 text-ink-400 text-xs">{fmtDate(u.lastLoginAt)}</td>
                  <td className="px-5 py-3 text-ink-400 text-xs">{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
              {data?.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-400">
          <span>{data.total} users total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-ink-800 border border-ink-700 hover:bg-ink-700 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="px-3 py-1.5">Page {page} of {data.pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="px-3 py-1.5 rounded-lg bg-ink-800 border border-ink-700 hover:bg-ink-700 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
