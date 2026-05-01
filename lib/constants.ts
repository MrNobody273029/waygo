export const DEPOSIT_GEL = 250;
export const PLATFORM_FEE_RATE = 0.12;
export const insurancePlans = {
  basic: { label: 'Basic', dailyPrice: 0, deductible: 1000, description: 'Included protection for budget trips.' },
  standard: { label: 'Standard', dailyPrice: 18, deductible: 400, description: 'Lower risk, recommended for most guests.' },
  premium: { label: 'Premium', dailyPrice: 35, deductible: 0, description: 'Zero deductible, maximum peace of mind.' }
} as const;
export type InsurancePlan = keyof typeof insurancePlans;
export function calculateBooking(dailyPrice:number, days:number, plan:InsurancePlan){
 const base=dailyPrice*days; const insurance=insurancePlans[plan].dailyPrice*days; const platformFee=Math.round((base+insurance)*PLATFORM_FEE_RATE); return {base,insurance,platformFee,total:base+insurance+platformFee,deposit:DEPOSIT_GEL,deductible:insurancePlans[plan].deductible};
}
