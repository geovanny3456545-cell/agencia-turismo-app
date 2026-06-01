import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  const token = process.env.DUFFEL_ACCESS_TOKEN;

  try {
    const res = await fetch(`https://api.duffel.com/places/suggestions?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Duffel API places error:', errText);
      return NextResponse.json({ error: 'Erro ao buscar aeroportos na Duffel' }, { status: res.status });
    }

    const json = await res.json();
    const places = json.data || [];
    
    return NextResponse.json(places);
  } catch (error) {
    console.error('PLACES API ROUTE ERROR:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
