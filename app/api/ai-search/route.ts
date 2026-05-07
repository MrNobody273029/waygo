import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a car rental search assistant for WAYGO.ge (Georgia).
Extract search filters from user queries in any language (Georgian, English, Russian, or mixed).
Respond ONLY with a valid JSON object.

Available options:
- Cities (always return city names in English exactly as listed):
  Tbilisi, Batumi, Kutaisi, Rustavi, Gori, Zugdidi, Poti, Akhaltsikhe, Mtskheta, Telavi,
  Sighnaghi, Borjomi, Kobuleti, Kazbegi, Mestia, Kvareli, Akhalkalaki, Tskaltubo, Lagodekhi, Anaklia
- Car types: Economy, Compact, Sedan, SUV, Minivan, Premium, Pickup, Coupe, Hatchback, Convertible
- Transmission: Automatic, Manual
- Fuel: Petrol, Diesel, Hybrid, Electric, LPG
- Features (use exact spelling):
  Air Conditioning, Bluetooth, GPS Navigation, Backup Camera, Heated Seats, Sunroof, AWD / 4WD,
  USB Charging, Parking Sensors, Electric Windows, ABS, Cruise Control, Roof Rack, Child Seat
- Currency: convert USD to GEL (×2.7), EUR to GEL (×2.9), round to nearest 5

City language mapping examples:
  "თბილისი" → "Tbilisi", "ბათუმი" → "Batumi", "ქუთაისი" → "Kutaisi"
  "ყაზბეგი" → "Kazbegi", "მესტია" → "Mestia", "ბორჯომი" → "Borjomi"
  "Тбилиси" → "Tbilisi", "Батуми" → "Batumi", "Казбеги" → "Kazbegi"

Required JSON schema:
{
  "filters": {
    "city": string or null,
    "carType": string or null,
    "transmission": string or null,
    "maxPrice": number or null,
    "fuelType": string or null,
    "minSeats": number or null,
    "brand": string or null,
    "days": number or null,
    "features": string[]
  },
  "confidence": number between 0.0 and 1.0,
  "needs_escalation": boolean,
  "question": string or null
}

Rules:
- confidence: 0.0–1.0 (how certain you are about the extraction)
- needs_escalation: true if confidence < 0.7 or query is too ambiguous to parse
- question: ONE short clarifying question in the SAME LANGUAGE as the query if critical info is missing, otherwise null
- features: empty array [] if no features detected
- city: ALWAYS return the English canonical name from the cities list, never translated forms`;

async function callOpenAI(
  model: string,
  query: string,
): Promise<{ parsed: Record<string, unknown> | null; ok: boolean }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { parsed: null, ok: false };

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
      }),
    });

    if (!res.ok) return { parsed: null, ok: false };
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return { parsed, ok: true };
  } catch {
    return { parsed: null, ok: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    if (!query) return NextResponse.json({ error: 'No query' }, { status: 400 });

    // Step 1: cheap & fast
    const { parsed: mini, ok: miniOk } = await callOpenAI('gpt-4o-mini', query);

    // Step 2: escalate to gpt-4o if confidence is low or parse failed
    const needsEscalation =
      !miniOk ||
      !mini ||
      typeof mini.confidence !== 'number' ||
      (mini.confidence as number) < 0.72 ||
      mini.needs_escalation === true;

    if (needsEscalation) {
      const { parsed: full, ok: fullOk } = await callOpenAI('gpt-4o', query);
      if (fullOk && full) {
        return NextResponse.json(full);
      }
    }

    if (!mini) {
      return NextResponse.json({ error: 'Parse failed' }, { status: 500 });
    }

    return NextResponse.json(mini);
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
