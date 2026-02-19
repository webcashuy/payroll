import * as pdfjsLib from 'pdfjs-dist';

// Worker para Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const parts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = (content.items as any[]).map((it) => it.str).filter(Boolean);
    parts.push(strings.join(' '));
  }

  return parts.join('\n');
}
