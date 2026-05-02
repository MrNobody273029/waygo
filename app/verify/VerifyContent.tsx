'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KYCModal } from '@/components/kyc-modal';
import { VerificationPendingPopup } from '@/components/verification-pending-popup';
import { useLang } from '@/components/lang-provider';

interface Props {
  verificationStatus: string;
  verificationRejectionComment: string | null;
  docFront: string | null;
  docBack: string | null;
  selfie: string | null;
}

export function VerifyContent({ verificationStatus, verificationRejectionComment, docFront, docBack, selfie }: Props) {
  const router = useRouter();
  const { t } = useLang();
  const isSubmitted = verificationStatus === 'SUBMITTED';
  const isVerified = verificationStatus === 'APPROVED';

  const [showKYC, setShowKYC] = useState(!isSubmitted && !isVerified);
  const [showPending, setShowPending] = useState(isSubmitted);

  useEffect(() => {
    if (isVerified) router.replace('/dashboard');
  }, [isVerified, router]);

  function handleClose() {
    router.replace('/dashboard');
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <KYCModal
        open={showKYC}
        onClose={handleClose}
        onSuccess={handleClose}
        verificationType="guest"
        rejectionComment={verificationRejectionComment}
        initialDocFront={docFront}
        initialDocBack={docBack}
        initialSelfie={selfie}
      />
      <VerificationPendingPopup
        open={showPending}
        onClose={handleClose}
      />
    </main>
  );
}
