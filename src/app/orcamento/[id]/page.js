'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import '../../globals.css';

export default function OrcamentoCliente({ params }) {
  const searchParams = useSearchParams();
  const [seguroAdicionado, setSeguroAdicionado] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSlices, setExpandedSlices] = useState({});

  const toggleSliceExpand = (idx) => {
    setExpandedSlices(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    // 1. Tentar ler os dados da reserva a partir do Token Base64 na URL (Garante 100% de persistência no Vercel)
    const token = searchParams.get('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token));
        setBookingData(decoded);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Falha ao decodificar token da reserva:', err);
      }
    }

    // 2. Fallback: Buscar do servidor (localmente)
    const bookingId = params?.id;
    if (bookingId) {
      fetch(`/api/booking/${bookingId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setBookingData(data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [params, searchParams]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--primary-color)' }}>
          <h3>🔄 Carregando seu Orçamento Premium...</h3>
        </div>
      </div>
    );
  }

  // Se não encontrar dados reais da reserva, usa um mock refinado de alto nível
  const orcamento = bookingData || {
    id: params?.id || 'EURO-2938',
    localizer: 'EUR-884930',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    passengerDetails: [{ givenName: 'João', familyName: 'Silva', title: 'mr' }],
    flight: {
      airline: 'LATAM Airlines',
      airlineCode: 'LA',
      slices: [
        {
          origin: 'BSB',
          destination: 'MIA',
          depTime: '10:00',
          arrTime: '16:30',
          stopsText: 'Voo Direto',
          depDate: '15/07/2026',
        }
      ],
      totalAmount: 4200.00,
    },
    hotel: null
  };

  const hasHotel = !!orcamento.hotel;
  const flightPrice = parseFloat(orcamento.flight?.totalAmount || orcamento.flight?.price || 0);
  const hotelPrice = hasHotel ? parseFloat(orcamento.hotel.totalPrice || (orcamento.hotel.dailyRate * orcamento.hotel.nights) || 0) : 0;
  
  const seguroValor = 250.00;
  const valorTotal = flightPrice + hotelPrice + (seguroAdicionado ? seguroValor : 0);

  const handleImprimir = () => {
    window.print();
  };

  const getWhatsAppLink = () => {
    const text = `*Euro Tur Viagens* ✈️\n\nOlá, *${orcamento.passengerDetails[0]?.givenName || 'Cliente'}*!\n\nAqui está o seu *Orçamento de Viagem Oficial* para *${hasHotel ? orcamento.hotel.address.split(',')[1] || 'seu destino' : orcamento.flight.slices[0]?.destination || 'seu destino'}*.\n\n🔒 *Código Localizador (Hold GDS):* ${orcamento.localizer}\n💰 *Preço Promocional:* R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nVisualizar roteiro completo, fotos do hotel e franquia de bagagem no link abaixo:\n${window.location.href}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // Formata o prazo de expiração
  const getExpiresFormatted = (isoStr) => {
    if (!isoStr) return '24 horas';
    const date = new Date(isoStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + 'h';
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '700px', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}>
        
        {/* CABEÇALHO PREMIUM DA AGÊNCIA */}
        <header style={{ 
          background: 'linear-gradient(135deg, var(--primary-color) 0%, #002244 100%)', 
          color: '#fff', 
          padding: '40px 30px', 
          textAlign: 'center',
          borderBottom: '4px solid var(--accent-color)',
          position: 'relative'
        }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Euro Tur Viagens</h1>
          <p style={{ margin: '0 0 15px 0', opacity: 0.9, fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
            ORÇAMENTO DE VIAGEM OFICIAL
          </p>
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            Localizador Reserva (GDS): <span style={{ color: 'var(--accent-color)', fontWeight: '800' }}>{orcamento.localizer}</span>
          </div>
        </header>

        <div style={{ padding: '30px' }}>
          
          {/* AVISO DE HOLD EXCLUSIVO */}
          <div style={{ 
            backgroundColor: '#fffdf3', 
            color: '#856404', 
            padding: '16px 20px', 
            borderRadius: '8px', 
            marginBottom: '30px', 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px', 
            fontSize: '14px', 
            border: '1px solid #ffeeba' 
          }}>
            <span style={{ fontSize: '22px', marginTop: '-2px' }}>⏳</span>
            <div>
              <strong>Reserva Pré-Confirmada (Hold Tarifário):</strong><br />
              Prezados passageiros, o preço promocional desta tarifa foi reservado com sucesso no sistema da companhia aérea e está garantido até o dia <strong>{getExpiresFormatted(orcamento.expiresAt)}</strong>. Após esse prazo, os assentos serão liberados automaticamente sem ônus.
            </div>
          </div>

          {/* DADOS DOS PASSAGEIROS */}
          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '8px', margin: '0 0 15px 0', fontSize: '16px' }}>
              👤 Passageiros Vinculados
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {orcamento.passengerDetails?.map((passenger, idx) => (
                <div key={idx} style={{ backgroundColor: '#f8f9fa', padding: '10px 15px', borderRadius: '6px', fontSize: '14px' }}>
                  <strong>{passenger.title === 'mr' ? 'Sr.' : passenger.title === 'mrs' ? 'Sra.' : 'Passageiro'}:</strong> {passenger.givenName || passenger.given_name} {passenger.familyName || passenger.family_name}
                </div>
              ))}
            </div>
          </section>

          {/* DETALHAMENTO DO VOO GDS */}
          <section style={{ marginBottom: '35px' }}>
            <h3 style={{ color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '8px', margin: '0 0 15px 0', fontSize: '16px' }}>
              ✈️ Detalhes dos Voos Garantidos
            </h3>

            {orcamento.flight?.slices?.map((slice, sliceIdx) => (
              <div key={sliceIdx} style={{ marginBottom: '20px', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#f8f9fa', padding: '10px 15px', fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{sliceIdx === 0 ? '🛫 Voo de Ida' : '🛬 Voo de Volta'}</span>
                  <span style={{ color: 'var(--secondary-color)' }}>{orcamento.flight.airline}</span>
                </div>
                
                <div style={{ padding: '15px', fontSize: '14px', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', alignItems: 'center', textAlign: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--primary-color)' }}>
                      {slice.origin?.iata_code || slice.origin || 'ORIGEM'}
                    </h4>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{slice.depTime || slice.segments?.[0]?.depTime || '10:00'}</span>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {slice.stopsText || (slice.segments?.length > 1 ? `${slice.segments.length - 1} escalas` : 'Voo Direto')}
                    </div>
                    <div style={{ height: '2px', backgroundColor: '#ccc', position: 'relative', margin: '0 20px' }}>
                      <span style={{ position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '0 5px' }}>✈️</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--secondary-color)', marginTop: '4px' }}>
                      Duração: {slice.duration || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--primary-color)' }}>
                      {slice.destination?.iata_code || slice.destination || 'DESTINO'}
                    </h4>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{slice.arrTime || slice.segments?.[slice.segments.length - 1]?.arrTime || '16:30'}</span>
                  </div>
                </div>

                {slice.segments && slice.segments.length > 0 && (
                  <div style={{ borderTop: '1px dashed #ddd', padding: '0 15px 15px 15px', backgroundColor: '#fafafa' }}>
                    <button 
                      type="button"
                      onClick={() => toggleSliceExpand(sliceIdx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--secondary-color)',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 0',
                        width: '100%',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        outline: 'none'
                      }}
                    >
                      {expandedSlices[sliceIdx] ? '▲ Ocultar Conexões e Rastreamento' : '▼ Ver Voos, Conexões e Rastreamento'}
                    </button>
                    
                    {expandedSlices[sliceIdx] && (
                      <div style={{ display: 'grid', gap: '12px', marginTop: '5px', animation: 'fadeIn 0.2s ease-out' }}>
                        {slice.segments.map((seg, segIdx) => (
                          <div key={seg.id || segIdx} style={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e9ecef', 
                            borderRadius: '6px', 
                            padding: '12px 15px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            textAlign: 'left'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '13px' }}>
                              <span>✈️ Voo: {seg.airlineCode} {seg.flightNumber} ({seg.airline})</span>
                              {seg.trackingLink && (
                                <a 
                                  href={seg.trackingLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ color: 'var(--secondary-color)', fontSize: '12px', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '2px' }}
                                >
                                  🛰️ Rastrear
                                </a>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px', color: '#444' }}>
                              <div>
                                <strong>Origem:</strong> {seg.originCity || seg.origin} ({seg.origin})<br/>
                                📅 Partida: {seg.depDate} às {seg.depTime}
                              </div>
                              <div>
                                <strong>Destino:</strong> {seg.destinationCity || seg.destination} ({seg.destination})<br/>
                                📅 Chegada: {seg.arrDate} às {seg.arrTime}
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              gap: '12px', 
                              flexWrap: 'wrap', 
                              fontSize: '11.5px', 
                              color: 'var(--text-secondary)', 
                              borderTop: '1px dashed #eee', 
                              paddingTop: '6px', 
                              marginTop: '2px' 
                            }}>
                              <span>💼 {seg.baggageText || '1 mala de mão (10kg) inclusa'}</span>
                              {seg.cabin && <span>💺 Cabine: {seg.cabin}</span>}
                              {seg.aircraft && <span>✈️ Aeronave: {seg.aircraft}</span>}
                              {seg.fareBasisCode && <span>🏷️ Tarifa: {seg.fareBasisCode}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0 5px' }}>
              💼 <strong>Franquia de bagagem inclusa:</strong> 1 mala de mão de até 10kg por passageiro + item pessoal.
            </div>
          </section>

          {/* DETALHAMENTO DO HOTEL (SE FOR PACOTE) */}
          {hasHotel && (
            <section style={{ marginBottom: '35px' }}>
              <h3 style={{ color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '8px', margin: '0 0 15px 0', fontSize: '16px' }}>
                🏨 Hospedagem Premium Selecionada
              </h3>
              
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <img 
                  src={orcamento.hotel.image} 
                  alt={orcamento.hotel.name}
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                />
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '18px' }}>{orcamento.hotel.name}</h4>
                    <div style={{ color: 'var(--accent-color)' }}>
                      {'★'.repeat(orcamento.hotel.stars)}
                    </div>
                  </div>
                  <small style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    📍 {orcamento.hotel.address}
                  </small>
                  <p style={{ margin: '0 0 15px 0', fontSize: '13.5px', color: '#555', lineHeight: '1.5' }}>
                    {orcamento.hotel.description}
                  </p>
                  
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--primary-color)', display: 'block', marginBottom: '8px' }}>
                      Comodidades Inclusas no Quarto:
                    </strong>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {orcamento.hotel.amenities?.map((amenity, idx) => (
                        <span key={idx} style={{ fontSize: '12px', backgroundColor: '#f0f4f8', color: 'var(--secondary-color)', padding: '4px 10px', borderRadius: '4px', fontWeight: '600' }}>
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* UPSELL / SEGURO VIAGEM */}
          <section style={{ 
            border: '2px dashed var(--secondary-color)', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '35px', 
            backgroundColor: seguroAdicionado ? '#f4f9ff' : '#fff' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '15px' }}>
                🛡️ Recomendado: Adicionar Seguro Viagem Internacional
              </h4>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                + R$ {seguroValor.toFixed(2)}
              </div>
            </div>
            <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Garanta assistência médica integral, cobertura odontológica de urgência e indenização em caso de extravio de bagagens. Altamente recomendado para viagens internacionais!
            </p>
            <button 
              className={`btn ${seguroAdicionado ? 'btn-primary' : ''}`}
              onClick={() => setSeguroAdicionado(!seguroAdicionado)}
              style={{ 
                width: '100%', 
                border: '1px solid var(--primary-color)', 
                color: seguroAdicionado ? '#fff' : 'var(--primary-color)', 
                background: seguroAdicionado ? 'var(--primary-color)' : 'transparent',
                padding: '10px',
                fontSize: '13.5px'
              }}
            >
              {seguroAdicionado ? '✅ Seguro Viagem Adicionado' : 'Sim, Adicionar Seguro ao Orçamento'}
            </button>
          </section>

          {/* TOTAL DO INVESTIMENTO */}
          <div style={{ 
            backgroundColor: 'var(--primary-color)', 
            color: '#fff', 
            padding: '25px', 
            borderRadius: '8px', 
            textAlign: 'center', 
            marginBottom: '35px' 
          }}>
            <div style={{ opacity: 0.8, fontSize: '13px', letterSpacing: '0.5px', marginBottom: '5px' }}>
              VALOR TOTAL DO INVESTIMENTO:
            </div>
            <div style={{ fontSize: '34px', fontWeight: '800', color: 'var(--accent-color)' }}>
              R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ opacity: 0.8, fontSize: '11px', marginTop: '5px' }}>
              {(() => {
                const isOneWay = orcamento.flight?.slices?.length === 1;
                const flightTypeText = isOneWay ? 'Somente Ida' : 'Ida e Volta';
                return hasHotel 
                  ? `Passagem Aérea ${flightTypeText} + Hospedagem (${orcamento.hotel.nights} noites)` 
                  : `Passagem Aérea ${flightTypeText} em Classe Econômica`;
              })()}
            </div>
          </div>

          {/* BOTÕES DE AÇÃO DO AGENTE / CLIENTE */}
          <div className="btn-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary" 
              style={{ fontSize: '16px', padding: '16px', textDecoration: 'none', background: '#25D366' }}
            >
              💬 Compartilhar Orçamento no WhatsApp do Cliente
            </a>
            
            <button 
              onClick={handleImprimir} 
              className="btn" 
              style={{ background: '#e9ecef', color: '#495057', padding: '12px', fontSize: '15px' }}
            >
              📄 Imprimir ou Salvar como PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
