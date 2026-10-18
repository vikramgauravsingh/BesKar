import React, { useEffect } from 'react';
import SEO from './SEO';

const linkify = (text) =>
  text.split(/(https?:\/\/\S+[^\s.,;)]|[\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, i) => {
    if (/^https?:\/\//.test(part)) return <a key={i} href={part} className="text-beskar-cyan hover:underline">{part}</a>;
    if (/@/.test(part) && /^[\w.+-]+@/.test(part)) return <a key={i} href={`mailto:${part}`} className="text-beskar-cyan hover:underline">{part}</a>;
    return part;
  });

const Text = ({ b }) => (
  <>
    {b.lead && <strong className="text-white font-semibold">{b.lead} </strong>}
    {linkify(b.text)}
  </>
);

const LegalTable = ({ rows }) => (
  <div className="overflow-x-auto my-6 border border-slate-800">
    <table className="w-full text-sm text-left">
      <thead className="bg-slate-900 text-white">
        <tr>{rows[0].map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.slice(1).map((r, i) => (
          <tr key={i} className="border-t border-slate-800">
            {r.map((c, j) => <td key={j} className={`p-3 align-top ${j === 0 ? 'text-white' : ''}`}>{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const groupBlocks = (blocks) =>
  blocks.reduce((acc, b) => {
    const last = acc[acc.length - 1];
    if (b.t === 'li' && last && last.t === 'ul') last.items.push(b);
    else acc.push(b.t === 'li' ? { t: 'ul', items: [b] } : b);
    return acc;
  }, []);

const Block = ({ b }) => {
  if (b.t === 'h2') return <h2 className="font-heading text-2xl font-semibold text-white mt-12 mb-4">{b.text}</h2>;
  if (b.t === 'h3') return <h3 className="font-heading text-lg font-semibold text-white mt-8 mb-3">{b.text}</h3>;
  if (b.t === 'strong') return <p className="text-white font-semibold mt-6 mb-3">{linkify(b.text)}</p>;
  if (b.t === 'table') return <LegalTable rows={b.rows} />;
  if (b.t === 'ul') {
    const lettered = /^[a-z]\. /.test(b.items[0].text);
    return (
      <ul className={`mb-4 space-y-2 ${lettered ? 'pl-2' : 'list-disc pl-6 marker:text-beskar-cyan'}`}>
        {b.items.map((it, i) => <li key={i}><Text b={it} /></li>)}
      </ul>
    );
  }
  return <p className="mb-4"><Text b={b} /></p>;
};

const LegalPage = ({ doc, path, description, testId, onBack }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen pt-32 pb-20" data-testid={testId}>
      <SEO title={`${doc.title} | Beskar`} description={description} path={path} />
      <article className="max-w-4xl mx-auto px-6 text-slate-400 leading-relaxed">
        <button onClick={onBack} className="text-beskar-cyan hover:underline mb-8 text-sm" data-testid={`${testId}-back-btn`}>
          &larr; Back to Home
        </button>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4" data-testid={`${testId}-title`}>{doc.title}</h1>
        <p className="text-slate-500 mb-10" data-testid={`${testId}-updated`}>Last Updated: {doc.updated}</p>
        {groupBlocks(doc.blocks).map((b, i) => <Block key={i} b={b} />)}
      </article>
    </div>
  );
};

export default LegalPage;
