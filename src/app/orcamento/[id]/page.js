'use client';
import { useState } from 'react';
import '../../globals.css';

export default function OrcamentoCliente({ params }) {
  const [seguroAdicionado, setSeguroAdicionado] = useState(false);

  // Dados mocados simulando o que veio do banco de dados/API para este ID específico
  const orcamento = {
    id: params?.id || 'EURO-2938',
    cliente: 'Sr. João Silva',
    destino: 'Miami (MIA), Estados Unidos',
    ida: '15 de Julho',
    volta: '30 de Julho',
    passageiros: 2,
    voo: {
      companhia: 'LATAM Airlines',
      escala: 'Voo Direto',
      precoBase: 4200.00
    },
    seguro: {
      valor: 250.00,
      cobertura: 'US$ 60.000 + Extravio de Bagagem'
    }
  };

  const valorTotal = orcamento.voo.precoBase + (seguroAdicionado ? orcamento.seguro.valor : 0);

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px 0' }}>
      <div className="container" style={{ maxWidth: '600px', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        
        {/* Cabeçalho do Orçamento */}
        <header style={{ backgroundColor: 'var(--primary-color)', color: '#fff', padding: '30px 20px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Euro Tur Viagens</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>Orçamento Personalizado #{orcamento.id}</p>
        </header>

        <div style={{ padding: '20px' }}>
          {/* Mensagem de Escassez (Hold) */}
          <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '12px', borderRadius: '8px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', border: '1px solid #ffeeba' }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div>
              <strong>Atenção {orcamento.cliente.split(' ')[1]}:</strong> Preço promocional garantido (Hold) por apenas <strong>24 horas</strong>. Sujeito à disponibilidade após esse prazo.
            </div>
          </div>

          <h2 style={{ color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Sua Viagem para {orcamento.destino}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            <div>
              <small style={{ color: 'var(--text-secondary)' }}>Ida:</small>
              <div style={{ fontWeight: 'bold' }}>{orcamento.ida}</div>
            </div>
            <div>
              <small style={{ color: 'var(--text-secondary)' }}>Volta:</small>
              <div style={{ fontWeight: 'bold' }}>{orcamento.volta}</div>
            </div>
            <div>
              <small style={{ color: 'var(--text-secondary)' }}>Passageiros:</small>
              <div style={{ fontWeight: 'bold' }}>{orcamento.passageiros} Adultos</div>
            </div>
            <div>
              <small style={{ color: 'var(--text-secondary)' }}>Voo:</small>
              <div style={{ fontWeight: 'bold' }}>{orcamento.voo.companhia} ({orcamento.voo.escala})</div>
            </div>
          </div>

          {/* Upsell de Seguro Viagem */}
          <div style={{ border: '2px dashed var(--secondary-color)', borderRadius: '8px', padding: '15px', marginBottom: '25px', backgroundColor: seguroAdicionado ? '#f0f8ff' : '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '16px' }}>🛡️ Seguro Viagem Recomendado</h3>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>+ R$ {orcamento.seguro.valor.toFixed(2)}</div>
            </div>
            <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Evite dores de cabeça! Cobertura de {orcamento.seguro.cobertura}. Altamente recomendado para os Estados Unidos.
            </p>
            <button 
              className={`btn ${seguroAdicionado ? 'btn-primary' : ''}`}
              onClick={() => setSeguroAdicionado(!seguroAdicionado)}
              style={{ width: '100%', border: '1px solid var(--primary-color)', color: seguroAdicionado ? '#fff' : 'var(--primary-color)', background: seguroAdicionado ? 'var(--primary-color)' : 'transparent'}}
            >
              {seguroAdicionado ? '✅ Seguro Adicionado' : 'Adicionar Seguro ao Pacote'}
            </button>
          </div>

          {/* Total */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Valor Total do Investimento:</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-color)' }}>R$ {valorTotal.toFixed(2)}</div>
          </div>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn btn-accent" style={{ fontSize: '16px', padding: '15px' }}>
              Aprovar Orçamento e Emitir
            </button>
            <button className="btn" onClick={handleImprimir} style={{ background: '#e9ecef', color: '#495057' }}>
              📄 Baixar PDF do Orçamento
            </button>
          </div>

        </div>
      </div>
      
      {/* Estilos para impressão PDF oculta botões no PDF gerado */}
      <style jsx global>{`
        @media print {
          body { background: #fff; }
          .container { box-shadow: none !important; border: 1px solid #ddd; }
          .btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
