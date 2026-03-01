
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Exporta dados para Excel
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Dados') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Exporta um elemento HTML (como um dashboard ou gráfico) para PDF
 */
export const exportElementToPDF = async (elementId: string, fileName: string, title: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#020617', // Cor de fundo do app para manter o estilo
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Adiciona título
    pdf.setFontSize(18);
    pdf.setTextColor(2, 6, 23); // Cor escura para o título no PDF (ou branca se o fundo for escuro)
    pdf.text(title, 10, 15);

    pdf.addImage(imgData, 'PNG', 0, 25, pdfWidth, pdfHeight);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
  }
};

/**
 * Exporta uma tabela de dados para PDF com formatação profissional
 */
export const exportTableToPDF = (headers: string[], rows: any[][], fileName: string, title: string) => {
  const pdf = new jsPDF();
  
  pdf.setFontSize(18);
  pdf.text(title, 14, 22);
  
  pdf.setFontSize(11);
  pdf.setTextColor(100);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

  autoTable(pdf, {
    head: [headers],
    body: rows,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { top: 35 },
  });

  pdf.save(`${fileName}.pdf`);
};
