import { useState } from 'react';
import { FileSearch, Loader2 } from 'lucide-react';

/**
 * TYPES
 */
type ValidationResult = {
  totalFuncionarios: number;
  totalAlertas: number;
  alertas: Array<{
    funcionario: string;
    mensaje: string;
    severidad: 'warning' | 'error';
  }>;
};

/**
 * TOAST (simple)
 */
function toast(args: {
  title: string;
  description?: string;
  variant?: 'destructive' | 'default';
}) {
  const prefix = args.variant === 'destructive' ? '❌' : '✅';
  console.log(`${prefix} ${args.title} - ${args.description ?? ''}`);
}

/**
 * BUTTON (simple)
 */
function Button({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={className}
      style={{
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px solid #ddd',
        background: '#111',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

/**
 * PdfUploader (inline)
 */
function PdfUploader({
  onFileSelect,
  isProcessing,
}: {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="file"
        accept="application/pdf"
        disabled={isProcessing}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
        }}
      />
      <small style={{ opacity: 0.7 }}>
        Solo PDF. (El parseo real del PDF está en modo demo/stub)
      </small>
    </div>
  );
}

/**
 * ValidationResults (inline)
 */
function ValidationResults({ result }: { result: ValidationResult }) {
  return (
    <section
      style={{
        border: '1px solid #ddd',
        borderRadius: 16,
        padding: 16,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Resultados</h3>
      <p>Total funcionarios: {result.totalFuncionarios}</p>
      <p>Total alertas: {result.totalAlertas}</p>

      {result.alertas.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No se encontraron alertas 🎉</p>
      ) : (
        <ul>
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

/**
 * PDF PARSER + VALIDATORS (stubs)
 */
async function extractTextFromPdf(_file: File): Promise<string> {
  // STUB: sin pdfjs-dist no se puede parsear PDF real
  return '';
}

function parsePayrollEntries(_text: string): any[] {
  return [];
}

function validatePayroll(_entries: any[]): ValidationResult {
  return {
    totalFuncionarios: 0,
    totalAlertas: 0,
    alertas: [],
  };
}

/**
 * APP
 */
export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const text = await extractTextFromPdf(file);
      const entries = parsePayrollEntries(text);

      if (entries.length === 0) {
        toast({
          title: 'No se encontraron recibos',
          description:
            'No se pudieron identificar recibos de sueldo en el PDF. Verificá que el formato sea correcto.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      const validationResult = validatePayroll(entries);
      setResult(validationResult);

      toast({
        title: 'Análisis completado',
        description: `Se analizaron ${validationResult.totalFuncionarios} funcionarios. Se encontraron ${validationResult.totalAlertas} alertas.`,
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: 'Error al procesar el PDF',
        description:
          error instanceof Error
            ? error.message
            : 'Hubo un problema al leer el archivo. Verificá que sea un PDF válido.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid #eee',
          background: '#fff',
        }}
      >
        <div
          style={{
            margin: '0 auto',
            maxWidth: 900,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '18px 16px',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileSearch style={{ width: 20, height: 20, color: '#fff' }} />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
              Control de Liquidaciones
            </h1>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
              Validación de recibos de sueldo
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ margin: '0 auto', maxWidth: 900, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Upload section */}
          <section>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 14 }}>
              Subir archivo
            </h2>
            <p style={{ margin: '0 0 12px 0', fontSize: 12, opacity: 0.7 }}>
              Cargá el PDF con los recibos de sueldo para analizarlos
            </p>

            <PdfUploader
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
            />

            {file && !isProcessing && (
              <div style={{ marginTop: 12 }}>
                <Button onClick={handleAnalyze}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <FileSearch style={{ width: 16, height: 16 }} />
                    Analizar liquidaciones
                  </span>
                </Button>
              </div>
            )}

            {isProcessing && (
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  opacity: 0.7,
                }}
              >
                <Loader2 style={{ width: 16, height: 16 }} />
                Procesando el archivo PDF...
              </div>
            )}
          </section>

          {/* Criteria info */}
          {!result && (
            <section
              style={{
                borderRadius: 16,
                border: '1px solid #eee',
                background: '#fff',
                padding: 16,
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: 14 }}>
                Criterios de validación
              </h3>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>
                  Funcionarios de sucursales <b>Shopping</b>, <b>Nuevo Centro</b>
                  , <b>Costa Urbana</b>, <b>Tres Cruces</b> y <b>Plaza Italia</b>{' '}
                  deben tener la <b>partida shopping</b>.
                </li>
                <li>
                  Si un funcionario que no es de esas sucursales tiene partida
                  shopping, se genera una advertencia.
                </li>
                <li>
                  Funcionarios <b>955</b> y <b>149</b> deben tener la{' '}
                  <b>partida por guardias</b>.
                </li>
                <li>
                  Si otro funcionario tiene partida por guardias sin estar
                  autorizado, se genera una advertencia.
                </li>
                <li>
                  Se alerta si un funcionario tiene <b>líquido cero</b> ($0).
                </li>
                <li>
                  Se alerta si un funcionario tiene <b>importes excedidos</b>{' '}
                  (líquido negativo).
                </li>
                <li>
                  Si un funcionario tiene un concepto de <b>falta</b>, no debe
                  tener <b>presentismo</b>.
                </li>
                <li>
                  Si el cargo incluye <b>supervisor</b>, no debe cobrar{' '}
                  <b>partida shopping</b>.
                </li>
                <li>
                  Si un funcionario tiene un concepto de <b>falta</b>, no debe
                  cobrar <b>partida shopping</b>.
                </li>
                <li>
                  Si el cargo incluye <b>jornalero</b>, no debe tener el concepto
                  de <b>horas extras</b>.
                </li>
              </ul>
            </section>
          )}

          {/* Results */}
          {result && <ValidationResults result={result} />}
        </div>
      </main>
    </div>
  );
}
