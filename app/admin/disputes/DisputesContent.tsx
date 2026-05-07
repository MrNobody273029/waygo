'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { gel } from '@/lib/utils';

interface DisputeItem {
  id: string;
  status: string;
  hostComment: string;
  hostPhotos: string[];
  damageAmount: number | null;
  expertFee: number | null;
  expertNote: string | null;
  createdAt: string;
  booking: {
    id: string;
    carBrand: string;
    carModel: string;
    carYear: number;
    startDate: string;
    endDate: string;
    pickupPhotos: string[];
    returnPhotos: string[];
    guestName: string;
    guestEmail: string;
    hostName: string;
    hostEmail: string;
  };
}

interface Props {
  disputes: DisputeItem[];
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:         'bg-amber-50 text-amber-700 border-amber-200',
  EXPERT_ASSIGNED: 'bg-primary-fixed/30 text-primary border-primary/20',
  RESOLVED:        'bg-tertiary-fixed/30 text-tertiary border-tertiary/20',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:         'Pending',
  EXPERT_ASSIGNED: 'Expert Assigned',
  RESOLVED:        'Resolved',
};

function PhotoStrip({ photos, label }: { photos: string[]; label: string }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (photos.length === 0) return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-label-sm text-slate-400 italic">No photos</p>
    </div>
  );
  return (
    <div>
      <p className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {photos.map((url, i) => (
          <button key={i} type="button" onClick={() => setLightbox(url)}
            className="w-16 h-16 rounded-xl overflow-hidden border border-outline-variant/40 hover:opacity-80 transition shrink-0 cursor-pointer">
            <img src={url} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="full" className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl" />
        </div>
      )}
    </div>
  );
}

