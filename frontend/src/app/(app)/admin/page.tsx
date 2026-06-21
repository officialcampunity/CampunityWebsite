"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  LuUsers, LuFileText, LuFlag, LuChartBar, LuSearch,
  LuTrash2, LuShield, LuCheck, LuTriangleAlert, LuRefreshCw,
} from "react-icons/lu";
import type { User, Resource, Report, AdminStats } from "@/lib/types";

type Tab = "stats" | "users" | "resources" | "reports";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stats");

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "superadmin"))) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || (user.role !== "admin" && user.role !== "superadmin")) {
    return null;
  }

  return (
    <div className="py-4 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage users, resources, and reports
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-white/10 pb-0.5">
        {([
          { key: "stats" as Tab, label: "Stats", icon: LuChartBar },
          { key: "users" as Tab, label: "Users", icon: LuUsers },
          { key: "resources" as Tab, label: "Resources", icon: LuFileText },
          { key: "reports" as Tab, label: "Reports", icon: LuFlag },
        ]).map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-lg transition ${
                active
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "stats" && <StatsPanel />}
      {tab === "users" && <UsersPanel />}
      {tab === "resources" && <ResourcesPanel />}
      {tab === "reports" && <ReportsPanel />}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

function StatsPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-sm">Loading stats...</div>;

  const cards = [
    { label: "Users", value: stats?.users ?? 0, icon: LuUsers, color: "bg-blue-500" },
    { label: "Resources", value: stats?.resources ?? 0, icon: LuFileText, color: "bg-green-500" },
    { label: "Reports", value: stats?.reports ?? 0, icon: LuFlag, color: "bg-orange-500" },
    { label: "Posts", value: stats?.posts ?? 0, icon: LuTriangleAlert, color: "bg-purple-500" },
    { label: "Stories", value: stats?.stories ?? 0, icon: LuRefreshCw, color: "bg-pink-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 p-5">
            <div className={`w-10 h-10 rounded-xl ${card.color} bg-opacity-20 flex items-center justify-center mb-3`}>
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold dark:text-white">{card.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  function fetch() {
    setLoading(true);
    api.admin.getUsers(page, limit, search || undefined)
      .then((res) => {
        setUsers(res.data as unknown as User[]);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetch() }, [page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetch();
  }

  async function handleRoleChange(id: string, role: string) {
    try {
      await api.admin.updateUserRole(id, role);
      fetch();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.admin.deleteUser(id);
      fetch();
    } catch {}
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <form onSubmit={handleSearch} className="relative mb-4 max-w-xs">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
        />
      </form>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : (
        <>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold overflow-hidden flex-shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              u.displayName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="font-medium dark:text-white">{u.displayName}</span>
                          <span className="text-gray-400">@{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role || "user"}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 dark:text-white outline-none"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                          <option value="superadmin">superadmin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-400 hover:text-red-600 transition p-1"
                          title="Delete user"
                        >
                          <LuTrash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 dark:text-white"
              >
                Prev
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 dark:text-white"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ResourcesPanel() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  function fetch() {
    setLoading(true);
    api.admin.getResources(page, limit, search || undefined)
      .then((res) => {
        setResources(res.data);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetch() }, [page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resource?")) return;
    try {
      await api.admin.deleteResource(id);
      fetch();
    } catch {}
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <form onSubmit={handleSearch} className="relative mb-4 max-w-xs">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resources..."
          className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
        />
      </form>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : (
        <>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Author</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <span className="font-medium dark:text-white line-clamp-1">{r.title}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {r.author?.displayName || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full dark:text-gray-300">
                          {r.resourceType?.type || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-red-400 hover:text-red-600 transition p-1"
                          title="Delete resource"
                        >
                          <LuTrash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 dark:text-white"
              >
                Prev
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 dark:text-white"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReportsPanel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  function fetch() {
    setLoading(true);
    api.admin.getReports(page, limit)
      .then((res) => {
        setReports(res.data);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetch() }, [page]);

  async function handleResolve(id: string) {
    try {
      await api.admin.resolveReport(id);
      fetch();
    } catch {}
  }

  const totalPages = Math.ceil(total / limit);

  const statusBadge = (status: string) => {
    const isResolved = status === "Resolved";
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        isResolved
          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
          : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
      }`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : (
        <>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-4 py-3 font-medium">Reporter</th>
                    <th className="px-4 py-3 font-medium">Target</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <span className="dark:text-white line-clamp-1">{r.reason}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {r.reporter?.displayName || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {r.resource
                          ? <span className="line-clamp-1">{r.resource.title}</span>
                          : r.reportedUser
                          ? `@${r.reportedUser.username}`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">{statusBadge(r.status)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {r.status !== "Resolved" && (
                          <button
                            onClick={() => handleResolve(r.id)}
                            className="text-green-500 hover:text-green-700 transition p-1"
                            title="Resolve report"
                          >
                            <LuCheck size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 dark:text-white"
              >
                Prev
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 dark:text-white"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
