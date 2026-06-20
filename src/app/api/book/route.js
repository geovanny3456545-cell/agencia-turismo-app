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
      searchParams = {} 
    } = body;

    if (!offerId || !passengerDetails || passengerDetails.length === 0) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 });
    }

    // --- LÓGICA DE EMISSÃO DE RESERVA (HOLD MULTIPROVEDOR) ---
    // Geramos um código localizador realístico (ex: EUR-123456)
    const localizer = `EUR-${Math.floor(100000 + Math.random() * 900000)}`;
    const timeLimit = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h a partir de agora

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
        airline: searchParams.airline || 'LATAM Airlines',
        airlineCode: searchParams.airlineCode || 'LA',
        slices: [
          {
            origin: searchParams.origin || 'BSB',
            destination: searchParams.destination || 'DUB',
            departureDate: searchParams.departureDate,
            arrivalDate: searchParams.departureDate,
            stopsText: searchParams.stopsText || 'Voo Direto',
            depTime: searchParams.depTime || '10:00',
            arrTime: searchParams.arrTime || '16:30',
            duration: searchParams.duration || '6h 30m',
          }
        ],
        totalAmount: searchParams.price || 3450,
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
