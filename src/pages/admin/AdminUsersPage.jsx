import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import { Users, Mail, UserCheck, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { AdminPagination } from "../../components/AdminPagination";
import SearchInput from "../../components/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-border">
      <td className="px-4 py-3"><div className="h-3 w-10 rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-3 w-28 rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-3 w-40 rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-3 w-24 rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-muted" /></td>
    </tr>
  );
}

// ─── Sort Header Cell ──────────────────────────────────────────────────────────
function SortHeader({ label, field, sortBy, sortDir, onSort }) {
  const isActive = sortBy === field;
  return (
    <th
      className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer select-none group"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className={`transition-colors ${isActive ? "text-primary" : "text-border group-hover:text-muted-foreground"}`}>
          {isActive
            ? sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
            : <ChevronsUpDown className="w-3.5 h-3.5" />
          }
        </span>
      </div>
    </th>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-synced pagination / sort / search state
  const page = Number(searchParams.get("page") || 0);
  const size = Number(searchParams.get("size") || 10);
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") || "desc";
  const searchParam = searchParams.get("search") || "";

  // Local controlled search input → debounced → URL param
  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput, 350);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  const setParam = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) next.delete(k);
        else next.set(k, String(v));
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.listAllUsers({ page, size, sortBy, sortDir, search: searchParam });
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          const total = res.data.length;
          setTotalElements(total);
          setTotalPages(Math.ceil(total / size) || 1);
          setActiveUsersCount(res.data.filter((u) => u.active !== false).length);

          // Page window for flat list
          const start = page * size;
          setUsers(res.data.slice(start, start + size));
        } else {
          const content = res.data.content || [];
          setUsers(content);
          setTotalElements(res.data.totalElements || content.length || 0);
          setTotalPages(res.data.totalPages || Math.ceil((res.data.totalElements || content.length) / size) || 1);
          setActiveUsersCount(content.filter((u) => u.active !== false).length);
        }
      } else {
        toast.error(res.message || "Failed to load users");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir, searchParam]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Sync debouncedSearch → URL (resets page to 0)
  useEffect(() => {
    setParam({ search: debouncedSearch || undefined, page: 0 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setParam({ sortDir: sortDir === "asc" ? "desc" : "asc", page: 0 });
    } else {
      setParam({ sortBy: field, sortDir: "asc", page: 0 });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
        Customers Directory
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Total Customers", value: totalElements, color: "#1565C0", bg: "#E3F2FD", Icon: Users },
          { label: "Active Accounts", value: activeUsersCount, color: "#2E7D32", bg: "#E8F5E9", Icon: UserCheck },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.Icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: kpi.color }}>
                  {loading ? "—" : kpi.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-sm text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
              Customer Accounts
            </h2>
            <p className="text-xs text-muted-foreground">List of registered user profiles on the platform.</p>
          </div>
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onClear={() => setSearchInput("")}
            isLoading={loading && !!debouncedSearch}
            placeholder="Search by name, email or phone…"
            className="sm:w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#f8f9fc" }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">ID</th>
                <SortHeader label="Name" field="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Email" field="email" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Role</th>
                <SortHeader label="Joined" field="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : users.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">
                        {searchParam ? `No results found matching "${searchParam}"` : "No users found"}
                      </p>
                    </td>
                  </tr>
                )
                : users.map((user) => {
                  const isActive = user.active !== false;
                  const roleLabel = (user.role || "").replace("ROLE_", "");
                  const isAdmin = roleLabel.toUpperCase() === "ADMIN";
                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-muted-foreground text-xs">#{user.id}</td>
                      <td className="px-4 py-3 font-semibold">
                        <div className="flex items-center gap-2">
                          {user.name}
                          {roleLabel && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isAdmin ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                              {roleLabel}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.phone || "N/A"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={(p) => setParam({ page: p })}
          onPageSizeChange={(s) => setParam({ size: s, page: 0 })}
          loading={loading}
        />
      </div>
    </div>
  );
}
