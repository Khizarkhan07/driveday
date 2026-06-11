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
      <h1 className="text-2xl font-display font-bold text-ink">Users</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by email or name…"
          className="flex-1 rounded-xl bg-white border border-ink/15 px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-mint focus:border-mint transition"
        />
        <button
          type="submit"
          className="rounded-xl bg-mint text-ink font-bold px-5 py-2.5 text-sm hover:bg-mint-600 transition"
        >
          Search
        </button>
      </form>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <p className="text-ink/55 text-sm p-6">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/8 text-ink/45 text-xs uppercase tracking-wider bg-ink/[.02]">
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-5 py-3 font-semibold">Role</th>
                <th className="text-left px-5 py-3 font-semibold">Policies</th>
                <th className="text-left px-5 py-3 font-semibold">Last login</th>
                <th className="text-left px-5 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((u) => (
                <tr key={u.id} className="border-b border-ink/6 hover:bg-ink/[.02] transition last:border-0">
                  <td className="px-5 py-3">
                    <Link to={`/admin/users/${u.id}`} className="hover:text-mint-700 transition">
                      <p className="text-ink font-medium">{u.firstName} {u.lastName}</p>
                      <p className="text-ink/55 text-xs">{u.email}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={u.role === "ADMIN" ? "warning" : "neutral"}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-ink/70">{u._count.policies}</td>
                  <td className="px-5 py-3 text-ink/50 text-xs">{fmtDate(u.lastLoginAt)}</td>
                  <td className="px-5 py-3 text-ink/50 text-xs">{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
              {data?.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink/40">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink/50">
          <span>{data.total} users total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-ink/15 hover:bg-ink/5 disabled:opacity-40 transition text-ink"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-ink">Page {page} of {data.pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="px-3 py-1.5 rounded-lg bg-white border border-ink/15 hover:bg-ink/5 disabled:opacity-40 transition text-ink"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
