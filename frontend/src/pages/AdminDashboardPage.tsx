import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../lib/api';
import { genderOptions } from '../lib/schemas';

type Stats = { total: number; today: number; thisMonth: number };

type Registration = {
  id: string;
  name: string;
  gender: string;
  age: number;
  phoneNumber: string;
  address: string;
  occupation: string;
  createdAt: string;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const genderLabel = (value: string) =>
  genderOptions.find((g) => g.value === value)?.label ?? value;

export default function AdminDashboardPage() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<Registration[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        pageSize: 10,
        search: search || undefined,
        gender: gender || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy,
        sortOrder,
      };

      const [statsRes, listRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/registrations', { params }),
      ]);

      setStats(statsRes.data.data);
      setItems(listRes.data.data.items);
      setPagination(listRes.data.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard data.'));
    } finally {
      setLoading(false);
    }
  }, [page, search, gender, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const exportCsv = async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (gender) params.set('gender', gender);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);

    const response = await api.get(`/admin/registrations/export?${params.toString()}`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo compact />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">Signed in as {username}</span>
            <button type="button" className="btn-secondary !px-3 !py-2 text-xs" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-900">Admin Dashboard</h1>
            <p className="text-sm text-muted">Monitor and manage website registrations.</p>
          </div>
          <button type="button" className="btn-primary" onClick={exportCsv}>
            Export CSV
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total registered users', value: stats?.total },
            { label: 'Registrations today', value: stats?.today },
            { label: 'Registrations this month', value: stats?.thisMonth },
          ].map((card) => (
            <div key={card.label} className="card-surface p-5">
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-brand-900">
                {loading && stats === null ? '—' : card.value ?? 0}
              </p>
            </div>
          ))}
        </div>

        <div className="card-surface p-4 sm:p-5">
          <form
            className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-6"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              void loadData();
            }}
          >
            <input
              className="input-field lg:col-span-2"
              placeholder="Search name, phone, or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search registrations"
            />
            <select
              className="input-field"
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by gender"
            >
              <option value="">All genders</option>
              {genderOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="input-field"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              aria-label="From date"
            />
            <input
              type="date"
              className="input-field"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              aria-label="To date"
            />
            <button type="submit" className="btn-secondary">
              Apply
            </button>
          </form>

          <div className="mb-4 flex flex-wrap gap-2">
            <select
              className="input-field max-w-[180px]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'name')}
              aria-label="Sort by"
            >
              <option value="createdAt">Sort by date</option>
              <option value="name">Sort by name</option>
            </select>
            <select
              className="input-field max-w-[160px]"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              aria-label="Sort order"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <p className="py-10 text-center text-sm text-muted">Loading registrations…</p>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No registrations found.</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-3 py-3">Registration ID</th>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Gender</th>
                      <th className="px-3 py-3">Age</th>
                      <th className="px-3 py-3">Phone</th>
                      <th className="px-3 py-3">Occupation</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                        <td className="max-w-[140px] truncate px-3 py-3 font-mono text-xs">{item.id}</td>
                        <td className="px-3 py-3 font-medium">{item.name}</td>
                        <td className="px-3 py-3">{genderLabel(item.gender)}</td>
                        <td className="px-3 py-3">{item.age}</td>
                        <td className="px-3 py-3">{item.phoneNumber}</td>
                        <td className="px-3 py-3">{item.occupation}</td>
                        <td className="px-3 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-3">
                          <Link
                            to={`/admin/registrations/${item.id}`}
                            className="font-semibold text-accent-600 hover:text-accent-500"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 lg:hidden">
                {items.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-display text-lg font-semibold text-brand-900">{item.name}</p>
                    <p className="mt-1 break-all font-mono text-xs text-muted">{item.id}</p>
                    <dl className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Gender</dt>
                        <dd>{genderLabel(item.gender)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Age</dt>
                        <dd>{item.age}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Phone</dt>
                        <dd>{item.phoneNumber}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Occupation</dt>
                        <dd className="text-right">{item.occupation}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Date</dt>
                        <dd className="text-right">{new Date(item.createdAt).toLocaleString()}</dd>
                      </div>
                    </dl>
                    <Link
                      to={`/admin/registrations/${item.id}`}
                      className="btn-secondary mt-4 inline-flex !px-3 !py-2 text-xs"
                    >
                      View Details
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                className="btn-secondary !px-3 !py-2 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <p className="text-sm text-muted">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <button
                type="button"
                className="btn-secondary !px-3 !py-2 text-xs"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
