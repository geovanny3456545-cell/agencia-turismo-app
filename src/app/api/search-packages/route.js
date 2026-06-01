import { NextResponse } from 'next/server';

const HOTELS_DB = {
  MIA: [
    {
      id: "hotel-mia-1",
      name: "Riviera Hotel & Suites South Beach",
      stars: 4,
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
      description: "Localizado no coração de South Beach, a poucos passos da praia de areia branca e dos melhores restaurantes e baladas de Miami. Design moderno e despojado.",
      dailyRate: 680,
      address: "2000 Liberty Ave, Miami Beach, FL 33139",
      amenities: ["Piscina", "Wi-Fi Grátis", "Pet Friendly", "Bar na Praia", "Ar Condicionado"]
    },
    {
      id: "hotel-mia-2",
      name: "InterContinental Miami",
      stars: 5,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      description: "Hotel de luxo icônico em Downtown Miami. Vista espetacular para a Baía de Biscayne, spa de classe mundial, piscina aquecida externa e alta gastronomia.",
      dailyRate: 1150,
      address: "100 Chopin Plaza, Miami, FL 33131",
      amenities: ["Spa de Luxo", "Piscina Infinita", "Academia 24h", "Restaurante Gourmet", "Serviço de Quarto 24h"]
    }
  ],
  MCO: [
    {
      id: "hotel-mco-1",
      name: "Universal's Cabana Bay Beach Resort",
      stars: 4,
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
      description: "Design retrô vibrante dos anos 50 e 60. Duas piscinas gigantes com toboáguas, rio lento para boiar e entrada antecipada exclusiva nos parques temáticos da Universal Orlando.",
      dailyRate: 720,
      address: "6550 Adventure Way, Orlando, FL 32819",
      amenities: ["Rio Lento", "Pista de Boliche", "Entrada Parques Universal", "Wi-Fi Grátis", "Praça de Alimentação"]
    },
    {
      id: "hotel-mco-2",
      name: "Waldorf Astoria Orlando",
      stars: 5,
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
      description: "Oásis de elegância e sofisticação cercado pela área do Walt Disney World. Conta com campo de golfe premiado de 18 buracos, cabanas privativas na piscina e um spa exclusivo de luxo.",
      dailyRate: 1450,
      address: "14200 Bonnet Creek Resort Ln, Orlando, FL 32821",
      amenities: ["Campo de Golfe", "Cabanas de Piscina", "Spa de Luxo", "Café da Manhã Incluso", "Translados Parques"]
    }
  ],
  LIS: [
    {
      id: "hotel-lis-1",
      name: "Altis Avenida Hotel",
      stars: 5,
      image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80",
      description: "Boutique hotel de luxo espetacular situado na Praça dos Restauradores. Estilo Art Déco sofisticado com o aclamado Restaurante Rossio no rooftop, proporcionando vistas inesquecíveis da cidade.",
      dailyRate: 890,
      address: "Rua 1º de Dezembro 120, 1200-360 Lisboa",
      amenities: ["Rooftop Bar", "Wi-Fi Ultra-Rápido", "Café da Manhã Incluso", "Restaurante Rossio", "Serviço Concierge"]
    }
  ],
  CDG: [
    {
      id: "hotel-cdg-1",
      name: "Pullman Paris Tour Eiffel",
      stars: 5,
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
      description: "Situado aos pés da Torre Eiffel e do Trocadéro. Quartos elegantes e modernos, a maioria oferecendo sacadas com uma vista panorâmica fascinante e direta do maior cartão postal de Paris.",
      dailyRate: 1350,
      address: "18 Avenue De Suffren, 75015 Paris",
      amenities: ["Vista Torre Eiffel", "Academia Moderna", "Restaurante Trocadéro", "Wi-Fi Rápido", "Bar de Vinhos"]
    }
  ],
  BSB: [
    {
      id: "hotel-bsb-1",
      name: "Royal Tulip Brasília Alvorada",
      stars: 5,
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
      description: "Obra-prima arquitetônica de Ruy Ohtake situada às margens do belíssimo Lago Paranoá. Complexo de lazer luxuoso com enormes piscinas, quadras de tênis e alto conforto.",
      dailyRate: 520,
      address: "SHTN Trecho 1 Conj. 1B, Brasília - DF, 70800-200",
      amenities: ["Enorme Piscina Resort", "Spa completo", "Marina / Lago", "Café da Manhã Cortesia", "Quadras de Tênis"]
    }
  ],
  GRU: [
    {
      id: "hotel-gru-1",
      name: "Hotel Unique São Paulo",
      stars: 5,
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
      description: "Verdadeiro marco do design e arquitetura em São Paulo. Famoso mundialmente pelo seu formato de barco e pelo Skye Bar no rooftop, que oferece piscina vermelha e vista 360° da metrópole.",
      dailyRate: 980,
      address: "Av. Brigadeiro Luís Antônio, 4700 - Jardim Paulista, São Paulo - SP",
      amenities: ["Skye Rooftop Bar", "Piscina Vermelha", "Design High-Tech", "Wi-Fi Premium", "Menu Assinado por Chef"]
    }
  ],
  GIG: [
    {
      id: "hotel-gig-1",
      name: "Copacabana Palace, A Belmond Hotel",
      stars: 5,
      image: "https://images.unsplash.com/photo-1529290130-4ca3753253ae?auto=format&fit=crop&w=600&q=80",
      description: "O hotel mais luxuoso, célebre e glamouroso do Brasil. História, elegância clássica na praia de Copacabana, piscina icônica e alta gastronomia com estrelas Michelin.",
      dailyRate: 1850,
      address: "Av. Atlântica, 1702 - Copacabana, Rio de Janeiro - RJ",
      amenities: ["Serviço de Praia VIP", "Restaurantes Michelin", "Piscina Histórica", "Café da Manhã Imperial", "Spa de Luxo"]
    }
  ]
};

