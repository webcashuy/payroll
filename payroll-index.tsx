import { useState } from 'react';
import { FileSearch, Loader2 } from 'lucide-react';
import { PdfUploader } from '@/components/PdfUploader';
import { ValidationResults } from '@/components/ValidationResults';
import { extractTextFromPdf } from '@/lib/pdfParser';
import { parsePayrollEntries, validatePayroll } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import type { ValidationResult } from '@/types/payroll';
import { toast } from '@/hooks/use-toast';

const Index = () => {
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
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'no stack');
      toast({
        title: 'Error al procesar el PDF',
        description: error instanceof Error ? error.message : 'Hubo un problema al leer el archivo. Verificá que sea un PDF válido.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <FileSearch className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-card-foreground tracking-tight">
              Control de Liquidaciones
            </h1>
            <p className="text-xs text-muted-foreground">
              Validación de recibos de sueldo
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="space-y-6">
          {/* Upload section */}
          <section>
            <h2 className="mb-1 text-sm font-semibold text-foreground">
              Subir archivo
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Cargá el PDF con los recibos de sueldo para analizarlos
            </p>
            <PdfUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />

            {file && !isProcessing && (
              <Button onClick={handleAnalyze} className="mt-4 w-full sm:w-auto">
                <FileSearch className="mr-2 h-4 w-4" />
                Analizar liquidaciones
              </Button>
            )}

            {isProcessing && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando el archivo PDF...
              </div>
            )}
          </section>

          {/* Criteria info */}
          {!result && (
            <section className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-card-foreground">
                Criterios de validación
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Funcionarios de sucursales <strong className="text-foreground">Shopping, Nuevo Centro, Costa Urbana, Tres Cruces y Plaza Italia</strong> deben tener la <strong className="text-foreground">partida shopping</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Si un funcionario que no es de esas sucursales tiene partida shopping, se genera una advertencia.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Funcionarios <strong className="text-foreground">955</strong> y <strong className="text-foreground">149</strong> deben tener la <strong className="text-foreground">partida por guardias</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Si otro funcionario tiene partida por guardias sin estar autorizado, se genera una advertencia.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Se alerta si un funcionario tiene <strong className="text-foreground">líquido cero</strong> ($0).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Se alerta si un funcionario tiene <strong className="text-foreground">importes excedidos</strong> (líquido negativo, los descuentos superan los haberes).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Si un funcionario tiene un concepto de <strong className="text-foreground">falta</strong>, no debe tener <strong className="text-foreground">presentismo</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Si el cargo incluye <strong className="text-foreground">supervisor</strong>, no debe cobrar <strong className="text-foreground">partida shopping</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Si un funcionario tiene un concepto de <strong className="text-foreground">falta</strong>, no debe cobrar <strong className="text-foreground">partida shopping</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Si el cargo incluye <strong className="text-foreground">jornalero</strong>, no debe tener el concepto de <strong className="text-foreground">horas extras</strong>.
                  </span>
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
};

export default Index;
