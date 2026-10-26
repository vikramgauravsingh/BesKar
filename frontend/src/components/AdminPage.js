import React, { useEffect, useState } from 'react';
import { Insights, SpamSummary, BlockedList, ScoreBadge } from './AdminInsights';

const API = process.env.REACT_APP_BACKEND_URL || '';

const formatErr = (d) => (typeof d === 'string' ? d : Array.isArray(d) ? d.map((x) => x.msg).join(' ') : 'Something went wrong.');

const api = async (path, opts = {}) => {
  const token = sessionStorage.getItem('beskar_admin_token');
  const res = await fetch(`${API}/api${path}`, {
    credentials: 'include',
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(formatErr(data.detail)), { status: res.status });
  return data;
};

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');
const loc = (g) => [g?.city, g?.region, g?.country].filter(Boolean).join(', ') || '—';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const d = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      sessionStorage.setItem('beskar_admin_token', d.token);
      onLogin(d);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} className="max-w-sm mx-auto mt-40 space-y-4 border border-slate-800 p-8 bg-slate-950/60" data-testid="admin-login-form">
      <h1 className="font-heading text-2xl font-bold text-white">Beskar Admin</h1>
      <p className="text-slate-500 text-sm">Visitor log &amp; contact messages</p>
      <input className="w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white" type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} required data-testid="admin-email-input" />
      <input className="w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white" type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} required data-testid="admin-password-input" />
      {error && <p className="text-red-400 text-sm" data-testid="admin-login-error">{error}</p>}
      <button disabled={busy} className="w-full bg-beskar-cyan text-slate-950 font-semibold py-3 hover:opacity-90 transition-opacity" data-testid="admin-login-submit">
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
};

const Cell = ({ children, className = '' }) => <td className={`p-3 align-top border-t border-slate-800 ${className}`}>{children}</td>;

