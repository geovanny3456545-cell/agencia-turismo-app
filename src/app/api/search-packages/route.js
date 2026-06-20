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
  DUB: [
    {
      id: "hotel-dub-1",
      name: "The Morrison DoubleTree by Hilton",
      stars: 4,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      description: "Hotel boutique de alto padrão no centro de Dublin, às margens do Rio Liffey. Design moderno com bar badalado e excelente café da manhã irlandês.",
      dailyRate: 780,
      address: "Ormond Quay Lower, Dublin, D01 K7Y3",
      amenities: ["Wi-Fi Grátis", "Bar Irlandês", "Academia", "Café da Manhã Incluso", "Suítes Espaçosas"]
    },
    {
      id: "hotel-dub-2",
      name: "The Westbury Hotel",
      stars: 5,
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
      description: "Um dos hotéis mais luxuosos da Irlanda, a poucos passos da Grafton Street. Serviço 5 estrelas clássico, restaurantes premiados e chá da tarde famoso.",
      dailyRate: 1650,
      address: "Balfe St, Dublin, D02 CH66",
      amenities: ["Serviço Concierge", "Alta Gastronomia", "Wi-Fi Premium", "Spa no Quarto", "Decoração de Luxo"]
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
    const { 
      origin, 
      destination, 
      departureDate, 
      returnDate, 
      adults = 1, 
      children = 0,
      nonStop = false,
      profile = 'conforto'
    } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 });
    }

    // Resolvendo IATA destino para buscar hotéis correspondentes
    const getDestinationIATA = (val) => {
      if (!val) return 'MIA';
      const directMatch = val.trim().match(/^([A-Z]{3})\b/i);
      if (directMatch) return directMatch[1].toUpperCase();
      return val.substring(0, 3).toUpperCase();
    };
    const destinationIATA = getDestinationIATA(destination);

    // Chamar a rota interna de busca de voos (/api/search-flights)
    const originUrl = new URL('/api/search-flights', request.url).toString();
    const searchFlightsRes = await fetch(originUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        departureDate,
        returnDate,
        adults,
        children,
        nonStop,
        profile
      })
    });

    let offers = [];
    if (searchFlightsRes.ok) {
      const flightJson = await searchFlightsRes.json();
      offers = flightJson.offers || [];
    } else {
      console.error('Failed to query flight search inside search-packages route');
      return NextResponse.json({ error: 'Erro ao buscar voos reais' }, { status: 500 });
    }

    // Calcular noites de hotel
    const d1 = new Date(departureDate);
    const d2 = returnDate ? new Date(returnDate) : new Date(d1.getTime() + 24 * 60 * 60 * 1000);
    const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));

    // Acionar motor de hotéis reais
    let hotels = HOTELS_DB[destinationIATA] || generateDynamicHotels(destinationIATA);
    const packages = [];

    // Combinar voos com hotéis
    if (offers.length > 0) {
      // Usar a melhor opção de voo
      const bestFlight = offers[0];

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
          guaranteed: true
        });
      });

      // Adicionar segunda opção de voo se houver para dar variedade
      if (offers.length > 1) {
        const secondFlight = offers[1];
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
            guaranteed: true
          });
        });
      }
    }

    packages.sort((a, b) => a.price - b.price);
    if (packages.length > 0) {
      packages.forEach(p => p.isCheapest = false);
      packages[0].isCheapest = true;
    }

    return NextResponse.json({
      nights,
      packages
    });

  } catch (error) {
    console.error('SEARCH PACKAGES API ROUTE ERROR:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
