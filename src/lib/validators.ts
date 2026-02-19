import type { PayrollEntry, ValidationResult } from '@/types/payroll';

export function parsePayrollEntries(text: string): PayrollEntry[] {
  // Demo simple: busca IDs tipo "955" o "149" y crea 1 entry por cada match
  const ids = Array.from(new Set(text.match(/\b\d{2,4}\b/g) ?? []));

  // Si no encuentra nada, devuelve vacío
  if (ids.length === 0) return [];

  return ids.map((id) => ({
    funcionarioId: id,
    funcionarioNombre: `Funcionario ${id}`,
    conceptos: [],
    liquido: 1000,
  }));
}

export function validatePayroll(entries: PayrollEntry[]): ValidationResult {
  const allowedShoppingBranches = new Set([
    'Shopping',
    'Nuevo Centro',
    'Costa Urbana',
    'Tres Cruces',
    'Plaza Italia',
  ]);

  const allowedGuardias = new Set(['955', '149']);

  const alertas: ValidationResult['alertas'] = [];

  for (const e of entries) {
    const conceptosLower = e.conceptos.map((c) => c.toLowerCase());

    const tieneShopping = conceptosLower.includes('partida shopping');
    const tieneGuardias = conceptosLower.includes('partida por guardias');
    const tieneFalta = conceptosLower.includes('falta');
    const tienePresentismo = conceptosLower.includes('presentismo');
    const tieneHorasExtras = conceptosLower.includes('horas extras');

    const suc = (e.sucursal ?? '').trim();
    const cargo = (e.cargo ?? '').toLowerCase();

    // Reglas (básicas)
    if (suc && allowedShoppingBranches.has(suc) && !tieneShopping) {
      alertas.push({
        funcionario: `${e.funcionarioNombre} (${e.funcionarioId})`,
        mensaje: `Sucursal ${suc} requiere "partida shopping"`,
        severidad: 'warning',
      });
    }

    if (tieneShopping && suc && !allowedShoppingBranches.has(suc)) {
      alertas.push({
        funcionario: `${e.funcionarioNombre} (${e.funcionarioId})`,
        mensaje: `Tiene "partida shopping" pero no es sucursal autorizada (${suc})`,
        severidad: 'warning',
      });
    }

    if (tieneGuardias && !allowedGuardias.has(e.funcionarioId)) {
      alertas.push({
        funcionario: `${e.funcionarioNombre} (${e.funcionarioId})`,
        mensaje: `Tiene "partida por guardias" sin estar autorizado`,
        severidad: 'warning',
      });
    }

    if (!tieneGuardias && allowedGuardias.has(e.funcionarioId)) {
      alertas.push({
        funcionario: `${e.funcionarioNombre} (${e.funcionarioId})`,
        mensaje: `Debe tener "partida por guardias"`,
        severidad: 'warning',
      });
    }

    if (e.liquido === 0) {
      alertas.push({
        funcionario: `${e.funcionarioNombre} (${e.funcionarioId})`,
        mensaje: `Líquido cero ($0)`,
        severidad: 'error',
      });
    }

    if (e.liquido < 0) {
      alertas.push({
        funcionario: `${e.funcionarioNombre} (${e.funcionarioId})`,
        mensaje: `Líquido negativo (excedido): ${e.liquido}`,
        severidad: 'error',
      });
    }

    if (tieneFalta && tienePresentismo) {
      alertas.push({
        funcionario: `${e.funcionarioNombre} (${e.funcionarioId})`,
        mensaje: `Tiene "falta" y "presentismo" (no corresponde)`,
        severidad: 'warning',
      });
    }

    if (cargo.includes('supervisor') && tieneShopping) {
      alertas.push({
        funcionario: `${e.funcionarioNombre} (${e.funcionarioId})`,
        mensaje: `Cargo supervisor no debe cobrar "partida shopping"`,
        severidad: 'warning',
      });
    }

    if (tieneFalta && tieneShopping) {
      alertas.push({
        funcionario: `${e.funcionarioNombre} (${e.funcionarioId})`,
        mensaje: `Con "falta" no debe cobrar "partida shopping"`,
        severidad: 'warning',
      });
    }

    if (cargo.includes('jornalero') && tieneHorasExtras) {
      alertas.push({
        funcionario: `${e.funcionarioNombre} (${e.funcionarioId})`,
        mensaje: `Cargo jornalero no debe tener "horas extras"`,
        severidad: 'warning',
      });
    }
  }

  return {
    totalFuncionarios: entries.length,
    totalAlertas: alertas.length,
    alertas,
  };
}
