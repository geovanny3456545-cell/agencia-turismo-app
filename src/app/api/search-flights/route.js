import { NextResponse } from 'next/server';

// Lista de aeroportos brasileiros comuns para classificação automática de rotas
const DOMESTIC_IATAS = [
  'GRU', 'CGH', 'VCP', 'BSB', 'GIG', 'SDU', 'CNF', 'SSA', 'REC', 'FOR', 'POA',
  'FLN', 'CWB', 'GYN', 'MCZ', 'NAT', 'JOI', 'IGU', 'LDB', 'PMW', 'BEL', 'MAO',
  'CGB', 'VIX', 'NVT', 'UDI', 'SJP', 'XAP', 'IOS', 'JPA', 'AJU', 'THE', 'PVH',
  'BVB', 'RBR', 'MCP', 'MOC', 'CXJ', 'PET', 'PHB', 'IMP', 'STM', 'MAB', 'OPS'
];

const isDomesticRoute = (orig, dest) => {
  return DOMESTIC_IATAS.includes(orig) && DOMESTIC_IATAS.includes(dest);
};

const resolveIATA = (val) => {
  if (!val) return '';
  const match = val.trim().match(/^([A-Z]{3})\b/i);
  if (match) return match[1].toUpperCase();
  return val.substring(0, 3).toUpperCase();
};

const parseDuffelDuration = (durStr) => {
  if (!durStr) return 'N/A';
  return durStr.replace('PT', '').toLowerCase();
};

