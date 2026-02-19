import React from 'react';
import type { ValidationResult } from '@/types/payroll';

export function ValidationResults({ result }: { result: ValidationResult }) {
  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 16, padding: 16, background: '#fff' }}>
      <h3 style={{ marginTop: 0 }}>Resultados</h3>
      <p>Total funcionarios: {result.totalFuncionarios}</p>
      <p>Total alertas: {result.totalAlertas}</p>

      {result.alertas.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No se encontraron alertas 🎉</p>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result.alertas.map((a, i) => (
            <li key={i}>
              <strong>{a.funcionario}</strong> — {a.mensaje}{' '}
              {a.severidad === 'error' ? '🚨' : '⚠️'}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
