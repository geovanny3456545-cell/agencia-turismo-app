import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate, returnDate, adults = 1, children = 0 } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 });
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN;

    // Extrair apenas o código IATA (3 letras)
    const getIATA = (val) => {
      if (!val) return '';
      const match = val.match(/^[A-Z]{3}/i) || val.match(/\(([A-Z]{3})\)/i) || [null, val.substring(0, 3)];
      return (match[1] || match[0] || val.substring(0, 3)).toUpperCase();
    };

    const originIATA = getIATA(origin);
    const destinationIATA = getIATA(destination);

    // Construct slices
    const slices = [
      {
        origin: originIATA,
        destination: destinationIATA,
        departure_date: departureDate,
      }
    ];

    if (returnDate) {
      slices.push({
        origin: destinationIATA,
        destination: originIATA,
        departure_date: returnDate,
      });
    }

    // Construct passengers
    const passengers = [];
    for (let i = 0; i < Number(adults); i++) {
      passengers.push({ type: 'adult' });
    }
    for (let i = 0; i < Number(children); i++) {
      passengers.push({ type: 'child' });
    }

    const reqBody = {
      data: {
        slices,
        passengers,
        cabin_class: 'economy',
      }
    };

    console.log('Sending search request to Duffel Flights API:', JSON.stringify(reqBody));

    const res = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Duffel Search API error details:', errText);
      return NextResponse.json({ error: 'Erro ao pesquisar voos na Duffel' }, { status: res.status });
    }

    const json = await res.json();
    const offerRequest = json.data;
    const offers = offerRequest.offers || [];

    // Formata e mapeia as ofertas retornadas
    const formattedOffers = offers.map(offer => {
      const outboundSlice = offer.slices[0];
      const inboundSlice = offer.slices[1] || null;

      const getSliceDetails = (slice) => {
        if (!slice) return null;
        const firstSeg = slice.segments[0];
        const lastSeg = slice.segments[slice.segments.length - 1];
        
        const carrier = firstSeg?.marketing_carrier || firstSeg?.operating_carrier || { name: 'Companhia Aérea', iata_code: 'XX' };
        
        const depTime = firstSeg ? new Date(firstSeg.departing_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        const arrTime = lastSeg ? new Date(lastSeg.arriving_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        const depDate = firstSeg ? new Date(firstSeg.departing_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
        const arrDate = lastSeg ? new Date(lastSeg.arriving_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';

        const stopsCount = slice.segments.length - 1;
        const stopsText = stopsCount === 0 ? 'Direto' : `${stopsCount} escala${stopsCount > 1 ? 's' : ''}`;
        const connections = slice.segments.slice(0, -1).map(seg => seg.destination.iata_code).join(', ');

        // Calcular duração amigável
        let friendlyDuration = 'N/A';
        if (slice.duration) {
          const hoursMatch = slice.duration.match(/(\d+)H/);
          const minsMatch = slice.duration.match(/(\d+)M/);
          const hrs = hoursMatch ? hoursMatch[1] + 'h' : '';
          const mins = minsMatch ? minsMatch[1] + 'm' : '';
          friendlyDuration = `${hrs} ${mins}`.trim();
        }

        return {
          airline: carrier.name,
          airlineCode: carrier.iata_code,
          depTime,
          arrTime,
          depDate,
          arrDate,
          stopsCount,
          stopsText,
          connections,
          duration: friendlyDuration,
        };
      };

      const outbound = getSliceDetails(outboundSlice);
      const inbound = getSliceDetails(inboundSlice);

      return {
        id: offer.id,
        price: parseFloat(offer.total_amount),
        currency: offer.total_currency || 'BRL',
        outbound,
        inbound,
        airline: outbound?.airline || 'Multi-Airline',
        airlineCode: outbound?.airlineCode || 'XX',
        guaranteed: true,
      };
    });

    // Ordena do menor preço para o maior
    formattedOffers.sort((a, b) => a.price - b.price);

    // Identifica e marca o melhor preço
    if (formattedOffers.length > 0) {
      formattedOffers[0].isCheapest = true;
    }

    return NextResponse.json({
      offerRequestId: offerRequest.id,
      offers: formattedOffers,
    });

  } catch (error) {
    console.error('SEARCH FLIGHTS API ROUTE ERROR:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
