'use client';
import { useState, useEffect, useRef } from 'react';
import './globals.css';

const POPULAR_AIRPORTS = [
  { iata_code: 'VCP', name: 'Viracopos International', city: { name: 'Campinas / SP' }, type: 'airport', id: 'pop-vcp' },
  { iata_code: 'GRU', name: 'Guarulhos International', city: { name: 'São Paulo / SP' }, type: 'airport', id: 'pop-gru' },
  { iata_code: 'BSB', name: 'Brasília International', city: { name: 'Brasília / DF' }, type: 'airport', id: 'pop-bsb' },
  { iata_code: 'GIG', name: 'Galeão International', city: { name: 'Rio de Janeiro / RJ' }, type: 'airport', id: 'pop-gig' },
  { iata_code: 'MIA', name: 'Miami International', city: { name: 'Miami (EUA)' }, type: 'airport', id: 'pop-mia' },
  { iata_code: 'MCO', name: 'Orlando International', city: { name: 'Orlando (EUA)' }, type: 'airport', id: 'pop-mco' },
  { iata_code: 'LIS', name: 'Humberto Delgado', city: { name: 'Lisboa (Portugal)' }, type: 'airport', id: 'pop-lis' },
  { iata_code: 'CDG', name: 'Charles de Gaulle', city: { name: 'Paris (França)' }, type: 'airport', id: 'pop-cdg' },
];

