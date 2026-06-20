import { NextResponse } from 'next/server';

const LOCAL_AIRPORTS = [
  { iata_code: 'VCP', name: 'Viracopos International Airport', city_name: 'Campinas / SP', country_name: 'Brasil', type: 'airport', id: 'arp_vcp_br', city: { name: 'Campinas / SP' } },
  { iata_code: 'GRU', name: 'Guarulhos International Airport', city_name: 'São Paulo / SP', country_name: 'Brasil', type: 'airport', id: 'arp_gru_br', city: { name: 'São Paulo / SP' } },
  { iata_code: 'CGH', name: 'Congonhas Airport', city_name: 'São Paulo / SP', country_name: 'Brasil', type: 'airport', id: 'arp_cgh_br', city: { name: 'São Paulo / SP' } },
  { iata_code: 'BSB', name: 'Brasilia International Airport', city_name: 'Brasília / DF', country_name: 'Brasil', type: 'airport', id: 'arp_bsb_br', city: { name: 'Brasília / DF' } },
  { iata_code: 'GIG', name: 'Galeão International Airport', city_name: 'Rio de Janeiro / RJ', country_name: 'Brasil', type: 'airport', id: 'arp_gig_br', city: { name: 'Rio de Janeiro / RJ' } },
  { iata_code: 'SDU', name: 'Santos Dumont Airport', city_name: 'Rio de Janeiro / RJ', country_name: 'Brasil', type: 'airport', id: 'arp_sdu_br', city: { name: 'Rio de Janeiro / RJ' } },
  { iata_code: 'MIA', name: 'Miami International Airport', city_name: 'Miami', country_name: 'Estados Unidos', type: 'airport', id: 'arp_mia_us', city: { name: 'Miami' } },
  { iata_code: 'MCO', name: 'Orlando International Airport', city_name: 'Orlando', country_name: 'Estados Unidos', type: 'airport', id: 'arp_mco_us', city: { name: 'Orlando' } },
  { iata_code: 'FLL', name: 'Fort Lauderdale-Hollywood Airport', city_name: 'Fort Lauderdale', country_name: 'Estados Unidos', type: 'airport', id: 'arp_fll_us', city: { name: 'Fort Lauderdale' } },
  { iata_code: 'JFK', name: 'John F. Kennedy International Airport', city_name: 'Nova York', country_name: 'Estados Unidos', type: 'airport', id: 'arp_jfk_us', city: { name: 'Nova York' } },
  { iata_code: 'LIS', name: 'Lisbon Humberto Delgado Airport', city_name: 'Lisboa', country_name: 'Portugal', type: 'airport', id: 'arp_lis_pt', city: { name: 'Lisboa' } },
  { iata_code: 'CDG', name: 'Charles de Gaulle Airport', city_name: 'Paris', country_name: 'França', type: 'airport', id: 'arp_cdg_fr', city: { name: 'Paris' } },
  { iata_code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city_name: 'Madrid', country_name: 'Espanha', type: 'airport', id: 'arp_mad_es', city: { name: 'Madrid' } },
  { iata_code: 'DUB', name: 'Dublin Airport', city_name: 'Dublin', country_name: 'Irlanda', type: 'airport', id: 'arp_dub_ie', city: { name: 'Dublin' } },
  { iata_code: 'LHR', name: 'London Heathrow Airport', city_name: 'Londres', country_name: 'Reino Unido', type: 'airport', id: 'arp_lhr_gb', city: { name: 'Londres' } },
  { iata_code: 'SSA', name: 'Deputado Luís Eduardo Magalhães Airport', city_name: 'Salvador / BA', country_name: 'Brasil', type: 'airport', id: 'arp_ssa_br', city: { name: 'Salvador / BA' } },
  { iata_code: 'CNF', name: 'Tancredo Neves International Airport', city_name: 'Belo Horizonte / MG', country_name: 'Brasil', type: 'airport', id: 'arp_cnf_br', city: { name: 'Belo Horizonte / MG' } },
  { iata_code: 'REC', name: 'Guararapes-Gilberto Freyre Airport', city_name: 'Recife / PE', country_name: 'Brasil', type: 'airport', id: 'arp_rec_br', city: { name: 'Recife / PE' } },
  { iata_code: 'FOR', name: 'Pinto Martins International Airport', city_name: 'Fortaleza / CE', country_name: 'Brasil', type: 'airport', id: 'arp_for_br', city: { name: 'Fortaleza / CE' } },
  { iata_code: 'POA', name: 'Salgado Filho International Airport', city_name: 'Porto Alegre / RS', country_name: 'Brasil', type: 'airport', id: 'arp_poa_br', city: { name: 'Porto Alegre / RS' } },
  { iata_code: 'FLN', name: 'Hercílio Luz International Airport', city_name: 'Florianópolis / SC', country_name: 'Brasil', type: 'airport', id: 'arp_fln_br', city: { name: 'Florianópolis / SC' } },
  { iata_code: 'CWB', name: 'Afonso Pena International Airport', city_name: 'Curitiba / PR', country_name: 'Brasil', type: 'airport', id: 'arp_cwb_br', city: { name: 'Curitiba / PR' } },
  { iata_code: 'GYN', name: 'Santa Genoveva Airport', city_name: 'Goiânia / GO', country_name: 'Brasil', type: 'airport', id: 'arp_gyn_br', city: { name: 'Goiânia / GO' } }
];

