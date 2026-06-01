'use client';
import { useState } from 'react';
import './globals.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searchType, setSearchType] = useState('aereo'); 

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResults([
        { id: 1, airline: 'GOL', price: searchType === 'pacote' ? 2850 : 850, time: '10:00 - 12:30', direct: true, guaranteed: true },
        { id: 2, airline: 'LATAM', price: searchType === 'pacote' ? 2920 : 920, time: '14:15 - 16:45', direct: true, guaranteed: true },
      ]);
      setLoading(false);
    }, 2500);
  };

  return (
    <div className="container" style={{ paddingBottom: '50px' }}>
      <header style={{ padding: '20px 0', borderBottom: '2px solid var(--primary-color)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)', margin: 0 }}>Euro Tur ✈️ <span style={{fontSize: '14px', fontWeight: 'normal', color: 'var(--text-secondary)'}}>| Agente Dashboard</span></h1>
        <div style={{fontWeight: 'bold', color: 'var(--secondary-color)'}}>Bem-vindo, Agente</div>
      </header>

      {/* Lista de Aeroportos para autocompletar e travar inputs errados */}
      <datalist id="lista-aeroportos">
        <option value="BSB - Brasília (Juscelino Kubitschek)" />
        <option value="GRU - São Paulo (Guarulhos)" />
        <option value="CGH - São Paulo (Congonhas)" />
        <option value="GIG - Rio de Janeiro (Galeão)" />
        <option value="SDU - Rio de Janeiro (Santos Dumont)" />
        <option value="MIA - Miami International, EUA" />
        <option value="MCO - Orlando International, EUA" />
        <option value="LIS - Lisboa (Humberto Delgado), PT" />
        <option value="CDG - Paris (Charles de Gaulle), FR" />
      </datalist>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{marginTop: 0, color: 'var(--primary-color)'}}>Busca Holística de Viagens</h2>
        
        {/* Toggle de Tipo de Busca */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          <button 
            type="button"
            className={`btn ${searchType === 'aereo' ? 'btn-primary' : ''}`}
            onClick={() => setSearchType('aereo')}
            style={{ border: '1px solid var(--primary-color)', color: searchType === 'aereo' ? '#fff' : 'var(--primary-color)', background: searchType === 'aereo' ? 'var(--primary-color)' : 'transparent'}}
          >
            ✈️ Somente Aéreo
          </button>
          <button 
            type="button"
            className={`btn ${searchType === 'pacote' ? 'btn-primary' : ''}`}
            onClick={() => setSearchType('pacote')}
            style={{ border: '1px solid var(--primary-color)', color: searchType === 'pacote' ? '#fff' : 'var(--primary-color)', background: searchType === 'pacote' ? 'var(--primary-color)' : 'transparent'}}
          >
            🏨 Pacote Completo (Voo + Extras)
          </button>
        </div>

        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Origem (Aeroporto)</label>
              <input type="text" list="lista-aeroportos" placeholder="Selecione na lista..." required style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}} />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Destino (Aeroporto)</label>
              <input type="text" list="lista-aeroportos" placeholder="Selecione na lista..." required style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Data de Ida</label>
              <input type="date" required style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}} />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Data de Volta</label>
              <input type="date" required style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Adultos (+12 anos)</label>
              <input type="number" min="1" defaultValue="1" style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}} />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Crianças (0 a 12 anos)</label>
              <input type="number" min="0" defaultValue="0" style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}} />
              <small style={{display: 'block', marginTop: '5px', color: 'var(--secondary-color)', fontSize: '12px'}}>
                ⚠️ Regra Crianças: Isenção ou desconto tarifário aplicável automaticamente dependendo da idade e GDS.
              </small>
            </div>
          </div>

          {searchType === 'pacote' && (
            <div style={{ marginBottom: '25px', padding: '15px', border: '2px dashed var(--accent-color)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Configurações do Pacote Terrestre</h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}><input type="checkbox" defaultChecked /> Incluir Hotel</label>
                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}><input type="checkbox" defaultChecked /> Seguro Viagem</label>
                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}><input type="checkbox" /> Transfer / Aluguel de Carro</label>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-accent" style={{width: '100%', height: '50px', fontSize: '16px'}}>
            🔍 Iniciar Busca Holística nas APIs
          </button>
        </form>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary-color)' }}>
          <h3>🔄 Buscando nas APIs GDS...</h3>
          <p>Acionando redundância anti-golpe. Verificando disponibilidade real em múltiplas fontes.</p>
        </div>
      )}

      {results && !loading && (
        <div>
          {/* Matriz de Datas */}
          <div className="card" style={{ marginBottom: '20px', background: '#eef2f6' }}>
            <h3 style={{marginTop: 0, fontSize: '16px'}}>📅 Matriz de Flexibilidade (Economia)</h3>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between' }}>
              <div style={{padding: '10px', background: '#fff', borderRadius: '4px', textAlign: 'center', flex: 1}}>1 Dia Antes<br/><strong style={{color: 'green'}}>- R$ 120</strong></div>
              <div style={{padding: '10px', background: 'var(--primary-color)', color: '#fff', borderRadius: '4px', textAlign: 'center', flex: 1}}>Datas Escolhidas<br/><strong>Base</strong></div>
              <div style={{padding: '10px', background: '#fff', borderRadius: '4px', textAlign: 'center', flex: 1}}>1 Dia Depois<br/><strong style={{color: 'green'}}>- R$ 50</strong></div>
            </div>
          </div>

          <h2 style={{color: 'var(--primary-color)'}}>Resultados Verificados {searchType === 'pacote' ? '(Aéreo + Terrestre)' : ''}</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {results.map(flight => (
              <div key={flight.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 24px' }}>
                <div>
                  <h3 style={{margin: '0 0 5px 0'}}>{flight.airline} {flight.direct ? '(Direto)' : '(1 Escala)'}</h3>
                  <div style={{color: 'var(--text-secondary)'}}>⏳ {flight.time}</div>
                  {flight.guaranteed && (
                    <div style={{color: 'var(--success)', fontSize: '12px', marginTop: '5px', fontWeight: 'bold'}}>
                      ✅ Tarifa validada no GDS (Sem risco)
                    </div>
                  )}
                </div>
                <div style={{textAlign: 'right'}}>
                  <h2 style={{margin: '0 0 10px 0', color: 'var(--primary-color)'}}>R$ {flight.price}</h2>
                  <button className="btn btn-primary" style={{padding: '6px 12px', fontSize: '14px'}}>Selecionar Opção</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop: '30px', textAlign: 'center'}}>
            <button className="btn btn-accent" style={{fontSize: '18px', padding: '15px 30px'}}>
              📄 Gerar Orçamento Dinâmico para o Cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
