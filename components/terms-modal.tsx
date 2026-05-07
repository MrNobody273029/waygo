'use client';
import { useEffect, useRef } from 'react';
import { useLang } from '@/components/lang-provider';
import { termsContent } from '@/lib/terms';
import type { TermsLang } from '@/lib/terms';

interface Props {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsModal({ open, onClose, onAccept }: Props) {
  const { lang } = useLang();
  const l = (lang as TermsLang) in termsContent.title ? (lang as TermsLang) : 'en';
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full sm:max-w-xl max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[17px] font-black text-on-background">{termsContent.title[l]}</p>
            <p className="text-[11px] text-secondary mt-0.5">{termsContent.lastUpdated[l]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {termsContent.sections.map((s, i) => (
            <div key={i}>
              <p className="text-[13px] font-black text-on-background mb-1">{s.heading[l]}</p>
              <p className="text-[12px] text-secondary leading-relaxed">{s.body[l]}</p>
            </div>
          ))}
        </div>

        {/* Accept button */}
        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onAccept}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-container text-white py-3.5 font-bold text-label-bold hover:bg-primary transition active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {termsContent.checkboxLabel[l]}
          </button>
        </div>
      </div>
    </div>
  );
}