let cachedToken = null;
let tokenExpiry = 0;

async function getAmadeusToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (res.ok) {
      const data = await res.json();
      cachedToken = data.access_token;
      tokenExpiry = now + (data.expires_in - 60) * 1000; // Subtract 60 seconds buffer
      return cachedToken;
    }
  } catch (error) {
    console.error('Error fetching Amadeus OAuth2 Token:', error);
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  // --- PROCESSADOR INTELIGENTE DE BUSCA (Anti-Ruído) ---
  let cleanQuery = query.toLowerCase();
  const noiseWords = [
    'aeroporto', 'airport', 'internacional', 'international',
    'em', 'no', 'na', 'de', 'do', 'da', 'para', 'to',
    'eua', 'usa', 'br', 'brasil', 'brazil'
  ];
  
  noiseWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanQuery = cleanQuery.replace(regex, ' ');
  });

  cleanQuery = cleanQuery.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
  cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim();

  const parts = cleanQuery.split(' ');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    if (lastPart.length === 2 && /^[a-z]{2}$/i.test(lastPart)) {
      parts.pop();
      cleanQuery = parts.join(' ');
    }
  }

  if (!cleanQuery) {
    cleanQuery = query.trim();
  }

  const executeLocalSearch = () => {
    const term = cleanQuery.toLowerCase();
    return LOCAL_AIRPORTS.filter(place => {
      return (
        place.iata_code.toLowerCase().includes(term) ||
        place.name.toLowerCase().includes(term) ||
        place.city_name.toLowerCase().includes(term) ||
        place.country_name.toLowerCase().includes(term)
      );
    });
  };

  const token = await getAmadeusToken();

  if (!token) {
    console.log('Amadeus API credentials missing or token failed. Falling back to Local Search.');
    return NextResponse.json(executeLocalSearch());
  }

  try {
    const res = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(cleanQuery)}&page[limit]=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.warn(`Amadeus API places error ${res.status}. Falling back to Local Search.`);
      return NextResponse.json(executeLocalSearch());
    }

    const json = await res.json();
    const locations = json.data || [];
    
    const places = locations.map(loc => ({
      iata_code: loc.iataCode,
      name: loc.name,
      city_name: loc.address?.cityName,
      country_name: loc.address?.countryName,
      type: loc.subType.toLowerCase(),
      id: loc.id,
      city: { name: loc.address?.cityName }
    }));

    if (places.length === 0) {
      return NextResponse.json(executeLocalSearch());
    }
    
    return NextResponse.json(places);
  } catch (error) {
    console.error('AMADEUS PLACES API ERROR, falling back to Local Search:', error);
    return NextResponse.json(executeLocalSearch());
  }
}
