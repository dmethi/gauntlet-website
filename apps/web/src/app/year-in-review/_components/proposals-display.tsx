'use client';

import { useEffect, useState } from 'react';

interface Proposal {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string | null;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Format & Rules': 'border-[#8b1538] text-[#8b1538]',
  'Contests & Side Bets': 'border-[#d4af37] text-[#d4af37]',
  'Platform & Features': 'border-blue-400 text-blue-400',
  Draft: 'border-green-400 text-green-400',
  Community: 'border-purple-400 text-purple-400',
  Other: 'border-white/30 text-white/50',
};

export const ProposalsDisplay = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/year-in-review/proposals')
      .then(r => r.json())
      .then(d => {
        if (d.ok) setProposals(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-5 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
            <div className="h-5 bg-white/10 rounded w-2/3 mb-2" />
            <div className="h-3 bg-white/10 rounded w-full mb-1" />
            <div className="h-3 bg-white/10 rounded w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (!proposals.length) {
    return (
      <div className="text-center py-12 text-white/40">
        <p className="text-lg">No proposals published yet.</p>
        <p className="text-sm mt-1">
          Submit yours below — if it makes the cut, it&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {proposals.map(p => (
        <div
          key={p.id}
          className="bg-white/5 border border-white/10 hover:border-white/20 rounded-lg p-5 transition-colors"
        >
          {p.category && (
            <span
              className={`inline-block text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded mb-3 ${CATEGORY_COLORS[p.category] ?? 'border-white/20 text-white/40'}`}
            >
              {p.category}
            </span>
          )}
          <h4 className="text-white font-semibold text-base mb-2 leading-snug">{p.title}</h4>
          <p className="text-white/60 text-sm leading-relaxed line-clamp-3">{p.description}</p>
          <p className="text-white/30 text-xs mt-3">— {p.name}</p>
        </div>
      ))}
    </div>
  );
};