// Gerador de voos domésticos simulando Consolidadora Brasileira
const generateDomesticOffers = (originIATA, destinationIATA, departureDate, returnDate, adults, children) => {
  const carriers = [
    { name: 'LATAM Airlines', code: 'LA', aircraft: 'Airbus A320neo' },
    { name: 'Gol Linhas Aéreas', code: 'G3', aircraft: 'Boeing 737-800' },
    { name: 'Azul Linhas Aéreas', code: 'AD', aircraft: 'Embraer 195-E2' }
  ];
  
  const offers = [];
  const paxCount = adults + children * 0.85;
  
  carriers.forEach((carrier, idx) => {
    const flightNum = String(Math.floor(1000 + Math.random() * 8999));
    const stops = idx === 2 ? 1 : 0; // Azul possui escala em Viracopos (VCP)
    const layover = stops > 0 ? 'VCP' : '';
    
    // Custo base realista em BRL por passageiro
    const baseP = returnDate ? (580 + idx * 70) : (340 + idx * 40);
    const totalP = Math.round(baseP * paxCount);
    
    const depTime = idx === 0 ? '08:15' : idx === 1 ? '14:30' : '19:10';
    const arrTime = idx === 0 ? '10:00' : idx === 1 ? '16:15' : '22:45';
    
    const outboundSegments = [];
    if (stops === 0) {
      outboundSegments.push({
        id: `dom-seg-${idx}-out-0`,
        origin: originIATA,
        originCity: originIATA,
        originName: `Aeroporto de ${originIATA}`,
        destination: destinationIATA,
        destinationCity: destinationIATA,
        destinationName: `Aeroporto de ${destinationIATA}`,
        airline: carrier.name,
        airlineCode: carrier.code,
        flightNumber: flightNum,
        depTime,
        arrTime,
        depDate: new Date(departureDate + 'T00:00:00').toLocaleDateString('pt-BR'),
        arrDate: new Date(departureDate + 'T00:00:00').toLocaleDateString('pt-BR'),
        duration: '1h 45m',
        aircraft: carrier.aircraft,
        cabin: 'Econômica',
        baggageText: 'Mochila de mão (10kg) inclusa',
        fareBasisCode: 'DOM-PROMO',
        trackingLink: `https://www.flightradar24.com/data/flights/${carrier.code.toLowerCase()}${flightNum.toLowerCase()}`
      });
    } else {
      outboundSegments.push({
        id: `dom-seg-${idx}-out-1`,
        origin: originIATA,
        originCity: originIATA,
        originName: `Aeroporto de ${originIATA}`,
        destination: layover,
        destinationCity: 'Campinas / SP',
        destinationName: 'Aeroporto Internacional de Viracopos',
        airline: carrier.name,
        airlineCode: carrier.code,
        flightNumber: flightNum,
        depTime: '17:00',
        arrTime: '18:15',
        depDate: new Date(departureDate + 'T00:00:00').toLocaleDateString('pt-BR'),
        arrDate: new Date(departureDate + 'T00:00:00').toLocaleDateString('pt-BR'),
        duration: '1h 15m',
        aircraft: carrier.aircraft,
        cabin: 'Econômica',
        baggageText: 'Mochila de mão (10kg) inclusa',
        fareBasisCode: 'DOM-CONEX1',
        trackingLink: `https://www.flightradar24.com/data/flights/${carrier.code.toLowerCase()}${flightNum.toLowerCase()}`
      });
      outboundSegments.push({
        id: `dom-seg-${idx}-out-2`,
        origin: layover,
        originCity: 'Campinas / SP',
        originName: 'Aeroporto Internacional de Viracopos',
        destination: destinationIATA,
        destinationCity: destinationIATA,
        destinationName: `Aeroporto de ${destinationIATA}`,
        airline: carrier.name,
        airlineCode: carrier.code,
        flightNumber: String(Number(flightNum) + 1),
        depTime: '19:30',
        arrTime: '20:45',
        depDate: new Date(departureDate + 'T00:00:00').toLocaleDateString('pt-BR'),
        arrDate: new Date(departureDate + 'T00:00:00').toLocaleDateString('pt-BR'),
        duration: '1h 15m',
        aircraft: carrier.aircraft,
        cabin: 'Econômica',
        baggageText: 'Mochila de mão (10kg) inclusa',
        fareBasisCode: 'DOM-CONEX2',
        trackingLink: `https://www.flightradar24.com/data/flights/${carrier.code.toLowerCase()}${String(Number(flightNum) + 1).toLowerCase()}`
      });
    }
    
    const outbound = {
      depTime: outboundSegments[0].depTime,
      arrTime: outboundSegments[outboundSegments.length - 1].arrTime,
      depDate: new Date(departureDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      arrDate: new Date(departureDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      stopsCount: stops,
      stopsText: stops === 0 ? 'Direto' : `${stops} conexão`,
      connections: stops === 0 ? '' : layover,
      duration: stops === 0 ? '1h 45m' : '3h 45m',
      segments: outboundSegments
    };
    
    let inbound = null;
    if (returnDate) {
      const inboundFlightNum = String(Number(flightNum) + 10);
      const inboundSegments = [];
      
      if (stops === 0) {
        inboundSegments.push({
          id: `dom-seg-${idx}-in-0`,
          origin: destinationIATA,
          originCity: destinationIATA,
          originName: `Aeroporto de ${destinationIATA}`,
          destination: originIATA,
          destinationCity: originIATA,
          destinationName: `Aeroporto de ${originIATA}`,
          airline: carrier.name,
          airlineCode: carrier.code,
          flightNumber: inboundFlightNum,
          depTime: '11:00',
          arrTime: '12:45',
          depDate: new Date(returnDate + 'T00:00:00').toLocaleDateString('pt-BR'),
          arrDate: new Date(returnDate + 'T00:00:00').toLocaleDateString('pt-BR'),
          duration: '1h 45m',
          aircraft: carrier.aircraft,
          cabin: 'Econômica',
          baggageText: 'Mochila de mão (10kg) inclusa',
          fareBasisCode: 'DOM-PROMO',
          trackingLink: `https://www.flightradar24.com/data/flights/${carrier.code.toLowerCase()}${inboundFlightNum.toLowerCase()}`
        });
      } else {
        inboundSegments.push({
          id: `dom-seg-${idx}-in-1`,
          origin: destinationIATA,
          originCity: destinationIATA,
          originName: `Aeroporto de ${destinationIATA}`,
          destination: layover,
          destinationCity: 'Campinas / SP',
          destinationName: 'Aeroporto Internacional de Viracopos',
          airline: carrier.name,
          airlineCode: carrier.code,
          flightNumber: inboundFlightNum,
          depTime: '12:00',
          arrTime: '13:15',
          depDate: new Date(returnDate + 'T00:00:00').toLocaleDateString('pt-BR'),
          arrDate: new Date(returnDate + 'T00:00:00').toLocaleDateString('pt-BR'),
          duration: '1h 15m',
          aircraft: carrier.aircraft,
          cabin: 'Econômica',
          baggageText: 'Mochila de mão (10kg) inclusa',
          fareBasisCode: 'DOM-CONEX1',
          trackingLink: `https://www.flightradar24.com/data/flights/${carrier.code.toLowerCase()}${inboundFlightNum.toLowerCase()}`
        });
        inboundSegments.push({
          id: `dom-seg-${idx}-in-2`,
          origin: layover,
          originCity: 'Campinas / SP',
          originName: 'Aeroporto Internacional de Viracopos',
          destination: originIATA,
          destinationCity: originIATA,
          destinationName: `Aeroporto de ${originIATA}`,
          airline: carrier.name,
          airlineCode: carrier.code,
          flightNumber: String(Number(inboundFlightNum) + 1),
          depTime: '14:30',
          arrTime: '15:45',
          depDate: new Date(returnDate + 'T00:00:00').toLocaleDateString('pt-BR'),
          arrDate: new Date(returnDate + 'T00:00:00').toLocaleDateString('pt-BR'),
          duration: '1h 15m',
          aircraft: carrier.aircraft,
          cabin: 'Econômica',
          baggageText: 'Mochila de mão (10kg) inclusa',
          fareBasisCode: 'DOM-CONEX2',
          trackingLink: `https://www.flightradar24.com/data/flights/${carrier.code.toLowerCase()}${String(Number(inboundFlightNum) + 1).toLowerCase()}`
        });
      }
      
      inbound = {
        depTime: inboundSegments[0].depTime,
        arrTime: inboundSegments[inboundSegments.length - 1].arrTime,
        depDate: new Date(returnDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        arrDate: new Date(returnDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        stopsCount: stops,
        stopsText: stops === 0 ? 'Direto' : `${stops} conexão`,
        connections: stops === 0 ? '' : layover,
        duration: stops === 0 ? '1h 45m' : '3h 45m',
        segments: inboundSegments
      };
    }
    
    offers.push({
      id: `dom-${carrier.code}-${flightNum}`,
      provider: 'consolidadora',
      providerLabel: idx === 0 ? 'Consolidadora RexturAdvance (Tarifa Acordo)' : idx === 1 ? 'Consolidadora Esferatur (Tarifa B2B)' : 'Consolidadora Flytour (Tarifa Promo)',
      price: totalP,
      currency: 'BRL',
      airline: carrier.name,
      airlineCode: carrier.code,
      outbound,
      inbound,
      installmentText: `Em até 10x sem juros no cartão`,
      guaranteed: true
    });
  });
  
  return offers;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      origin, 
      destination, 
      departureDate, 
      returnDate, 
      adults = 1, 
      children = 0,
      nonStop = false
    } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 });
    }

    const originIATA = resolveIATA(origin);
    const destinationIATA = resolveIATA(destination);

    // --- 1. CONSULTA DE CÂMBIO REAL-TIME ---
    let rates = { BRL: 5.45 };
    try {
      const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (rateRes.ok) {
        const rateJson = await rateRes.json();
        rates = rateJson.rates || rates;
      }
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
    }

    const getBaggageText = (offer) => {
      const firstPax = offer.passengers?.[0];
      const baggages = firstPax?.baggages || [];
      if (baggages.length === 0) return 'Mala de mão (10kg) inclusa';
      const carryOn = baggages.filter(b => b.type === 'carry_on');
      const checked = baggages.filter(b => b.type === 'checked');
      let parts = [];
      if (carryOn.length > 0) parts.push(`Mala de mão (${carryOn[0].max_weight_kg || 10}kg)`);
      if (checked.length > 0) parts.push(`${checked.length} bagagem despachada (${checked[0].max_weight_kg || 23}kg)`);
      return parts.join(' + ') + ' inclusa';
    };

    // --- 2. ROTEAMENTO DE CONSULTA ---
    const domestic = isDomesticRoute(originIATA, destinationIATA);
    let offersList = [];

    if (domestic) {
      // Cenário Doméstico: Consolidadora Nacional
      console.log('Domestic route detected. Fetching consolidadora simulation...');
      offersList = generateDomesticOffers(originIATA, destinationIATA, departureDate, returnDate, adults, children);
    } else {
      // Cenário Internacional: Duffel API
      console.log('International route detected. Fetching from Duffel API...');
      const duffelToken = process.env.DUFFEL_ACCESS_TOKEN;
      
      if (!duffelToken) {
        console.error('DUFFEL_ACCESS_TOKEN is missing in .env.local!');
        return NextResponse.json({ error: 'Configuração do token da Duffel ausente' }, { status: 500 });
      }

      // Montar passageiros da Duffel
      const passengers = [];
      for (let i = 0; i < adults; i++) {
        passengers.push({ type: 'adult' });
      }
      for (let i = 0; i < children; i++) {
        passengers.push({ type: 'child' });
      }

      const slices = [
        {
          origin: originIATA,
          destination: destinationIATA,
          departure_date: departureDate
        }
      ];

      if (returnDate) {
        slices.push({
          origin: destinationIATA,
          destination: originIATA,
          departure_date: returnDate
        });
      }

      try {
        const duffelRes = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${duffelToken}`,
            'Duffel-Version': 'v2',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              slices,
              passengers,
              cabin_class: 'economy'
            }
          })
        });

        if (duffelRes.ok) {
          const duffelData = await duffelRes.json();
          const rawOffers = duffelData.data?.offers || [];
          
          rawOffers.forEach((offer) => {
            const outboundItin = offer.slices[0];
            const inboundItin = offer.slices[1] || null;
            const carrier = offer.owner;

            const mapDuffelSlice = (slice) => {
              if (!slice) return null;
              const firstSeg = slice.segments[0];
              const lastSeg = slice.segments[slice.segments.length - 1];
              const stopsCount = slice.segments.length - 1;

              const segments = slice.segments.map((seg, idx) => {
                const segCarrier = seg.marketing_carrier?.iata_code || seg.operating_carrier?.iata_code || carrier.iata_code;
                const segCarrierName = seg.marketing_carrier?.name || seg.operating_carrier?.name || carrier.name;
                const flightNum = seg.marketing_carrier_flight_number || seg.operating_carrier_flight_number || '100';
                
                return {
                  id: seg.id || `${slice.id}-seg-${idx}`,
                  origin: seg.origin?.iata_code,
                  originCity: seg.origin?.city?.name || seg.origin?.name,
                  originName: seg.origin?.name,
                  destination: seg.destination?.iata_code,
                  destinationCity: seg.destination?.city?.name || seg.destination?.name,
                  destinationName: seg.destination?.name,
                  airline: segCarrierName,
                  airlineCode: segCarrier,
                  flightNumber: flightNum,
                  depTime: new Date(seg.departing_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                  arrTime: new Date(seg.arriving_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                  depDate: new Date(seg.departing_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                  arrDate: new Date(seg.arriving_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                  duration: parseDuffelDuration(seg.duration),
                  aircraft: seg.aircraft?.name || 'Aeronave NDC',
                  cabin: 'Econômica',
                  baggageText: getBaggageText(offer),
                  fareBasisCode: 'NDC-RESTRICTED',
                  trackingLink: `https://www.flightradar24.com/data/flights/${segCarrier.toLowerCase()}${flightNum.toLowerCase()}`
                };
              });

              return {
                depTime: new Date(firstSeg.departing_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                arrTime: new Date(lastSeg.arriving_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                depDate: new Date(firstSeg.departing_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                arrDate: new Date(lastSeg.arriving_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                stopsCount,
                stopsText: stopsCount === 0 ? 'Direto' : `${stopsCount} conexão${stopsCount > 1 ? 'ões' : ''}`,
                connections: slice.segments.slice(0, -1).map(s => s.destination?.iata_code).join(', '),
                duration: parseDuffelDuration(slice.duration),
                segments
              };
            };

            const outbound = mapDuffelSlice(outboundItin);
            const inbound = mapDuffelSlice(inboundItin);
            
            const rawPrice = parseFloat(offer.total_amount);
            const currency = offer.total_currency;
            
            // Converter para BRL baseado na cotação real
            const usdRate = rates.BRL || 5.45;
            const currencyRate = rates[currency] ? (usdRate / rates[currency]) : (currency === 'EUR' ? usdRate * 1.09 : usdRate);
            const priceBRL = rawPrice * currencyRate;

            offersList.push({
              id: offer.id,
              provider: 'duffel',
              providerLabel: 'Duffel NDC (Direto Cia Aérea)',
              price: priceBRL, // Preço líquido base em BRL (sem markup)
              priceUSD: currency === 'USD' ? rawPrice : (rawPrice / rates[currency]), // Normalizar em USD para exibição
              currencyUSD: 'USD',
              usdRate: usdRate,
              currency: 'BRL',
              airline: carrier.name,
              airlineCode: carrier.iata_code,
              outbound,
              inbound,
              passengers: offer.passengers, // IDs de passageiros da Duffel
              guaranteed: true
            });
          });
        } else {
          const errText = await duffelRes.text();
          console.error('Duffel API returned error:', errText);
          return NextResponse.json({ error: 'Erro ao buscar voos na Duffel API' }, { status: 502 });
        }
      } catch (err) {
        console.error('Failed to query Duffel:', err);
        return NextResponse.json({ error: 'Erro de conexão com a Duffel API' }, { status: 500 });
      }
    }

    // Filtrar por preferências (Voos Diretos)
    let filteredOffers = [...offersList];
    if (nonStop) {
      filteredOffers = filteredOffers.filter(o => o.outbound.stopsCount === 0);
    }

    // Ordenar por preço
    filteredOffers.sort((a, b) => a.price - b.price);

    // Marcar o mais barato
    if (filteredOffers.length > 0) {
      filteredOffers.forEach(o => o.isCheapest = false);
      filteredOffers[0].isCheapest = true;
    }

    return NextResponse.json({
      offers: filteredOffers
    });

  } catch (error) {
    console.error('SEARCH FLIGHTS ROUTE ERROR:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