export default function Dashboard() {
  const [searchType, setSearchType] = useState('aereo'); // 'aereo' ou 'pacote'
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // Estados do formulário
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState([]);
  
  // Autocomplete
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showOriginSug, setShowOriginSug] = useState(false);
  const [showDestSug, setShowDestSug] = useState(false);
  const originRef = useRef(null);
  const destRef = useRef(null);

  // Modal de Reserva
  const [selectedItem, setSelectedItem] = useState(null); // Voo ou Pacote selecionado
  const [showBookModal, setShowBookModal] = useState(false);
  const [passengersData, setPassengersData] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (originRef.current && !originRef.current.contains(event.target)) {
        setShowOriginSug(false);
      }
      if (destRef.current && !destRef.current.contains(event.target)) {
        setShowDestSug(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce Autocomplete para Origem
  useEffect(() => {
    if (origin.trim().length < 2) {
      setOriginSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?query=${encodeURIComponent(origin)}`);
        if (res.ok) {
          const data = await res.json();
          setOriginSuggestions(data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [origin]);

  // Debounce Autocomplete para Destino
  useEffect(() => {
    if (destination.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?query=${encodeURIComponent(destination)}`);
        if (res.ok) {
          const data = await res.json();
          setDestSuggestions(data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [destination]);

  // Sincronizar idades de crianças
  const handleChildrenChange = (val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setChildren(num);
    const ages = [...childAges];
    if (ages.length < num) {
      for (let i = ages.length; i < num; i++) {
        ages.push(8); // idade padrão de 8 anos
      }
    } else if (ages.length > num) {
      ages.splice(num);
    }
    setChildAges(ages);
  };

  const handleChildAgeChange = (index, age) => {
    const ages = [...childAges];
    ages[index] = parseInt(age) || 0;
    setChildAges(ages);
  };

  // Buscar Voos ou Pacotes
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    const endpoint = searchType === 'pacote' ? '/api/search-packages' : '/api/search-flights';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departureDate,
          returnDate: returnDate || null,
          adults,
          children
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        alert('Erro ao realizar a busca nas APIs. Por favor, verifique as datas e tente novamente.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao buscar voos.');
    } finally {
      setLoading(false);
    }
  };

  // Abrir Modal de Reserva
  const handleOpenBookModal = (item) => {
    setSelectedItem(item);
    
    // Preparar campos de passageiros (Adultos + Crianças)
    const list = [];
    // Adultos
    for (let i = 0; i < adults; i++) {
      list.push({ type: 'adult', title: 'mr', givenName: '', familyName: '', bornOn: '', email: '', phoneNumber: '', gender: 'm' });
    }
    // Crianças
    for (let i = 0; i < children; i++) {
      list.push({ type: 'child', title: 'miss', givenName: '', familyName: '', bornOn: '', email: 'agencia@eurotur.com.br', phoneNumber: '', gender: 'f' });
    }
    setPassengersData(list);
    setShowBookModal(true);
  };

  // Confirmar Reserva (Hold)
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    const isPackage = searchType === 'pacote';
    const offerId = isPackage ? selectedItem.flight.id : selectedItem.id;
    const hotelDetails = isPackage ? selectedItem.hotel : null;

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId,
          passengerDetails: passengersData,
          hotelDetails,
          searchParams: {
            origin,
            destination,
            departureDate,
            returnDate,
            price: selectedItem.price,
            airline: isPackage ? selectedItem.flight.airline : selectedItem.airline,
            airlineCode: isPackage ? selectedItem.flight.airlineCode : selectedItem.airlineCode,
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Redirecionar para o orçamento passando o token base64 para persistência instantânea no client
        window.location.href = `/orcamento/${data.booking.id}?token=${data.token}`;
      } else {
        alert('Erro ao confirmar a reserva de testes no GDS. Tentando novamente...');
      }
    } catch (err) {
      console.error(err);
      alert('Erro na requisição da reserva.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Helper para nome amigável dos aeroportos
  const getWeekdayName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  };

  // Condicionais de Autocomplete
  const showOriginPopular = showOriginSug && origin.trim().length < 2;
  const showOriginRealSug = showOriginSug && origin.trim().length >= 2 && originSuggestions.length > 0;
  
  const showDestPopular = showDestSug && destination.trim().length < 2;
  const showDestRealSug = showDestSug && destination.trim().length >= 2 && destSuggestions.length > 0;

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      
      {/* HEADER PREMIUM */}
      <header style={{ 
        padding: '24px 0', 
        borderBottom: '3px solid var(--accent-color)', 
        marginBottom: '40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '32px' }}>✈️</span>
          <div>
            <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Euro Tur <span style={{ color: 'var(--accent-color)' }}>Viagens</span>
            </h1>
            <small style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>ANÁPOLIS / GO - SISTEMA GDS PROFISSIONAL</small>
          </div>
        </div>
        <div style={{ 
          background: 'rgba(0,51,102,0.06)', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '14px', 
          fontWeight: 'bold', 
          color: 'var(--primary-color)', 
          border: '1px solid rgba(0,51,102,0.1)' 
        }}>
          👤 Agente Eurotur: <span style={{color: 'var(--secondary-color)'}}>Ativo</span>
        </div>
      </header>

      {/* PAINEL DE BUSCA */}
      <div className="card" style={{ 
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
        border: '1px solid rgba(0,0,0,0.05)', 
        marginBottom: '35px',
        padding: '30px'
      }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary-color)', fontSize: '22px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🔍</span> Painel de Emissões e Pacotes Holísticos
        </h2>
        
        {/* Alternador de Busca com micro-animações */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
          <button 
            type="button"
            className="btn"
            onClick={() => { setSearchType('aereo'); setResults(null); }}
            style={{ 
              flex: 1,
              height: '50px',
              border: searchType === 'aereo' ? 'none' : '2px solid rgba(0, 51, 102, 0.2)', 
              color: searchType === 'aereo' ? '#fff' : 'var(--primary-color)', 
              background: searchType === 'aereo' ? 'var(--primary-color)' : 'transparent',
              fontSize: '15px'
            }}
          >
            ✈️ Somente Voos GDS
          </button>
          <button 
            type="button"
            className="btn"
            onClick={() => { setSearchType('pacote'); setResults(null); }}
            style={{ 
              flex: 1,
              height: '50px',
              border: searchType === 'pacote' ? 'none' : '2px solid rgba(0, 51, 102, 0.2)', 
              color: searchType === 'pacote' ? '#fff' : 'var(--primary-color)', 
              background: searchType === 'pacote' ? 'var(--primary-color)' : 'transparent',
              fontSize: '15px'
            }}
          >
            🏨 Pacote Completo (Voo + Terrestre)
          </button>
        </div>

        <form onSubmit={handleSearch}>
          
          {/* CAMPOS DE ORIGEM E DESTINO COM AUTOCOMPLETE REAL GDS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', position: 'relative' }}>
            
            {/* ORIGEM */}
            <div ref={originRef} style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                🛫 Aeroporto Origem
              </label>
              <input 
                type="text" 
                placeholder="Clique ou digite o aeroporto de origem (ex: Viracopos, GRU)..." 
                value={origin}
                onChange={(e) => { setOrigin(e.target.value); setShowOriginSug(true); }}
                onFocus={() => setShowOriginSug(true)}
                required 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }} 
              />
              
              {/* Sugestões Populares - Exibidas ao focar ou com menos de 2 caracteres */}
              {showOriginPopular && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  marginTop: '4px'
                }}>
                  <div style={{ padding: '8px 12px', background: '#f5f5f5', fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
                    🌟 Aeroportos Frequentes (Euro Tur)
                  </div>
                  {POPULAR_AIRPORTS.map((place) => (
                    <div 
                      key={place.id}
                      onMouseDown={() => {
                        setOrigin(`${place.iata_code} - ${place.name} (${place.city.name})`);
                        setShowOriginSug(false);
                      }}
                      className="suggestion-item"
                    >
                      <strong>{place.iata_code}</strong> - {place.name} ({place.city.name})
                      <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px', float: 'right', fontWeight: 'bold' }}>
                        ✓ Frequente
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sugestões Reais da Duffel - Ao digitar 2+ caracteres */}
              {showOriginRealSug && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  marginTop: '4px'
                }}>
                  {originSuggestions.map((place) => {
                    const cityName = place.city?.name || place.city_name || '';
                    const formattedValue = `${place.iata_code} - ${place.name}${cityName ? ` (${cityName})` : ''}`;
                    return (
                      <div 
                        key={place.id}
                        onMouseDown={() => {
                          setOrigin(formattedValue);
                          setShowOriginSug(false);
                        }}
                        className="suggestion-item"
                      >
                        <strong>{place.iata_code}</strong> - {place.name} ({cityName || 'Global'})
                        <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px', float: 'right', fontWeight: 'bold' }}>
                          {place.type === 'airport' ? '✈️ Aeroporto' : '🏙️ Cidade'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DESTINO */}
            <div ref={destRef} style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                🛬 Aeroporto Destino
              </label>
              <input 
                type="text" 
                placeholder="Clique ou digite o aeroporto de destino (ex: Miami, MCO)..." 
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setShowDestSug(true); }}
                onFocus={() => setShowDestSug(true)}
                required 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }} 
              />
              
              {/* Sugestões Populares - Exibidas ao focar ou com menos de 2 caracteres */}
              {showDestPopular && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  marginTop: '4px'
                }}>
                  <div style={{ padding: '8px 12px', background: '#f5f5f5', fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
                    🌟 Aeroportos Frequentes (Euro Tur)
                  </div>
                  {POPULAR_AIRPORTS.map((place) => (
                    <div 
                      key={place.id}
                      onMouseDown={() => {
                        setDestination(`${place.iata_code} - ${place.name} (${place.city.name})`);
                        setShowDestSug(false);
                      }}
                      className="suggestion-item"
                    >
                      <strong>{place.iata_code}</strong> - {place.name} ({place.city.name})
                      <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px', float: 'right', fontWeight: 'bold' }}>
                        ✓ Frequente
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sugestões Reais da Duffel - Ao digitar 2+ caracteres */}
              {showDestRealSug && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  marginTop: '4px'
                }}>
                  {destSuggestions.map((place) => {
                    const cityName = place.city?.name || place.city_name || '';
                    const formattedValue = `${place.iata_code} - ${place.name}${cityName ? ` (${cityName})` : ''}`;
                    return (
                      <div 
                        key={place.id}
                        onMouseDown={() => {
                          setDestination(formattedValue);
                          setShowDestSug(false);
                        }}
                        className="suggestion-item"
                      >
                        <strong>{place.iata_code}</strong> - {place.name} ({cityName || 'Global'})
                        <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px', float: 'right', fontWeight: 'bold' }}>
                          {place.type === 'airport' ? '✈️ Aeroporto' : '🏙️ Cidade'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* DATAS COM CALENDÁRIO COMPLETO */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                📅 Data de Ida {departureDate && <span style={{color: 'var(--secondary-color)', fontSize: '12px'}}>({getWeekdayName(departureDate)})</span>}
              </label>
              <input 
                type="date" 
                required 
                value={departureDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDepartureDate(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                📅 Data de Volta (Obrigatório) {returnDate && <span style={{color: 'var(--secondary-color)', fontSize: '12px'}}>({getWeekdayName(returnDate)})</span>}
              </label>
              <input 
                type="date" 
                required
                value={returnDate}
                min={departureDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setReturnDate(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }} 
              />
            </div>
          </div>

          {/* PASSAGEIROS E REGRAS DE CRIANÇAS */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #e9ecef', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '30px' 
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: 'var(--primary-color)' }}>👥 Configuração de Passageiros</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px' }}>Adultos (+12 anos)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="9"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px' }}>Crianças (0 a 11 anos)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="9"
                  value={children}
                  onChange={(e) => handleChildrenChange(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>
            </div>

            {/* Configuração de idades e Regras Específicas de Crianças */}
            {children > 0 && (
              <div style={{ 
                border: '1px solid #ffeeba', 
                backgroundColor: '#fffdf5', 
                borderRadius: '6px', 
                padding: '15px',
                marginTop: '15px'
              }}>
                <strong style={{ display: 'block', color: '#856404', fontSize: '13px', marginBottom: '10px' }}>
                  ⚠️ Regras Tarifárias Aplicadas (GDS):
                </strong>
                <div style={{ fontSize: '12.5px', color: '#666', lineHeight: '1.5', display: 'grid', gap: '8px' }}>
                  <div>
                    👶 <strong>Bebê de Colo (0 a 1 ano):</strong> Isento de tarifa cheia na maioria das rotas aéreas se viajar no colo de um adulto.
                  </div>
                  <div>
                    🧒 <strong>Criança (2 a 11 anos):</strong> Desconto automático aplicado no GDS entre <strong>10% a 25%</strong> sobre a tarifa base do adulto.
                  </div>
                </div>

                <div style={{ marginTop: '15px', borderTop: '1px solid #fbf0c8', paddingTop: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
                    Indique a idade de cada criança para cálculo de descontos:
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {childAges.map((age, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px' }}>Criança {idx + 1}:</span>
                        <select 
                          value={age} 
                          onChange={(e) => handleChildAgeChange(idx, e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="0">0 anos (Bebê)</option>
                          <option value="1">1 ano (Bebê)</option>
                          <option value="2">2 anos</option>
                          <option value="3">3 anos</option>
                          <option value="4">4 anos</option>
                          <option value="5">5 anos</option>
                          <option value="6">6 anos</option>
                          <option value="7">7 anos</option>
                          <option value="8">8 anos</option>
                          <option value="9">9 anos</option>
                          <option value="10">10 anos</option>
                          <option value="11">11 anos</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '54px', fontSize: '17px', borderRadius: '6px' }}>
            ⚡ Iniciar Consulta Holística em Tempo Real (Duffel GDS)
          </button>
        </form>
      </div>

      {/* CARREGAMENTO */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--primary-color)' }}>
          <div className="spinner" style={{
            border: '4px solid rgba(0,0,0,0.1)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            borderLeftColor: 'var(--primary-color)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <h3 style={{ margin: '0 0 8px 0' }}>🔄 Acionando GDS e Redundância Antigolpe...</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '14px' }}>
            Consultando malha aérea internacional e hotéis locais na Duffel. Verificando assentos e tarifas garantidas sem intermediários.
          </p>
        </div>
      )}

      {/* RESULTADOS DA BUSCA */}
      {results && !loading && (
        <div>
          {/* Matriz de Flexibilidade / Economia */}
          <div className="card" style={{ marginBottom: '30px', background: 'linear-gradient(135deg, #eef2f6 0%, #dfe7f0 100%)', border: '1px solid rgba(0,51,102,0.1)' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <span>📅</span> Matriz Inteligente de Flexibilidade de Datas (Eurotur GDS)
            </h3>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between' }}>
              <div style={{ padding: '12px', background: '#fff', borderRadius: '6px', textAlign: 'center', flex: 1, boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>1 Dia Antes</span><br/>
                <strong style={{ color: 'var(--success)' }}>- R$ 180,00</strong>
              </div>
              <div style={{ padding: '12px', background: 'var(--primary-color)', color: '#fff', borderRadius: '6px', textAlign: 'center', flex: 1, boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Datas Selecionadas</span><br/>
                <strong>Tarifa Base</strong>
              </div>
              <div style={{ padding: '12px', background: '#fff', borderRadius: '6px', textAlign: 'center', flex: 1, boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>1 Dia Depois</span><br/>
                <strong style={{ color: 'var(--success)' }}>- R$ 90,00</strong>
              </div>
            </div>
          </div>

          <h2 style={{ color: 'var(--primary-color)', fontSize: '22px', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
            Resultados Oficiais Encontrados {searchType === 'pacote' ? '(Aéreo + Hotel Premium)' : '(Aéreo Real)'}
          </h2>

          <div style={{ display: 'grid', gap: '20px' }}>
            
            {/* SE FOR SÓ AÉREO */}
            {searchType === 'aereo' && results.offers?.map((offer) => (
              <div 
                key={offer.id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '24px',
                  border: offer.isCheapest ? '2px solid var(--success)' : '1px solid #e0e0e0',
                  position: 'relative'
                }}
              >
                {offer.isCheapest && (
                  <span style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '20px',
                    backgroundColor: 'var(--success)',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    🏷️ Melhor Preço da Busca
                  </span>
                )}

                <div style={{ flex: 1 }}>
                  {/* Informações da Ida */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'var(--primary-color)', 
                      color: 'white', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}>
                      {offer.airlineCode}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{offer.airline}</h4>
                      <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                        <span>🛫 Ida: <strong>{offer.outbound.depTime} ({offer.outbound.depDate})</strong></span>
                        <span>🛬 Chegada: {offer.outbound.arrTime}</span>
                        <span>⏳ Duração: {offer.outbound.duration}</span>
                        <span style={{ color: offer.outbound.stopsCount === 0 ? 'var(--success)' : 'var(--secondary-color)', fontWeight: 'bold' }}>
                          • {offer.outbound.stopsText} {offer.outbound.connections && `(${offer.outbound.connections})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informações da Volta */}
                  {offer.inbound && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderTop: '1px dashed #eee', paddingTop: '15px' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: '#555', 
                        color: 'white', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}>
                        {offer.airlineCode}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{offer.airline}</h4>
                        <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                          <span>🛫 Volta: <strong>{offer.inbound.depTime} ({offer.inbound.depDate})</strong></span>
                          <span>🛬 Chegada: {offer.inbound.arrTime}</span>
                          <span>⏳ Duração: {offer.inbound.duration}</span>
                          <span style={{ color: offer.inbound.stopsCount === 0 ? 'var(--success)' : 'var(--secondary-color)', fontWeight: 'bold' }}>
                            • {offer.inbound.stopsText} {offer.inbound.connections && `(${offer.inbound.connections})`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <span style={{ fontSize: '12px', backgroundColor: '#eef2f6', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '4px', fontWeight: '600' }}>
                      💼 Bagagem de mão inclusa (10kg)
                    </span>
                    <span style={{ fontSize: '12px', backgroundColor: '#eef2f6', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '4px', fontWeight: '600' }}>
                      ⚡ Emissão Instantânea
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginLeft: '30px', borderLeft: '1px solid #eee', paddingLeft: '30px', minWidth: '180px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Preço Total {adults} ADT {children > 0 && `+ ${children} CHD`}:</span>
                  <h2 style={{ margin: '5px 0 15px 0', color: 'var(--primary-color)', fontSize: '28px', fontWeight: '800' }}>
                    {offer.currency === 'BRL' ? 'R$' : offer.currency} {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h2>
                  <button 
                    onClick={() => handleOpenBookModal(offer)}
                    className="btn btn-accent" 
                    style={{ width: '100%', padding: '12px 20px', fontSize: '15px', fontWeight: 'bold' }}
                  >
                    Emitir Hold
                  </button>
                </div>
              </div>
            ))}

            {/* SE FOR PACOTE (VOO + HOTEL REAL) */}
            {searchType === 'pacote' && results.packages?.map((pkg) => (
              <div 
                key={pkg.id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '25px',
                  border: pkg.isCheapest ? '2px solid var(--success)' : '1px solid #e0e0e0',
                  position: 'relative',
                  gap: '20px'
                }}
              >
                {pkg.isCheapest && (
                  <span style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '20px',
                    backgroundColor: 'var(--success)',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    🏷️ Melhor Preço de Pacote
                  </span>
                )}

                {/* Bloco Superior: Hotel Real */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <img 
                    src={pkg.hotel.image} 
                    alt={pkg.hotel.name}
                    style={{ width: '180px', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '19px' }}>{pkg.hotel.name}</h3>
                      <div style={{ color: 'var(--accent-color)', fontSize: '14px' }}>
                        {'★'.repeat(pkg.hotel.stars)}
                      </div>
                    </div>
                    <small style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      📍 {pkg.hotel.address}
                    </small>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#555', lineHeight: '1.4' }}>
                      {pkg.hotel.description}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {pkg.hotel.amenities.map((amenity, idx) => (
                        <span key={idx} style={{ fontSize: '11.5px', backgroundColor: '#eef2f6', color: 'var(--primary-color)', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bloco Central: Voo Real Acoplado */}
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '6px', 
                  padding: '15px 20px', 
                  borderLeft: '4px solid var(--secondary-color)'
                }}>
                  <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--primary-color)', marginBottom: '10px' }}>
                    ✈️ Voo Real Duffel Acoplado ao Pacote:
                  </strong>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', gap: '20px' }}>
                    <div>
                      <strong>Ida:</strong> {pkg.flight.airline} • {pkg.flight.outbound.depTime} ({pkg.flight.outbound.depDate}) → {pkg.flight.outbound.arrTime} • {pkg.flight.outbound.stopsText}
                    </div>
                    {pkg.flight.inbound && (
                      <div>
                        <strong>Volta:</strong> {pkg.flight.airline} • {pkg.flight.inbound.depTime} ({pkg.flight.inbound.depDate}) → {pkg.flight.inbound.arrTime} • {pkg.flight.inbound.stopsText}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bloco Inferior: Preço e Detalhamento da Compra */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderTop: '1px solid #eee', 
                  paddingTop: '20px',
                  marginTop: '5px'
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    💵 Inclui: Passagem ida/volta ({adults} ADT {children > 0 && `+ ${children} CHD`}) + Hospedagem por <strong>{pkg.hotel.nights} noites</strong>.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <div style={{ textHeading: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Investimento do Pacote Completo:</span>
                      <h2 style={{ margin: '3px 0 0 0', color: 'var(--primary-color)', fontSize: '26px', fontWeight: '800' }}>
                        R$ {pkg.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h2>
                    </div>
                    <button 
                      onClick={() => handleOpenBookModal(pkg)}
                      className="btn btn-accent" 
                      style={{ padding: '14px 28px', fontSize: '15px', fontWeight: 'bold' }}
                    >
                      Reservar Pacote
                    </button>
                  </div>
                </div>

              </div>
            ))}

          </div>
        </div>
      )}

      {/* MODAL DE RESERVA DIRETA (HOLD) */}
      {showBookModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Header do Modal */}
            <header style={{
              backgroundColor: 'var(--primary-color)',
              color: '#fff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>
                ✍️ Emitir Reserva (Hold Garantido no GDS)
              </h3>
              <button 
                onClick={() => setShowBookModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleConfirmBooking} style={{ padding: '24px' }}>
              <div style={{ 
                backgroundColor: '#fff3cd', 
                color: '#856404', 
                padding: '12px 15px', 
                borderRadius: '6px', 
                fontSize: '13px', 
                marginBottom: '20px',
                border: '1px solid #ffeeba'
              }}>
                ⏳ <strong>Hold de Teste:</strong> A reserva será criada com status <strong>HOLD</strong> no ambiente da Duffel. Você terá até 24 horas para confirmar e pagar antes do cancelamento automático. Sem custos.
              </div>

              {/* Formulários dinâmicos de Passageiros */}
              <div style={{ display: 'grid', gap: '25px', marginBottom: '25px' }}>
                {passengersData.map((passenger, index) => (
                  <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
                    <strong style={{ display: 'block', marginBottom: '12px', color: 'var(--primary-color)', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                      👤 {passenger.type === 'adult' ? `Passageiro ${index + 1} (Adulto)` : `Passageiro ${index + 1} (Criança)`}
                    </strong>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Tratamento</label>
                        <select 
                          required
                          value={passenger.title}
                          onChange={(e) => {
                            const clone = [...passengersData];
                            clone[index].title = e.target.value;
                            setPassengersData(clone);
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="mr">Sr.</option>
                          <option value="mrs">Sra.</option>
                          <option value="ms">Srta.</option>
                          <option value="miss">Criança (F)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Primeiro Nome</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: João"
                          value={passenger.givenName}
                          onChange={(e) => {
                            const clone = [...passengersData];
                            clone[index].givenName = e.target.value;
                            setPassengersData(clone);
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Último Sobrenome</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Silva"
                          value={passenger.familyName}
                          onChange={(e) => {
                            const clone = [...passengersData];
                            clone[index].familyName = e.target.value;
                            setPassengersData(clone);
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Data Nasc.</label>
                        <input 
                          type="date" 
                          required
                          value={passenger.bornOn}
                          onChange={(e) => {
                            const clone = [...passengersData];
                            clone[index].bornOn = e.target.value;
                            setPassengersData(clone);
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Gênero</label>
                        <select 
                          required
                          value={passenger.gender}
                          onChange={(e) => {
                            const clone = [...passengersData];
                            clone[index].gender = e.target.value;
                            setPassengersData(clone);
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="m">Masculino</option>
                          <option value="f">Feminino</option>
                        </select>
                      </div>
                    </div>

                    {passenger.type === 'adult' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>E-mail de Contato</label>
                          <input 
                            type="email" 
                            required
                            placeholder="exemplo@gmail.com"
                            value={passenger.email}
                            onChange={(e) => {
                              const clone = [...passengersData];
                              clone[index].email = e.target.value;
                              setPassengersData(clone);
                            }}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>WhatsApp / Tel.</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="Ex: +5562999999999"
                            value={passenger.phoneNumber}
                            onChange={(e) => {
                              const clone = [...passengersData];
                              clone[index].phoneNumber = e.target.value;
                              setPassengersData(clone);
                            }}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Botão de Envio do Modal */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowBookModal(false)}
                  style={{ padding: '10px 20px', background: '#eee', color: '#555', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={bookingLoading}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontWeight: 'bold' }}
                >
                  {bookingLoading ? '⏳ Criando Hold GDS...' : '✓ Confirmar e Gerar Orçamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESTILOS INTERNOS */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .suggestion-item {
          padding: 12px 15px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          transition: background 0.2s;
          display: block;
          color: #1a1a1a;
          text-align: left;
        }
        .suggestion-item:hover {
          background-color: #f0f5fa !important;
        }
      `}</style>

    </div>
  );
}
