import { useState } from 'react';
import { FileSearch, Loader2 } from 'lucide-react';

import { PdfUploader } from '@/components/PdfUploader';
import { ValidationResults } from '@/components/ValidationResults';
import { extractTextFromPdf } from '@/lib/pdfParser';
import { parsePayrollEntries, validatePayroll } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import type { ValidationResult } from '@/types/payroll';
import { toast } from '@/hooks/use-toast';

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
        return;
      }

      const validationResult = validatePayroll(entries);
      setResult(validationResult);

      toast({
        title: 'Análisis completado',
        description: `Se analizaron ${validationResult.totalFuncionarios} funcionarios. Se encontraron ${validationResult.totalAlertas} alertas.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error al procesar el PDF',
        description:
          error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <header style={{ borderBottom: '1px solid #eee', background: '#fff' }}>
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

      <main style={{ margin: '0 auto', maxWidth: 900, padding: 16 }}>
        <section>
          <h2 style={{ margin: '0 0 4px 0', fontSize: 14 }}>Subir archivo</h2>
          <p style={{ margin: '0 0 12px 0', fontSize: 12, opacity: 0.7 }}>
            Cargá el PDF con los recibos de sueldo para analizarlos
          </p>

          <PdfUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />

          {file && !isProcessing && (
            <div style={{ marginTop: 12 }}>
              <Button onClick={handleAnalyze}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <FileSearch style={{ width: 16, height: 16 }} />
                  Analizar liquidaciones
                </span>
              </Button>
            </div>
          )}

          {isProcessing && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, opacity: 0.7 }}>
              <Loader2 style={{ width: 16, height: 16 }} />
              Procesando el archivo PDF...
            </div>
          )}
        </section>

        <div style={{ marginTop: 16 }}>
          {result && <ValidationResults result={result} />}
        </div>
      </main>
    </div>
  );
}
