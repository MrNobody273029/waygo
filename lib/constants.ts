export const DEPOSIT_GEL = 250;
export const PLATFORM_FEE_RATE = 0.05;

export const insurancePlans = {
  basic:    { label: 'Basic',    dailyPrice: 0,  deductible: 1000, description: 'Included protection for budget trips.' },
  standard: { label: 'Standard', dailyPrice: 18, deductible: 400,  description: 'Lower risk, recommended for most guests.' },
  premium:  { label: 'Premium',  dailyPrice: 35, deductible: 0,    description: 'Zero deductible, maximum peace of mind.' },
} as const;

export type InsurancePlan = keyof typeof insurancePlans;

export function calculateBooking(dailyPrice: number, days: number, plan: InsurancePlan) {
  const base = dailyPrice * days;
  const insurance = insurancePlans[plan].dailyPrice * days;
  const platformFee = Math.round((base + insurance) * PLATFORM_FEE_RATE);
  return {
    base,
    insurance,
    platformFee,
    total: base + insurance + platformFee,
    deposit: DEPOSIT_GEL,
    deductible: insurancePlans[plan].deductible,
  };
}

// ─── Cancellation Policy ──────────────────────────────────────

export type CancellationTier =
  | 'pre_approval'  // awaiting_host: full refund (only platform fee kept)
  | 'grace_period'  // booked <24h ago AND pickup ≥7 days away: full refund
  | 'early'         // pickup ≥5 days away: 75% of rentable amount
  | 'standard'      // pickup ≥3 days away: 50%
  | 'late'          // pickup ≥24h away: 25%
  | 'no_refund'     // pickup <24h away: 0%
  | 'ineligible';   // already started, completed, or confirmed (picked up)

export interface CancellationResult {
  eligible: boolean;
  tier: CancellationTier;
  refundPct: number;           // of rentalAmount
  platformFeeKept: number;     // always kept, GEL
  refundAmount: number;        // GEL returned to guest (excl. deposit)
  depositRefund: number;       // always 250
  totalRefund: number;         // refundAmount + depositRefund
  hoursUntilPickup: number;
  daysUntilPickup: number;
}

export function calculateCancellation(
  booking: {
    startDate: Date;
    createdAt: Date;
    status: string;
    totalPrice: number;
    platformFeeGel: number;
  },
  now: Date = new Date(),
): CancellationResult {
  const hoursUntilPickup = (booking.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const daysUntilPickup = Math.floor(hoursUntilPickup / 24);
  const hoursSinceBooking = (now.getTime() - booking.createdAt.getTime()) / (1000 * 60 * 60);

  const ineligible = (tier: CancellationTier = 'ineligible'): CancellationResult => ({
    eligible: false, tier, refundPct: 0,
    platformFeeKept: 0, refundAmount: 0,
    depositRefund: 0, totalRefund: 0,
    hoursUntilPickup, daysUntilPickup,
  });

  // confirmed = car already picked up; completed/cancelled/rejected = terminal
  if (['confirmed', 'completed', 'rejected', 'cancelled'].includes(booking.status)) {
    return ineligible();
  }
  if (hoursUntilPickup <= 0) return ineligible();

  const platformFeeKept = booking.platformFeeGel;
  const rentalAmount = booking.totalPrice - platformFeeKept;

  let tier: CancellationTier;
  let refundPct: number;

  if (booking.status === 'awaiting_host') {
    tier = 'pre_approval';
    refundPct = 100;
  } else if (hoursUntilPickup >= 168 && hoursSinceBooking <= 24) {
    tier = 'grace_period';
    refundPct = 100;
  } else if (hoursUntilPickup >= 120) {
    tier = 'early';
    refundPct = 75;
  } else if (hoursUntilPickup >= 72) {
    tier = 'standard';
    refundPct = 50;
  } else if (hoursUntilPickup >= 24) {
    tier = 'late';
    refundPct = 25;
  } else {
    tier = 'no_refund';
    refundPct = 0;
  }

  const refundAmount = Math.round(rentalAmount * refundPct / 100);

  return {
    eligible: true,
    tier,
    refundPct,
    platformFeeKept,
    refundAmount,
    depositRefund: DEPOSIT_GEL,
    totalRefund: refundAmount + DEPOSIT_GEL,
    hoursUntilPickup,
    daysUntilPickup,
  };
}
