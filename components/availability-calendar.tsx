'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/components/lang-provider';

interface Props {
  carId: string;
  open: boolean;
  onClose: () => void;
}

function toISO(d: Date) {
  return d.toISOString().split('T')[0];
}

function addMonths(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(1);
  r.setMonth(r.getMonth() + n);
  return r;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekday(year: number, month: number) {
  // Monday = 0 … Sunday = 6
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

export function AvailabilityCalendarModal({ carId, open, onClose }: Props) {
  const { t } = useLang();
  const ta = t.availability;

  const [available, setAvailable] = useState<Set<string>>(new Set());
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const today = toISO(new Date());

  useEffect(() => {
    if (!open) return;
    setAdded(new Set());
    setRemoved(new Set());
    setSaved(false);
    setMonthOffset(0);
    setLoading(true);
    fetch(`/api/cars/${carId}/availability`)
      .then(r => r.json())
      .then(data => {
        setAvailable(new Set(data.available ?? []));
        setBooked(new Set(data.booked ?? []));
      })
      .finally(() => setLoading(false));
  }, [open, carId]);

  if (!open) return null;

  const baseMonth = addMonths(new Date(), monthOffset);
  const year = baseMonth.getFullYear();
  const month = baseMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startOffset = firstWeekday(year, month);

  function isAvailable(d: string) {
    if (booked.has(d)) return false;
    if (added.has(d)) return true;
    if (removed.has(d)) return false;
    return available.has(d);
  }

  function toggle(d: string) {
    if (d < today) return; // past dates
    if (booked.has(d)) return; // booked dates locked

    if (isAvailable(d)) {
      setRemoved(prev => { const s = new Set(prev); s.add(d); return s; });
      setAdded(prev => { const s = new Set(prev); s.delete(d); return s; });
    } else {
      setAdded(prev => { const s = new Set(prev); s.add(d); return s; });
      setRemoved(prev => { const s = new Set(prev); s.delete(d); return s; });
    }
    setSaved(false);
  }

  function selectAll() {
    const toAdd: string[] = [];
    for (let i = 1; i <= totalDays; i++) {
      const d = toISO(new Date(year, month, i));
      if (d < today) continue;
      if (booked.has(d)) continue;
      if (!isAvailable(d)) toAdd.push(d);
    }
    setAdded(prev => { const s = new Set(prev); toAdd.forEach(d => s.add(d)); return s; });
    setRemoved(prev => {
      const s = new Set(prev);
      for (let i = 1; i <= totalDays; i++) {
        const d = toISO(new Date(year, month, i));
        s.delete(d);
      }
      return s;
    });
    setSaved(false);
  }

  function clearAll() {
    const toRemove: string[] = [];
    for (let i = 1; i <= totalDays; i++) {
      const d = toISO(new Date(year, month, i));
      if (booked.has(d)) continue;
      if (isAvailable(d)) toRemove.push(d);
    }
    setRemoved(prev => { const s = new Set(prev); toRemove.forEach(d => s.add(d)); return s; });
    setAdded(prev => {
      const s = new Set(prev);
      for (let i = 1; i <= totalDays; i++) {
        const d = toISO(new Date(year, month, i));
        s.delete(d);
      }
      return s;
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/cars/${carId}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ add: Array.from(added), remove: Array.from(removed) }),
    });
    // Merge state
    const newAvailable = new Set(available);
    added.forEach(d => newAvailable.add(d));
    removed.forEach(d => newAvailable.delete(d));
    setAvailable(newAvailable);
    setAdded(new Set());
    setRemoved(new Set());
    setSaving(false);
    setSaved(true);
  }

  const hasChanges = added.size > 0 || removed.size > 0;
  const monthName = (ta.months as unknown as string[])[month];

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-black text-h3 text-on-background">{ta.title}</h2>
            <p className="text-label-sm text-secondary mt-0.5">{ta.subtitle}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-surface-container-low transition cursor-pointer">
            <span className="material-symbols-outlined text-[20px] text-secondary">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">autorenew</span>
            </div>
          ) : (
            <>
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setMonthOffset(o => o - 1)} disabled={monthOffset === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-outline-variant disabled:opacity-30 hover:border-primary/40 transition cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="font-extrabold text-label-bold text-on-background">{monthName} {year}</span>
                <button onClick={() => setMonthOffset(o => o + 1)} disabled={monthOffset >= 5}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-outline-variant disabled:opacity-30 hover:border-primary/40 transition cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 mb-4">
                <button onClick={selectAll}
                  className="flex-1 rounded-xl border border-primary/30 bg-primary-fixed/20 py-2 text-label-sm font-bold text-primary hover:bg-primary-fixed/30 transition cursor-pointer">
                  {ta.selectMonth}
                </button>
                <button onClick={clearAll}
                  className="flex-1 rounded-xl border border-outline-variant py-2 text-label-sm font-bold text-secondary hover:bg-surface-container-low transition cursor-pointer">
                  {ta.clearMonth}
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {(ta.weekdays as unknown as string[]).map(d => (
                  <div key={d} className="text-center text-[10px] font-black uppercase text-slate-400 py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: totalDays }).map((_, i) => {
                  const day = i + 1;
                  const d = toISO(new Date(year, month, day));
                  const isPast = d < today;
                  const isBooked = booked.has(d);
                  const isAvail = isAvailable(d);
                  const isChanged = added.has(d) || removed.has(d);

                  let cls = 'flex items-center justify-center rounded-xl h-9 text-[13px] font-bold transition-all ';
                  if (isPast) cls += 'text-slate-300 cursor-default';
                  else if (isBooked) cls += 'bg-amber-50 text-amber-600 cursor-default text-[11px]';
                  else if (isAvail) cls += `cursor-pointer ${isChanged ? 'bg-primary text-white scale-95' : 'bg-primary-fixed/40 text-primary hover:bg-primary/30'}`;
                  else cls += `cursor-pointer ${isChanged ? 'bg-slate-200 text-slate-400 scale-95' : 'text-slate-400 hover:bg-surface-container-low'}`;

                  return (
                    <button key={d} onClick={() => toggle(d)} className={cls} title={isBooked ? ta.bookedNote : undefined}>
                      {day}
                      {isBooked && <span className="absolute text-[8px] bottom-0.5">●</span>}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-secondary">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary-fixed/40 inline-block" />{ta.title}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block" />{ta.bookedNote}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border border-outline-variant inline-block" />Unavailable</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={save}
            disabled={saving || !hasChanges}
            className="w-full py-3.5 rounded-xl bg-primary-container text-white font-bold text-label-bold hover:bg-primary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>{ta.saving}</>
            ) : saved ? (
              <><span className="material-symbols-outlined text-[18px]">check_circle</span>{ta.saved}</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">save</span>{hasChanges ? ta.save : ta.noChanges}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