const VisitorsTable = ({ items }) => (
  <div className="overflow-x-auto border border-slate-800" data-testid="admin-visitors-table">
    <table className="w-full text-sm text-left text-slate-400">
      <thead className="bg-slate-900 text-white">
        <tr>{['Last seen', 'Location / IP', 'Browser / Device', 'Domain', 'Came from', 'Language / Time zone', 'Pages & sections', 'Visitor ID'].map((h) => <th key={h} className="p-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
      </thead>
      <tbody>
        {items.map((v) => (
          <tr key={v.visitor_id} data-testid={`admin-visitor-row-${v.visitor_id}`}>
            <Cell className="whitespace-nowrap">{fmtDate(v.last_seen)}<div className="text-xs text-slate-600">{v.page_views} views</div></Cell>
            <Cell>{loc(v.geo)}<div className="text-xs text-slate-600">{v.ip}</div></Cell>
            <Cell>{v.browser}<div className="text-xs text-slate-600">{v.os} · {v.device}</div></Cell>
            <Cell>{v.domain}</Cell>
            <Cell>{v.source}<div className="text-xs text-slate-600 break-all">{v.referrer}</div></Cell>
            <Cell>{v.language}<div className="text-xs text-slate-600">{v.timezone}</div></Cell>
            <Cell className="min-w-[220px]">{[...new Set((v.pages || []).map((p) => p.path))].join(', ')}<div className="text-xs text-slate-600">{(v.sections || []).join(', ')}</div></Cell>
            <Cell className="text-xs font-mono">{v.visitor_id}</Cell>
          </tr>
        ))}
        {!items.length && <tr><Cell className="text-center" colSpan={8}>No visitors yet. Visitors appear here after they accept cookies.</Cell></tr>}
      </tbody>
    </table>
  </div>
);

const ContactsList = ({ items, min }) => (
  <div className="space-y-4" data-testid="admin-contacts-list">
    {items.map((c) => (
      <div key={c.id} className="border border-slate-800 p-5" data-testid={`admin-contact-${c.id}`}>
        <div className="flex flex-wrap justify-between gap-2">
          <div className="text-white font-semibold">{c.name} <span className="text-slate-500 font-normal">· {c.email}{c.company ? ` · ${c.company}` : ''}</span></div>
          <div className="flex items-center gap-3 text-xs text-slate-500">{fmtDate(c.created_at)}<ScoreBadge score={c.recaptcha_score} min={min} /></div>
        </div>
        <p className="mt-3 text-slate-400 whitespace-pre-wrap">{c.message}</p>
        <div className="mt-3 text-xs text-slate-500">
          {c.visitor ? `${loc(c.visitor.geo)} · ${c.visitor.ip} · ${c.visitor.browser} · ${c.visitor.os} · from ${c.visitor.source} · ${c.visitor.language} · ${c.visitor.timezone} · sections: ${(c.visitor.sections || []).join(', ') || '—'}`
            : `IP ${c.client_ip || '—'} · visitor did not accept cookies`}
        </div>
      </div>
    ))}
    {!items.length && <p className="text-slate-500">No messages yet.</p>}
  </div>
);

const Dashboard = ({ admin, onLogout }) => {
  const [tab, setTab] = useState('visitors');
  const [data, setData] = useState({ visitors: [], total: 0, contacts: [], stats: null });
  const [note, setNote] = useState('');
  const load = async () => {
    const [v, c, st] = await Promise.all([api('/admin/visitors'), api('/admin/contacts'), api('/admin/stats')]);
    setData({ visitors: v.visitors, total: v.total, contacts: c.contacts, stats: st });
  };
  useEffect(() => { load().catch(() => onLogout()); }, []);
  const sendDigest = async () => {
    setNote('Sending…');
    try {
      const r = await api('/admin/send-digest', { method: 'POST' });
      setNote(r.sent ? `Log of ${r.visitors} visitors emailed to support@beskarit.com` : 'Email could not be sent. Email service is not set up yet.');
    } catch (e) {
      setNote(e.message);
    }
  };
  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} data-testid={`admin-tab-${id}`}
      className={`px-4 py-2 text-sm border transition-colors ${tab === id ? 'border-beskar-cyan text-beskar-cyan' : 'border-slate-800 text-slate-400 hover:text-white'}`}>{label}</button>
  );
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12" data-testid="admin-dashboard">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Visitor Log</h1>
          <p className="text-slate-500 text-sm" data-testid="admin-summary">{data.total} visitors · {data.contacts.length} messages · signed in as {admin.email}</p>
          {data.stats && <p className="text-slate-600 text-xs mt-1" data-testid="admin-retention-note">Visitor records are deleted automatically after {data.stats.retention_days} days of inactivity.</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={() => load()} className="px-4 py-2 text-sm border border-slate-700 text-slate-300 hover:text-white" data-testid="admin-refresh-btn">Refresh</button>
          <button onClick={sendDigest} className="px-4 py-2 text-sm bg-beskar-cyan text-slate-950 font-semibold hover:opacity-90" data-testid="admin-send-digest-btn">Email log now</button>
          <button onClick={onLogout} className="px-4 py-2 text-sm border border-slate-700 text-slate-300 hover:text-white" data-testid="admin-logout-btn">Log out</button>
        </div>
      </div>
      {note && <p className="mb-4 text-sm text-beskar-cyan" data-testid="admin-digest-note">{note}</p>}
      {data.stats && <Insights stats={data.stats} />}
      <div className="flex flex-wrap gap-2 mb-6">{tabBtn('visitors', 'Visitors')}{tabBtn('contacts', 'Contact messages')}{tabBtn('spam', 'Spam check')}</div>
      {tab === 'visitors' && <VisitorsTable items={data.visitors} />}
      {tab === 'contacts' && <ContactsList items={data.contacts} min={data.stats?.spam.min_score ?? 0.5} />}
      {tab === 'spam' && data.stats && (
        <>
          <SpamSummary spam={data.stats.spam} />
          <BlockedList blocks={data.stats.spam.blocks} />
        </>
      )}
    </div>
  );
};

const AdminPage = () => {
  const [admin, setAdmin] = useState(null);
  useEffect(() => { api('/auth/me').then(setAdmin).catch(() => setAdmin(false)); }, []);
  const logout = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    sessionStorage.removeItem('beskar_admin_token');
    setAdmin(false);
  };
  if (admin === null) return <div className="min-h-screen" />;
  return <div className="min-h-screen">{admin ? <Dashboard admin={admin} onLogout={logout} /> : <Login onLogin={setAdmin} />}</div>;
};

export default AdminPage;
