import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import api, { getErrorMessage } from '../lib/api';
import { genderOptions } from '../lib/schemas';

type Registration = {
  id: string;
  name: string;
  gender: string;
  age: number;
  phoneNumber: string;
  address: string;
  occupation: string;
  createdAt: string;
  updatedAt: string;
};

export default function RegistrationDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<Registration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/admin/registrations/${id}`);
        setItem(data.data);
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load registration details.'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const genderLabel =
    genderOptions.find((g) => g.value === item?.gender)?.label ?? item?.gender ?? '';

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo compact />
          <Link to="/admin/dashboard" className="btn-secondary !px-3 !py-2 text-xs">
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-brand-900">Registration Details</h1>

        {loading && <p className="mt-6 text-sm text-muted">Loading…</p>}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {item && (
          <dl className="card-surface mt-6 divide-y divide-slate-100">
            {[
              ['Registration ID', item.id],
              ['Name', item.name],
              ['Gender', genderLabel],
              ['Age', String(item.age)],
              ['Phone Number', item.phoneNumber],
              ['Address', item.address],
              ['Occupation', item.occupation],
              ['Registration Date', new Date(item.createdAt).toLocaleString()],
              ['Last Updated', new Date(item.updatedAt).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm font-medium text-muted">{label}</dt>
                <dd className="break-words text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </main>
    </div>
  );
}
