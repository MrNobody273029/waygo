import { NextResponse } from 'next/server';import { z } from 'zod';
const schema=z.object({bookingId:z.string(),photoUrls:z.array(z.string()).min(8),phase:z.enum(['checkin','checkout'])});
export async function POST(req:Request){const input=schema.parse(await req.json());return NextResponse.json({bookingId:input.bookingId,conditionReport:'created',insuranceStatus:input.phase==='checkin'?'active':'completed_review_pending',requiredPhotos:8,receivedPhotos:input.photoUrls.length});}
