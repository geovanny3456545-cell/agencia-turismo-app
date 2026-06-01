import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  const token = process.env.DUFFEL_ACCESS_TOKEN;

  // --- PROCESSADOR INTELIGENTE DE BUSCA (Anti-Ruído) ---
  // Limpa o termo digitado pelo usuário para que a API GDS da Duffel (que é literal) encontre os aeroportos reais.
  let cleanQuery = query.toLowerCase();

  // 1. Remover conectivos e ruídos comuns de digitação em português e inglês
  const noiseWords = [
    'aeroporto', 'airport', 'internacional', 'international',
    'em', 'no', 'na', 'de', 'do', 'da', 'para', 'to',
    'eua', 'usa', 'br', 'brasil', 'brazil'
  ];
  
  noiseWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanQuery = cleanQuery.replace(regex, ' ');
  });

  // 2. Limpar espaços duplicados e pontuação
  cleanQuery = cleanQuery.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
  cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim();

  // 3. Remover sufixos de Estados Brasileiros (ex: "SP", "RJ", "DF", "GO", "MG") que o usuário costuma digitar no final
  const parts = cleanQuery.split(' ');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    // Se a última parte for uma sigla de 2 letras (ex: sp, rj, df, go, mg, ba, pr, rs, etc.)
    if (lastPart.length === 2 && /^[a-z]{2}$/i.test(lastPart)) {
      parts.pop(); // Remove o estado
      cleanQuery = parts.join(' ');
    }
  }

  // Se a limpeza esvaziar a busca, voltamos para a busca original simplificada
  if (!cleanQuery) {
    cleanQuery = query.trim();
  }

  console.log(`Original query: "${query}" -> Smart clean query: "${cleanQuery}"`);

  try {
    const res = await fetch(`https://api.duffel.com/places/suggestions?query=${encodeURIComponent(cleanQuery)}`, {
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
