import { clsx, type ClassValue } from 'clsx';
export function cn(...inputs: ClassValue[]) { return clsx(inputs); }
export function gel(n: number) { return `${n} ₾`; }
export function daysBetween(start:string,end:string){ const a=new Date(start); const b=new Date(end); return Math.max(1,Math.ceil((+b-+a)/(1000*60*60*24))); }
