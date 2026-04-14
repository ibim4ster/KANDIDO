import * as pdfjsLib from 'pdfjs-dist';
// @ts-expect-error - Vite handles this import
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (file.type === 'text/plain') {
    return await file.text();
  }

  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  }

  throw new Error('Formato de archivo no soportado. Por favor, sube un PDF o TXT.');
};
