import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Arquivo local para salvar as reservas (funciona como banco de dados local)
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

    // --- LÓGICA DE EMISSÃO DE RESERVA (HOLD MULTIPROVEDOR) ---
    // Geramos um código localizador realístico (ex: EUR-123456)
    const localizer = `EUR-${Math.floor(100000 + Math.random() * 900000)}`;
    const timeLimit = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h a partir de agora

    // Construção rica de slices
    const slices = [];
    if (flightDetails && flightDetails.outbound) {
      slices.push({
        origin: flightDetails.outbound.segments?.[0]?.origin || searchParams.origin || 'BSB',
        destination: flightDetails.outbound.segments?.[flightDetails.outbound.segments.length - 1]?.destination || searchParams.destination || 'DUB',
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
        destination: flightDetails.inbound.segments?.[flightDetails.inbound.segments.length - 1]?.destination || searchParams.origin || 'BSB',
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

    // Estrutura unificada de reserva
    const newBooking = {
      id: `res_${Math.floor(100000 + Math.random() * 900000)}`,
      localizer,
      createdAt: new Date().toISOString(),
      expiresAt: timeLimit,
      status: 'hold',
      passengerDetails,
      hotel: hotelDetails,
      flight: {
        id: offerId,
        bookingReference: localizer,
        airline: flightDetails.airline || searchParams.airline || 'LATAM Airlines',
        airlineCode: flightDetails.airlineCode || searchParams.airlineCode || 'LA',
        slices,
        totalAmount: flightDetails.price || searchParams.price || 3450,
        totalCurrency: 'BRL',
      }
    };

    // Salvar reserva no banco de dados local (para persistência)
    saveBookingLocally(newBooking);

    // Retorna a reserva criada
    return NextResponse.json({
      success: true,
      booking: newBooking,
      // O token contém a reserva inteira em Base64 para persistência de fallback no cliente
      token: Buffer.from(JSON.stringify(newBooking)).toString('base64')
    });

  } catch (error) {
    console.error('BOOK API ROUTE ERROR:', error);
    return NextResponse.json({ error: 'Erro interno ao realizar reserva' }, { status: 500 });
  }
}
