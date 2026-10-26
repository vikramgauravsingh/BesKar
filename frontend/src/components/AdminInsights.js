import React from 'react';

const BarChart = ({ title, items, testId }) => {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="border border-slate-800 p-5" data-testid={testId}>
      <h3 className="font-heading text-white font-semibold mb-4">{title}</h3>
      {items.length ? (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.label} className="text-sm">
              <div className="flex justify-between text-slate-400 mb-1">
                <span className="truncate pr-2">{i.label}</span>
                <span className="text-white font-mono">{i.count}</span>
              </div>
              <div className="h-2 bg-slate-900">
                <div className="h-2 bg-beskar-cyan transition-[width] duration-700" style={{ width: `${(i.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-600 text-sm">No data yet.</p>
      )}
    </div>
  );
};

const Stat = ({ label, value, testId, tone = 'text-white' }) => (
  <div className="border border-slate-800 p-5" data-testid={testId}>
    <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
    <div className={`font-heading text-3xl font-bold mt-2 ${tone}`}>{value}</div>
  </div>
);

export const ScoreBadge = ({ score, min }) => {
  if (score == null) return <span className="px-2 py-0.5 text-xs border border-slate-700 text-slate-500" data-testid="score-badge">Not checked</span>;
  const tone = score >= 0.7 ? 'border-emerald-500 text-emerald-400' : score >= min ? 'border-amber-500 text-amber-400' : 'border-red-500 text-red-400';
  return <span className={`px-2 py-0.5 text-xs border font-mono ${tone}`} data-testid="score-badge">Spam score {score.toFixed(1)}</span>;
};

export const SpamSummary = ({ spam }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <Stat label="Messages accepted" value={spam.accepted} testId="stat-accepted" />
    <Stat label="Blocked as spam" value={spam.blocked} testId="stat-blocked" tone="text-red-400" />
    <Stat label="Average score" value={spam.avg_score ?? '—'} testId="stat-avg-score" tone="text-beskar-cyan" />
    <Stat label="Not checked" value={spam.unscored} testId="stat-unscored" tone="text-slate-400" />
  </div>
);

export const BlockedList = ({ blocks }) => (
  <div className="overflow-x-auto border border-slate-800" data-testid="admin-blocked-table">
    <table className="w-full text-sm text-left text-slate-400">
      <thead className="bg-slate-900 text-white">
        <tr>{['When', 'Reason', 'Score', 'Name / Email', 'IP'].map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr>
      </thead>
      <tbody>
        {blocks.map((b, i) => (
          <tr key={i} className="border-t border-slate-800">
            <td className="p-3 whitespace-nowrap">{new Date(b.created_at).toLocaleString()}</td>
            <td className="p-3 text-red-400">{b.reason}</td>
            <td className="p-3 font-mono">{b.score ?? '—'}</td>
            <td className="p-3">{b.name}<div className="text-xs text-slate-600">{b.email}</div></td>
            <td className="p-3 font-mono text-xs">{b.ip}</td>
          </tr>
        ))}
        {!blocks.length && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No blocked attempts yet.</td></tr>}
      </tbody>
    </table>
  </div>
);

export const Insights = ({ stats }) => (
  <div className="grid md:grid-cols-3 gap-4 mb-8" data-testid="admin-charts">
    <BarChart title="Top countries" items={stats.countries} testId="chart-countries" />
    <BarChart title="Traffic sources" items={stats.sources} testId="chart-sources" />
    <BarChart title="Most-viewed sections" items={stats.sections} testId="chart-sections" />
  </div>
);