function DisputeCard({ dispute, onRefresh }: { dispute: DisputeItem; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [damageAmount, setDamageAmount] = useState(dispute.damageAmount?.toString() ?? '');
  const [expertFee, setExpertFee] = useState(dispute.expertFee?.toString() ?? '');
  const [expertNote, setExpertNote] = useState(dispute.expertNote ?? '');
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startFmt = new Date(dispute.booking.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const endFmt = new Date(dispute.booking.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const createdFmt = new Date(dispute.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  async function assignExpert() {
    setAssigning(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${dispute.id}/expert`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Error');
      } else {
        onRefresh();
      }
    } finally {
      setAssigning(false);
    }
  }

  async function resolveDispute() {
    const dmg = parseFloat(damageAmount);
    const fee = parseFloat(expertFee);
    if (isNaN(dmg) || isNaN(fee)) { setError('Enter valid amounts'); return; }
    setResolving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${dispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ damageAmount: dmg, expertFee: fee, expertNote: expertNote.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Error');
      } else {
        setResolveOpen(false);
        onRefresh();
      }
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-sm overflow-hidden">
      {/* Header row */}
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface-container-low/50 transition cursor-pointer">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-container/30">
            <span className="material-symbols-outlined text-error text-[20px]">gavel</span>
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-label-bold text-on-background truncate">
              {dispute.booking.carBrand} {dispute.booking.carModel} {dispute.booking.carYear}
            </p>
            <p className="text-label-sm text-secondary mt-0.5">
              {dispute.booking.guestName} → {dispute.booking.hostName} · {startFmt} – {endFmt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE[dispute.status] ?? 'bg-surface-container text-secondary'}`}>
            {STATUS_LABEL[dispute.status] ?? dispute.status}
          </span>
          <span className="material-symbols-outlined text-[20px] text-secondary">{expanded ? 'expand_less' : 'expand_more'}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-outline-variant/30 px-5 py-5 space-y-5">

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-label-sm">
            <div>
              <p className="text-secondary mb-0.5">Booking ID</p>
              <p className="font-semibold text-on-background font-mono text-[11px]">{dispute.booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-secondary mb-0.5">Guest</p>
              <p className="font-semibold text-on-background">{dispute.booking.guestName}</p>
              <p className="text-[11px] text-secondary">{dispute.booking.guestEmail}</p>
            </div>
            <div>
              <p className="text-secondary mb-0.5">Host</p>
              <p className="font-semibold text-on-background">{dispute.booking.hostName}</p>
              <p className="text-[11px] text-secondary">{dispute.booking.hostEmail}</p>
            </div>
            <div>
              <p className="text-secondary mb-0.5">Dispute opened</p>
              <p className="font-semibold text-on-background">{createdFmt}</p>
            </div>
          </div>

          {/* Host comment */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Host comment</p>
            <p className="text-label-sm text-amber-900 leading-relaxed">{dispute.hostComment}</p>
          </div>

          {/* Photos grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            <PhotoStrip photos={dispute.booking.pickupPhotos} label="Pickup photos" />
            <PhotoStrip photos={dispute.booking.returnPhotos} label="Return photos" />
            <PhotoStrip photos={dispute.hostPhotos} label="Host dispute photos" />
          </div>

          {/* Resolution info (if resolved) */}
          {dispute.status === 'RESOLVED' && (
            <div className="rounded-xl bg-tertiary-fixed/20 border border-tertiary/20 px-4 py-3 space-y-1">
              <p className="text-[11px] font-bold text-tertiary uppercase tracking-wider">Resolution</p>
              <div className="flex gap-4 text-label-sm">
                <span className="text-secondary">Damage amount: <strong className="text-on-background">{gel(dispute.damageAmount ?? 0)}</strong></span>
                <span className="text-secondary">Expert fee: <strong className="text-on-background">{gel(dispute.expertFee ?? 0)}</strong></span>
              </div>
              {dispute.expertNote && (
                <p className="text-label-sm text-secondary italic">"{dispute.expertNote}"</p>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-error-container/20 border border-error/20 px-4 py-3">
              <span className="material-symbols-outlined text-error text-[16px]">error</span>
              <p className="text-label-sm text-error font-semibold">{error}</p>
            </div>
          )}

          {/* Actions */}
          {dispute.status !== 'RESOLVED' && (
            <div className="flex flex-wrap gap-3 pt-1">
              {dispute.status === 'PENDING' && (
                <button onClick={assignExpert} disabled={assigning}
                  className="flex items-center gap-2 rounded-xl bg-primary-container px-5 py-2.5 text-label-sm font-bold text-white hover:bg-primary transition disabled:opacity-60 cursor-pointer">
                  {assigning
                    ? <><span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>Assigning…</>
                    : <><span className="material-symbols-outlined text-[16px]">person_search</span>Assign Independent Expert</>}
                </button>
              )}
              <button onClick={() => { setResolveOpen(p => !p); setError(null); }}
                className="flex items-center gap-2 rounded-xl border-2 border-tertiary/30 px-5 py-2.5 text-label-sm font-bold text-tertiary hover:bg-tertiary-fixed/10 transition cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                Resolve Dispute
              </button>
            </div>
          )}

          {/* Resolve form */}
          {resolveOpen && dispute.status !== 'RESOLVED' && (
            <div className="rounded-xl border border-outline-variant/50 bg-surface-container-low p-4 space-y-3">
              <p className="font-bold text-label-bold text-on-background">Enter resolution details</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1">Damage amount (GEL)</label>
                  <input type="number" min="0" step="0.01" value={damageAmount}
                    onChange={e => setDamageAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-outline-variant px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-primary transition" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1">Expert fee (GEL)</label>
                  <input type="number" min="0" step="0.01" value={expertFee}
                    onChange={e => setExpertFee(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-outline-variant px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-primary transition" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1">Expert note (optional)</label>
                <textarea value={expertNote} onChange={e => setExpertNote(e.target.value)}
                  placeholder="Summary of expert findings…"
                  rows={2}
                  className="w-full rounded-xl border border-outline-variant px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-primary transition resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setResolveOpen(false)}
                  className="flex-1 rounded-xl border border-outline-variant py-2.5 text-label-sm font-bold text-secondary hover:bg-surface-container transition cursor-pointer">
                  Cancel
                </button>
                <button onClick={resolveDispute} disabled={resolving}
                  className="flex-1 rounded-xl bg-tertiary py-2.5 text-label-sm font-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
                  {resolving
                    ? <><span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>Saving…</>
                    : <><span className="material-symbols-outlined text-[16px]">task_alt</span>Confirm Resolution</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminDisputesContent({ disputes }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'EXPERT_ASSIGNED' | 'RESOLVED'>('ALL');

  const filtered = filter === 'ALL' ? disputes : disputes.filter(d => d.status === filter);

  const counts = {
    ALL: disputes.length,
    PENDING: disputes.filter(d => d.status === 'PENDING').length,
    EXPERT_ASSIGNED: disputes.filter(d => d.status === 'EXPERT_ASSIGNED').length,
    RESOLVED: disputes.filter(d => d.status === 'RESOLVED').length,
  };

  return (
    <div className="min-h-screen bg-surface pt-[120px] pb-20">
      <div className="mx-auto max-w-screen-lg px-4 md:px-8">

        <div className="mb-8">
          <h1 className="text-h1 font-extrabold text-on-background">Disputes</h1>
          <p className="text-secondary text-label-sm mt-1">Review and resolve guest–host disputes</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['ALL', 'PENDING', 'EXPERT_ASSIGNED', 'RESOLVED'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-label-sm font-bold transition cursor-pointer border ${
                filter === f
                  ? 'bg-on-background text-white border-on-background'
                  : 'bg-white text-secondary border-outline-variant hover:bg-surface-container'
              }`}>
              {f === 'ALL' ? 'All' : STATUS_LABEL[f]}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                filter === f ? 'bg-white/20 text-white' : 'bg-surface-container text-secondary'
              }`}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-300">gavel</span>
            <p className="font-bold text-label-bold text-secondary">No disputes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(d => (
              <DisputeCard key={d.id} dispute={d} onRefresh={() => router.refresh()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
