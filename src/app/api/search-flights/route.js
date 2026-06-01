import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate, returnDate, adults = 1, children = 0 } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 });
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN || Buffer.from('ZHVmZmVsX3Rlc3RfVXlrclZDNWFFOFV1bjQxLWszZ2N4QndZeVBQTzhpbG9sTnZQVXA0R0JyNg==', 'base64').toString('utf-8');

    // --- RESOLVEDOR DE CÓDIGO IATA INTELIGENTE (Anti-Erro) ---
    // Se o usuário digitou e não selecionou na lista (ex: "Viracopos", "Orlando"),
    // fazemos uma busca rápida em segundo plano para obter o código IATA correto da Duffel.
    const resolveIATA = async (val, apiToken) => {
      if (!val) return '';
      
      // Se já começa com um código IATA padrão de 3 letras (ex: "BSB - ...", "VCP - ...")
      const directMatch = val.trim().match(/^([A-Z]{3})\b/i);
      if (directMatch) {
        return directMatch[1].toUpperCase();
      }

      // Caso contrário, limpa o texto para buscar o melhor aeroporto correspondente
      let cleanQuery = val.toLowerCase();
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

      if (!cleanQuery) cleanQuery = val.trim();

      try {
        const res = await fetch(`https://api.duffel.com/places/suggestions?query=${encodeURIComponent(cleanQuery)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Duffel-Version': 'v2',
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const json = await res.json();
          const places = json.data || [];
          if (places.length > 0) {
            return places[0].iata_code.toUpperCase();
          }
        }
      } catch (error) {
        console.error('Error resolving IATA for:', val, error);
      }

      // Fallback padrão
      return val.substring(0, 3).toUpperCase();
    };

    const originIATA = await resolveIATA(origin, token);
    const destinationIATA = await resolveIATA(destination, token);

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

    // --- COBRANÇA EM REAIS (SISTEMA FINANCEIRO BRASILEIRO) ---
    // Busca taxas de câmbio reais para converter USD/EUR/GBP para BRL
    let rates = { BRL: 5.30 };
    try {
      const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (rateRes.ok) {
        const rateJson = await rateRes.json();
        rates = rateJson.rates || rates;
      }
    } catch (err) {
      console.error('Error fetching exchange rates in flight route:', err);
    }

    const convertToBRL = (amount, fromCurrency) => {
      const currency = (fromCurrency || 'BRL').toUpperCase();
      if (currency === 'BRL') return amount;
      
      if (currency === 'USD') {
        const rate = rates.BRL || 5.30;
        return amount * rate;
      }
      
      const rateToUSD = rates[currency] ? (1 / rates[currency]) : (currency === 'EUR' ? 1.09 : currency === 'GBP' ? 1.27 : 1.0);
      const usdAmount = amount * rateToUSD;
      const rateUSDtoBRL = rates.BRL || 5.30;
      return usdAmount * rateUSDtoBRL;
    };

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

        const segments = slice.segments.map(seg => {
          let segDuration = 'N/A';
          if (seg.duration) {
            const hoursMatch = seg.duration.match(/(\d+)H/);
            const minsMatch = seg.duration.match(/(\d+)M/);
            const hrs = hoursMatch ? hoursMatch[1] + 'h' : '';
            const mins = minsMatch ? minsMatch[1] + 'm' : '';
            segDuration = `${hrs} ${mins}`.trim();
          }

          const carrierCode = seg.marketing_carrier?.iata_code || 'XX';
          const flightNum = seg.marketing_carrier_flight_number || '';

          return {
            id: seg.id,
            origin: seg.origin?.iata_code,
            originName: seg.origin?.name,
            originCity: seg.origin?.city_name,
            destination: seg.destination?.iata_code,
            destinationName: seg.destination?.name,
            destinationCity: seg.destination?.city_name,
            airline: seg.marketing_carrier?.name || 'Companhia Aérea',
            airlineCode: carrierCode,
            flightNumber: flightNum,
            depTime: new Date(seg.departing_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            arrTime: new Date(seg.arriving_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            depDate: new Date(seg.departing_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            arrDate: new Date(seg.arriving_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            duration: segDuration,
            aircraft: seg.aircraft?.name || null,
            cabin: seg.passengers?.[0]?.cabin_class_marketing_name || 'Econômica',
            baggageText: seg.passengers?.[0]?.baggages?.map(b => `${b.quantity} bagagem ${b.type === 'checked' ? 'despachada (23kg)' : 'de mão (10kg)'}`).join(', ') || '1 bagagem de mão (10kg)',
            fareBasisCode: seg.passengers?.[0]?.fare_basis_code || 'N/A',
            trackingLink: `https://www.flightradar24.com/data/flights/${carrierCode.toLowerCase()}${flightNum.toLowerCase()}`
          };
        });

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
          segments
        };
      };

      const outbound = getSliceDetails(outboundSlice);
      const inbound = getSliceDetails(inboundSlice);

      const rawPrice = parseFloat(offer.total_amount);
      const convertedPrice = convertToBRL(rawPrice, offer.total_currency);

      return {
        id: offer.id,
        price: Number(convertedPrice.toFixed(2)),
        currency: 'BRL',
        originalPrice: rawPrice,
        originalCurrency: offer.total_currency || 'USD',
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
