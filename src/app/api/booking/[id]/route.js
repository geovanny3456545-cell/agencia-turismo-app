import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams?.id;

    if (!bookingId) {
      return NextResponse.json({ error: 'ID da reserva ausente' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'bookings.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const bookings = JSON.parse(content || '[]');
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        return NextResponse.json(booking);
      }
    }

    return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar reserva' }, { status: 500 });
  }
}
