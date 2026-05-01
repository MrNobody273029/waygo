export async function createRentalPayment(amount:number){ return { providerId: `mock_pay_${Date.now()}`, amount, status:'succeeded' as const }; }
export async function authorizeDeposit(amount:number){ return { providerId: `mock_hold_${Date.now()}`, amount, status:'authorized' as const }; }
