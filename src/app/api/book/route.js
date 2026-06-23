import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Arquivo local para salvar as reservas (banco de dados de mock/redundância)
const getBookingsFilePath = () => {
  return path.join(process.cwd(), 'bookings.json');
};

const saveBookingLocally = (booking) => {
  try {
    const filePath = getBookingsFilePath();
    let bookings = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      bookings = JSON.parse(content || '[]');
    }
    bookings.push(booking);
    fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving booking locally:', error);
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      offerId, 
      passengerDetails, 
      hotelDetails = null,
      flightDetails = {},
      searchParams = {} 
    } = body;

    if (!offerId || !passengerDetails || passengerDetails.length === 0) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 });
    }

    const provider = flightDetails.provider || 'consolidadora';
    const isDuffel = provider === 'duffel';

    let localizer = '';
    let expiresAt = '';
    let isRealHold = false;
    let duffelErrorLog = null;

    // --- 1. CRIAÇÃO DE HOLD VIA DUFFEL API (CASO INTERNACIONAL) ---
    if (isDuffel) {
      const duffelToken = process.env.DUFFEL_ACCESS_TOKEN;
      if (duffelToken) {
        // Mapear dados dos passageiros aos IDs da Duffel
        const offerPassengers = flightDetails.passengers || [];
        const duffelPassengers = [];
        
        // Agrupar inputs de passageiros para pareamento por tipo
        const inputsByType = {
          adult: passengerDetails.filter(p => p.type === 'adult'),
          child: passengerDetails.filter(p => p.type === 'child' || p.type === 'infant')
        };
        const counters = { adult: 0, child: 0 };

        offerPassengers.forEach((offPax) => {
          const type = offPax.type === 'child' ? 'child' : 'adult';
          const list = inputsByType[type] || [];
          const index = counters[type];
          const input = list[index];

          if (input) {
            duffelPassengers.push({
              id: offPax.id,
              given_name: input.givenName,
              family_name: input.familyName,
              born_on: input.bornOn, // YYYY-MM-DD
              email: input.email || 'agencia@eurotur.com.br',
              phone_number: input.phoneNumber || '+5562999999999',
              title: input.title || 'mr',
              gender: input.gender || 'm'
            });
            counters[type]++;
          }
        });

        try {
          const duffelOrderBody = {
            data: {
              selected_offers: [offerId],
              passengers: duffelPassengers,
              type: 'hold'
            }
          };

          console.log('Sending hold creation request to Duffel API...');
          const duffelRes = await fetch('https://api.duffel.com/air/orders', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${duffelToken}`,
              'Duffel-Version': 'v2',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(duffelOrderBody)
          });

          if (duffelRes.ok) {
            const duffelOrderData = await duffelRes.json();
            const order = duffelOrderData.data || {};
            localizer = order.booking_reference || `DUF-${Math.floor(100000 + Math.random() * 900000)}`;
            expiresAt = order.payment_required_by || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            isRealHold = true;
            console.log('Successfully created hold order in Duffel API. Localizer:', localizer);
          } else {
            const errText = await duffelRes.text();
            duffelErrorLog = errText;
            console.warn('Duffel API hold creation failed. Activating local simulator fallback. Error details:', errText);
          }
        } catch (err) {
          duffelErrorLog = err.message;
          console.error('Error invoking Duffel orders API:', err);
        }
      }
    }

    // --- 2. FALLBACK REDUNDANTE (SE FALHAR A DUFFEL OU SE FOR CONSOLIDADORA NACIONAL) ---
    if (!localizer) {
      const prefix = isDuffel ? 'DUF' : 'ESF';
      localizer = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 horas de validade
    }

    // --- 3. CONSTRUTOR DE RESERVA UNIFICADA ---
    const slices = [];
    if (flightDetails && flightDetails.outbound) {
      slices.push({
        origin: flightDetails.outbound.segments?.[0]?.origin || searchParams.origin || 'BSB',
        destination: flightDetails.outbound.segments?.[(flightDetails.outbound.segments?.length || 1) - 1]?.destination || searchParams.destination || 'DUB',
        departureDate: flightDetails.outbound.depDate,
        arrivalDate: flightDetails.outbound.arrDate,
        stopsText: flightDetails.outbound.stopsText || 'Voo Direto',
        depTime: flightDetails.outbound.depTime || '10:00',
        arrTime: flightDetails.outbound.arrTime || '16:30',
        duration: flightDetails.outbound.duration || '6h 30m',
        segments: flightDetails.outbound.segments || []
      });
    }
    if (flightDetails && flightDetails.inbound) {
      slices.push({
        origin: flightDetails.inbound.segments?.[0]?.origin || searchParams.destination || 'DUB',
        destination: flightDetails.inbound.segments?.[(flightDetails.inbound.segments?.length || 1) - 1]?.destination || searchParams.origin || 'BSB',
        departureDate: flightDetails.inbound.depDate,
        arrivalDate: flightDetails.inbound.arrDate,
        stopsText: flightDetails.inbound.stopsText || 'Voo Direto',
        depTime: flightDetails.inbound.depTime || '10:00',
        arrTime: flightDetails.inbound.arrTime || '16:30',
        duration: flightDetails.inbound.duration || '6h 30m',
        segments: flightDetails.inbound.segments || []
      });
    }

    if (slices.length === 0) {
      slices.push({
        origin: searchParams.origin || 'BSB',
        destination: searchParams.destination || 'DUB',
        departureDate: searchParams.departureDate,
        arrivalDate: searchParams.departureDate,
        stopsText: searchParams.stopsText || 'Voo Direto',
        depTime: searchParams.depTime || '10:00',
        arrTime: searchParams.arrTime || '16:30',
        duration: searchParams.duration || '6h 30m',
        segments: []
      });
    }

    const newBooking = {
      id: `res_${Math.floor(100000 + Math.random() * 900000)}`,
      localizer,
      createdAt: new Date().toISOString(),
      expiresAt,
      status: 'hold',
      passengerDetails,
      hotel: hotelDetails,
      flight: {
        id: offerId,
        provider,
        bookingReference: localizer,
        airline: flightDetails.airline || searchParams.airline || 'LATAM Airlines',
        airlineCode: flightDetails.airlineCode || searchParams.airlineCode || 'LA',
        slices,
        totalAmount: flightDetails.price || searchParams.price || 3450, // Preço com markup aplicado
        totalCurrency: 'BRL',
        // Dados de cotação e markup salvos
        usdRate: flightDetails.usdRate || null,
        priceUSD: flightDetails.priceUSD || null,
        breakdown: flightDetails.breakdown || null,
        markupPercent: flightDetails.markupPercent || 0.10,
        isRealHold,
        duffelErrorLog
      }
    };

    // Salvar localmente
    saveBookingLocally(newBooking);

    // Retornar dados da reserva
    return NextResponse.json({
      success: true,
      booking: newBooking,
      token: Buffer.from(JSON.stringify(newBooking)).toString('base64')
    });

  } catch (error) {
    console.error('BOOK API ROUTE ERROR:', error);
    return NextResponse.json({ error: 'Erro interno ao realizar reserva' }, { status: 500 });
  }
}
