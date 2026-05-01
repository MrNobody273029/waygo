'use client';
import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useLang } from '@/components/lang-provider';
import type { Lang } from '@/lib/i18n';

export type VerificationType = 'guest' | 'host';
type Step = 'intro' | 'doc-front' | 'doc-back' | 'selfie' | 'processing' | 'success';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  verificationType: VerificationType;
  initialDocFront?: string | null;
  initialDocBack?: string | null;
  initialSelfie?: string | null;
  rejectionComment?: string | null;
}

function getReviewTime() {
  const tbilisiHour = (new Date().getUTCHours() + 4) % 24;
  return tbilisiHour >= 9 && tbilisiHour < 18 ? '2–3' : '6–12';
}

export function KYCModal({ open, onClose, onSuccess, verificationType, initialDocFront, initialDocBack, initialSelfie, rejectionComment }: Props) {
  const { t, lang } = useLang();
  const { update: updateSession } = useSession();

  const [step, setStep] = useState<Step>('intro');
  const [docFront, setDocFront] = useState<string | null>(initialDocFront ?? null);
  const [docBack, setDocBack] = useState<string | null>(initialDocBack ?? null);
  const [selfie, setSelfie] = useState<string | null>(initialSelfie ?? null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const isGuest = verificationType === 'guest';
  const reviewTime = getReviewTime();

  const docFrontLabel = isGuest ? t.kyc.stepDlFront : t.kyc.stepIdFront;
  const docBackLabel = isGuest ? t.kyc.stepDlBack : t.kyc.stepIdBack;

  function reset() {
    setStep('intro');
    setDocFront(initialDocFront ?? null);
    setDocBack(initialDocBack ?? null);
    setSelfie(initialSelfie ?? null);
    setPreview(null);
  }

  function handleClose() { reset(); onClose(); }

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'waygo/kyc');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    return data.url as string;
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    try {
      const url = await uploadFile(file);
      if (step === 'doc-front') setDocFront(url);
      else if (step === 'doc-back') setDocBack(url);
      else if (step === 'selfie') setSelfie(url);
    } catch { setPreview(null); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  function advance() {
    if (step === 'doc-front') { setPreview(null); setStep('doc-back'); }
    else if (step === 'doc-back') { setPreview(null); setStep('selfie'); }
    else if (step === 'selfie') submitVerification();
  }

  async function submitVerification() {
    setStep('processing');
    try {
      await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: verificationType, docFront, docBack, selfieUrl: selfie, lang }),
      });
      await updateSession();
    } catch { /* ignore */ }
    setStep('success');
  }

  const stepLabel = step === 'doc-front' ? docFrontLabel : step === 'doc-back' ? docBackLabel : t.kyc.stepSelfie;
  const stepIcon = step === 'selfie' ? 'face' : 'id_card';
  const isUploadStep = step === 'doc-front' || step === 'doc-back' || step === 'selfie';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step !== 'processing' ? handleClose : undefined} />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">
        <div className="overflow-y-auto flex-1">

        {/* INTRO */}
        {step === 'intro' && (
          <div className="p-7">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/40">
                <span className="material-symbols-outlined text-primary text-[28px]">verified_user</span>
              </div>
              <h2 className="text-h2 font-black text-on-background leading-tight">
                {isGuest ? t.kyc.verifyTitle : t.kyc.hostVerifyTitle}
              </h2>
            </div>
            <p className="text-secondary text-body-md leading-relaxed mb-4">
              {rejectionComment ? t.kyc.rejectedCtx : (isGuest ? t.kyc.welcomeCtxNew : t.kyc.hostCtx)}
            </p>

            {rejectionComment && (
              <div className="rounded-2xl border border-error/30 bg-error-container/20 p-4 mb-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-error mb-1.5">{t.kyc.adminNoteLabel}</p>
                <p className="text-label-bold font-semibold text-on-background leading-relaxed">{rejectionComment}</p>
              </div>
            )}

            {isGuest && !rejectionComment && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">schedule</span>
                  <div>
                    <p className="font-bold text-label-bold text-amber-800">{t.kyc.timingTitle}</p>
                    <p className="text-label-sm text-amber-700 mt-1">
                      {t.kyc.timingWorkHours}: <strong>2–3 {t.kyc.hours}</strong>
                    </p>
                    <p className="text-label-sm text-amber-700">
                      {t.kyc.timingOffHours}: <strong>6–12 {t.kyc.hours}</strong>
                    </p>
                    <p className="text-label-sm font-bold text-amber-800 mt-2">
                      {reviewTime === '2–3' ? `✓ ${t.kyc.timingNowFast}` : `⚠ ${t.kyc.timingNowSlow}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-slate-50 p-4 space-y-2 mb-6">
              <p className="text-label-sm font-black uppercase tracking-wider text-slate-400 mb-3">{t.kyc.needsTitle}</p>
              {[
                { icon: 'id_card', text: isGuest ? t.kyc.need1 : t.kyc.hostNeed1 },
                { icon: 'id_card', text: isGuest ? t.kyc.need2 : t.kyc.hostNeed2 },
                { icon: 'face',    text: t.kyc.need3 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-fixed/30">
                    <span className="material-symbols-outlined text-primary text-[16px]">{item.icon}</span>
                  </span>
                  <span className="text-label-bold font-semibold text-on-background">{item.text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep('doc-front')}
              className="w-full py-3.5 rounded-xl bg-primary-container text-white font-bold text-label-bold hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-2 mb-3 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              {t.kyc.verifyNow}
            </button>
            <button onClick={handleClose}
              className="w-full py-3 rounded-xl text-secondary font-semibold text-label-bold hover:bg-slate-50 transition cursor-pointer">
              {t.kyc.doLater}
            </button>
          </div>
        )}

        {/* UPLOAD STEPS */}
        {isUploadStep && (
          <div className="p-7">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => {
                if (step === 'doc-front') handleClose();
                else if (step === 'doc-back') { setPreview(null); setStep('doc-front'); }
                else { setPreview(null); setStep('doc-back'); }
              }} className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant hover:border-primary/40 transition cursor-pointer">
                <span className="material-symbols-outlined text-[18px] text-secondary">arrow_back</span>
              </button>
              <div>
                <p className="font-black text-label-bold text-on-background">{stepLabel}</p>
                <div className="flex gap-1 mt-1">
                  {(['doc-front', 'doc-back', 'selfie'] as const).map((s, i) => (
                    <span key={i} className={`h-1.5 w-8 rounded-full transition-colors ${
                      s === step ? 'bg-primary'
                      : (step === 'doc-back' && s === 'doc-front') || (step === 'selfie' && (s === 'doc-front' || s === 'doc-back'))
                      ? 'bg-primary/40' : 'bg-slate-200'
                    }`} />
                  ))}
                </div>
              </div>
            </div>

            {preview ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="material-symbols-outlined animate-spin text-white text-[32px]">autorenew</span>
                    </div>
                  )}
                </div>
                <button onClick={() => { setPreview(null); if (step === 'doc-front') setDocFront(null); else if (step === 'doc-back') setDocBack(null); else setSelfie(null); }}
                  className="w-full py-2.5 rounded-xl border border-outline-variant text-secondary font-semibold text-label-bold hover:border-primary/40 transition cursor-pointer">
                  {t.kyc.changeFile}
                </button>
                {!uploading && (
                  <button onClick={advance}
                    className="w-full py-3.5 rounded-xl bg-primary-container text-white font-bold text-label-bold hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                    {t.kyc.continue}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                )}
              </div>
            ) : (
              <label className="block rounded-2xl border-2 border-dashed border-outline-variant p-8 text-center hover:border-primary/40 transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-[52px] text-slate-300 group-hover:text-primary/40 transition-colors block mb-3">{stepIcon}</span>
                <p className="font-semibold text-secondary text-label-bold">{t.kyc.uploadZone}</p>
                <p className="text-label-sm text-slate-400 mt-1">{t.kyc.uploadHint}</p>
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFileSelect} />
              </label>
            )}
          </div>
        )}

        {/* PROCESSING */}
        {step === 'processing' && (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-primary-fixed/30 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined animate-spin text-primary text-[36px]">autorenew</span>
            </div>
            <h2 className="text-h2 font-black text-on-background mb-2">{t.kyc.processingTitle}</h2>
            <p className="text-secondary text-body-md">{t.kyc.processingSub}</p>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-amber-50 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-amber-500 text-[40px]">pending_actions</span>
            </div>
            <h2 className="text-h2 font-black text-on-background mb-2">{t.kyc.submittedTitle}</h2>
            <p className="text-secondary text-body-md leading-relaxed mb-6">{t.kyc.submittedSub}</p>
            <button onClick={() => { reset(); onSuccess ? onSuccess() : onClose(); }}
              className="w-full py-3.5 rounded-xl bg-primary-container text-white font-bold text-label-bold hover:bg-primary transition-all active:scale-95 cursor-pointer">
              {t.kyc.successBtn}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
