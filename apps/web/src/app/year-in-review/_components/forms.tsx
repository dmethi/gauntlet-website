'use client';

import { useEffect, useState } from 'react';

interface ReturningTeamOptionGroup {
  leagueName: string;
  teams: string[];
}

interface LeagueStructureResponse {
  ok: boolean;
  data?: {
    year1: Array<{
      leagueName: string;
      teams: Array<{ name: string }>;
    }>;
  };
}

const YEAR_IN_REVIEW_STRUCTURE_REFRESH_EVENT = 'year-in-review:refresh-structure';

const notifyStructureRefresh = () => {
  window.dispatchEvent(new Event(YEAR_IN_REVIEW_STRUCTURE_REFRESH_EVENT));
};

const InputField = ({
  label,
  type = 'text',
  name,
  placeholder,
  required,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
        {label}
        {required && <span className="text-[#8b1538] ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
      />
    </div>
  );
};

export const ReturnForm = () => {
  const [form, setForm] = useState({ name: '', email: '', team: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [teamOptions, setTeamOptions] = useState<ReturningTeamOptionGroup[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/year-in-review/league-structure', { cache: 'no-store' })
      .then(res => res.json() as Promise<LeagueStructureResponse>)
      .then(data => {
        if (!data.ok || !data.data) return;

        setTeamOptions(
          data.data.year1.map(group => ({
            leagueName: group.leagueName,
            teams: group.teams.map(team => team.name),
          })),
        );
      })
      .finally(() => setTeamsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/year-in-review/return-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        notifyStructureRefresh();
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">⚔️</div>
        <p className="text-[#d4af37] font-semibold text-lg">See you in the arena.</p>
        <p className="text-white/60 text-sm mt-1">Your spot is noted. More details coming soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField
        label="Name"
        name="name"
        placeholder="Your name"
        required
        value={form.name}
        onChange={v => setForm(f => ({ ...f, name: v }))}
      />
      <InputField
        label="Email"
        type="email"
        name="email"
        placeholder="you@example.com"
        required
        value={form.email}
        onChange={v => setForm(f => ({ ...f, email: v }))}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
          Your 2025 Team
        </label>
        <select
          required
          value={form.team}
          onChange={e => setForm(f => ({ ...f, team: e.target.value }))}
          disabled={teamsLoading}
          className="bg-white/5 border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
        >
          <option value="" className="bg-[#1a1a1a]">
            {teamsLoading ? 'Loading teams...' : 'Select your team...'}
          </option>
          {teamOptions.map(group => (
            <optgroup
              key={group.leagueName}
              label={group.leagueName}
              className="bg-[#1a1a1a] text-white"
            >
              {group.teams.map(team => (
                <option key={team} value={team} className="bg-[#1a1a1a]">
                  {team}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {!teamsLoading && teamOptions.length === 0 && (
          <p className="text-red-400 text-sm">
            Couldn&apos;t load last season&apos;s teams. Try again.
          </p>
        )}
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-sm">Something went wrong. Try again.</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading' || teamsLoading || teamOptions.length === 0}
        className="w-full bg-[#8b1538] hover:bg-[#a31621] disabled:opacity-50 text-white font-semibold py-3 rounded transition-colors uppercase tracking-widest text-sm"
      >
        {status === 'loading' ? 'Confirming...' : "I'm Back"}
      </button>
    </form>
  );
};

export const RegistrationForm = () => {
  const [form, setForm] = useState({ name: '', email: '', referredBy: '', notes: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/year-in-review/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        notifyStructureRefresh();
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🏆</div>
        <p className="text-[#d4af37] font-semibold text-lg">Registration received.</p>
        <p className="text-white/60 text-sm mt-1">
          We&apos;ll follow up with League 3 details for Year Two.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField
        label="Name"
        name="name"
        placeholder="Your name"
        required
        value={form.name}
        onChange={v => setForm(f => ({ ...f, name: v }))}
      />
      <InputField
        label="Email"
        type="email"
        name="email"
        placeholder="you@example.com"
        required
        value={form.email}
        onChange={v => setForm(f => ({ ...f, email: v }))}
      />
      <InputField
        label="Referred By"
        name="referredBy"
        placeholder="Who told you about this?"
        value={form.referredBy}
        onChange={v => setForm(f => ({ ...f, referredBy: v }))}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
          Anything else?
        </label>
        <textarea
          placeholder="Experience level, why you want in, anything..."
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
          className="bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
        />
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-sm">Something went wrong. Try again.</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#d4af37] hover:bg-[#ebb748] disabled:opacity-50 text-black font-semibold py-3 rounded transition-colors uppercase tracking-widest text-sm"
      >
        {status === 'loading' ? 'Submitting...' : 'Register for League 3'}
      </button>
    </form>
  );
};

export const ProposalForm = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    title: '',
    description: '',
    category: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const CATEGORIES = [
    'Format & Rules',
    'Contests & Side Bets',
    'Platform & Features',
    'Draft',
    'Community',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/year-in-review/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setStatus(data.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="text-center py-6">
        <p className="text-[#d4af37] font-semibold">Proposal received.</p>
        <p className="text-white/60 text-sm mt-1">
          We&apos;ll review it and post it if it makes the cut.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Your Name"
          name="name"
          required
          value={form.name}
          onChange={v => setForm(f => ({ ...f, name: v }))}
        />
        <InputField
          label="Email"
          type="email"
          name="email"
          required
          value={form.email}
          onChange={v => setForm(f => ({ ...f, email: v }))}
        />
      </div>
      <InputField
        label="Proposal Title"
        name="title"
        placeholder="Keep it punchy"
        required
        value={form.title}
        onChange={v => setForm(f => ({ ...f, title: v }))}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
          Category
        </label>
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="bg-white/5 border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
        >
          <option value="" className="bg-[#1a1a1a]">
            Select a category
          </option>
          {CATEGORIES.map(c => (
            <option key={c} value={c} className="bg-[#1a1a1a]">
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
          Description <span className="text-[#8b1538]">*</span>
        </label>
        <textarea
          placeholder="What's the idea? Why would it make the Gauntlet better?"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4}
          required
          className="bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
        />
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-sm">Something went wrong. Try again.</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold py-3 rounded transition-colors uppercase tracking-widest text-sm border border-white/20"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Proposal'}
      </button>
    </form>
  );
};
