export type ValidationResult = {
  totalFuncionarios: number;
  totalAlertas: number;
  alertas: Array<{
    funcionario: string;
    mensaje: string;
    severidad: 'warning' | 'error';
  }>;
};

export type PayrollEntry = {
  funcionarioId: string;
  funcionarioNombre: string;
  sucursal?: string;
  cargo?: string;
  conceptos: string[];
  liquido: number;
};