const generateDynamicHotels = (iataCode) => {
  return [
    {
      id: `hotel-${iataCode.toLowerCase()}-1`,
      name: `Grand Plaza Hotel ${iataCode}`,
      stars: 4,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      description: `Excelente hotel 4 estrelas localizado na zona nobre de ${iataCode}. Próximo a shoppings, monumentos e principais avenidas de interesse turístico.`,
      dailyRate: 590,
      address: `Avenida das Nações, Distrito Central, ${iataCode}`,
      amenities: ["Piscina Aquecida", "Wi-Fi Grátis", "Café da Manhã Incluso", "Academia", "Business Center"]
    },
    {
      id: `hotel-${iataCode.toLowerCase()}-2`,
      name: `${iataCode} Elite Resort & Spa`,
      stars: 5,
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
      description: `Oásis de altíssimo padrão em ${iataCode}. Oferece serviço personalizado, spa com tratamentos estéticos, alta gastronomia internacional e suítes luxuosas.`,
      dailyRate: 1050,
      address: `Orla Costeira ou Bairro Nobre, ${iataCode}`,
      amenities: ["Piscina de Borda Infinita", "Spa Completo", "Café Gourmet Incluso", "Restaurante Michelin", "Concierge 24h"]
    }
  ];
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate, returnDate, adults = 1, children = 0 } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 });
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN;

    const getIATA = (val) => {
      if (!val) return '';
      const match = val.match(/^[A-Z]{3}/i) || val.match(/\(([A-Z]{3})\)/i) || [null, val.substring(0, 3)];
      return (match[1] || match[0] || val.substring(0, 3)).toUpperCase();
    };

    const originIATA = getIATA(origin);
    const destinationIATA = getIATA(destination);

    // 1. Chamar busca de voos reais da Duffel
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

    const passengers = [];
    for (let i = 0; i < Number(adults); i++) {
      passengers.push({ type: 'adult' });
    }
    for (let i = 0; i < Number(children); i++) {
      passengers.push({ type: 'child' });
    }

    const flightRes = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          slices,
          passengers,
          cabin_class: 'economy',
        }
      }),
    });

    let offers = [];
    let offerRequestId = '';
    if (flightRes.ok) {
      const flightJson = await flightRes.json();
      offers = flightJson.data.offers || [];
      offerRequestId = flightJson.data.id;
    } else {
      const errText = await flightRes.text();
      console.error('Duffel Search API fail in package route:', errText);
      return NextResponse.json({ error: 'Erro ao buscar voos reais na Duffel' }, { status: 500 });
    }

    // Calcular noites de hotel
    const d1 = new Date(departureDate);
    const d2 = returnDate ? new Date(returnDate) : new Date(d1.getTime() + 24 * 60 * 60 * 1000);
    const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));

    // 2. Acionar motor de hotéis reais (com fallback)
    let hotels = HOTELS_DB[destinationIATA] || generateDynamicHotels(destinationIATA);

    // Mapeamento e cálculo de pacotes (Voos + Hotéis)
    // Combinamos os voos com os hotéis de forma elegante
    const packages = [];

    // Formatar voos
    const formattedFlights = offers.slice(0, 10).map(offer => {
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

    // Combinar o voo mais barato com os hotéis disponíveis para criar as opções de Pacote
    if (formattedFlights.length > 0) {
      const bestFlight = formattedFlights[0];

      hotels.forEach(hotel => {
        const hotelTotalPrice = hotel.dailyRate * nights;
        const packageTotalPrice = bestFlight.price + hotelTotalPrice;

        packages.push({
          id: `pkg-${bestFlight.id}-${hotel.id}`,
          flightId: bestFlight.id,
          hotelId: hotel.id,
          flight: bestFlight,
          hotel: {
            ...hotel,
            nights,
            totalPrice: hotelTotalPrice
          },
          price: packageTotalPrice,
          currency: 'BRL',
          guaranteed: true,
        });
      });

      // Se houver mais voos, podemos criar opções adicionais para dar variedade de escolha ao agente
      if (formattedFlights.length > 1) {
        const secondFlight = formattedFlights[1];
        hotels.slice(0, 1).forEach(hotel => {
          const hotelTotalPrice = hotel.dailyRate * nights;
          const packageTotalPrice = secondFlight.price + hotelTotalPrice;

          packages.push({
            id: `pkg-${secondFlight.id}-${hotel.id}`,
            flightId: secondFlight.id,
            hotelId: hotel.id,
            flight: secondFlight,
            hotel: {
              ...hotel,
              nights,
              totalPrice: hotelTotalPrice
            },
            price: packageTotalPrice,
            currency: 'BRL',
            guaranteed: true,
          });
        });
      }
    }

    // Ordena pacotes por preço
    packages.sort((a, b) => a.price - b.price);
    if (packages.length > 0) {
      packages[0].isCheapest = true;
    }

    return NextResponse.json({
      offerRequestId,
      nights,
      packages,
    });

  } catch (error) {
    console.error('SEARCH PACKAGES API ROUTE ERROR:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
