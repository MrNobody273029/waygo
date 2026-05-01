'use client';
import { useLang } from '@/components/lang-provider';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function VerificationPendingPopup({ open, onClose }: Props) {
  const { t } = useLang();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl p-8 flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-amber-50 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-amber-500 text-[40px]">pending_actions</span>
        </div>
        <h2 className="text-h2 font-black text-on-background mb-2">{t.kyc.pendingTitle}</h2>
        <p className="text-secondary text-body-md leading-relaxed mb-4">{t.kyc.pendingSub}</p>
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 mb-6">
          <span className="material-symbols-outlined text-slate-400 text-[16px]">mail</span>
          <p className="text-label-sm text-secondary font-semibold">{t.kyc.pendingEmailNote}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-primary-container text-white font-bold text-label-bold hover:bg-primary transition-all active:scale-95 cursor-pointer"
        >
          {t.kyc.pendingClose}
        </button>
      </div>
    </div>
  );
}
