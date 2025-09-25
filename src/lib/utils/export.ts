import jsPDF from 'jspdf';

export interface ExportData {
  title: string;
  headers: string[];
  data: (string | number)[][];
  filename: string;
}

// CSV Export
export function exportToCSV(exportData: ExportData) {
  const { headers, data, filename } = exportData;

  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      row.map(cell => {
        // Escape cells containing commas, quotes, or newlines
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// PDF Export
export function exportToPDF(exportData: ExportData) {
  const { title, headers, data, filename } = exportData;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Set up fonts and colors
  doc.setFont('helvetica');

  // Header
  doc.setFontSize(20);
  doc.setTextColor(94, 59, 46); // Dragon Saloon brown
  doc.text(title, 20, 20);

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 30);

  // Add Dragon Saloon branding
  doc.setFontSize(10);
  doc.setTextColor(192, 138, 44); // Dragon Saloon gold
  doc.text('🐉 The Dragon Saloon - Management System', 20, 40);

  // Table setup
  const startY = 50;
  const rowHeight = 7;
  const colWidths = calculateColumnWidths(headers, data, 250); // Adjust for landscape

  // Table headers
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(220, 199, 161); // Dragon Saloon beige

  let currentX = 20;
  headers.forEach((header, index) => {
    doc.rect(currentX, startY, colWidths[index], rowHeight, 'F');
    doc.rect(currentX, startY, colWidths[index], rowHeight);
    doc.text(header, currentX + 2, startY + 5);
    currentX += colWidths[index];
  });

  // Table data
  let currentY = startY + rowHeight;
  data.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (currentY > 180) {
      doc.addPage();
      currentY = 20;

      // Redraw headers on new page
      currentX = 20;
      doc.setFillColor(220, 199, 161);
      headers.forEach((header, index) => {
        doc.rect(currentX, currentY, colWidths[index], rowHeight, 'F');
        doc.rect(currentX, currentY, colWidths[index], rowHeight);
        doc.text(header, currentX + 2, currentY + 5);
        currentX += colWidths[index];
      });
      currentY += rowHeight;
    }

    // Alternate row colors
    if (rowIndex % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      currentX = 20;
      const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
      doc.rect(currentX, currentY, totalWidth, rowHeight, 'F');
    }

    currentX = 20;
    row.forEach((cell, cellIndex) => {
      doc.rect(currentX, currentY, colWidths[cellIndex], rowHeight);

      // Truncate long text
      let cellText = String(cell);
      if (cellText.length > 25) {
        cellText = cellText.substring(0, 22) + '...';
      }

      doc.text(cellText, currentX + 2, currentY + 5);
      currentX += colWidths[cellIndex];
    });

    currentY += rowHeight;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 40,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      'The Dragon Saloon Management System',
      20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  doc.save(`${filename}.pdf`);
}

// Helper function to calculate column widths
function calculateColumnWidths(headers: string[], data: (string | number)[][], maxWidth: number): number[] {
  const numCols = headers.length;
  const minColWidth = 20;
  const maxColWidth = Math.floor(maxWidth / numCols);

  // Calculate optimal widths based on content
  const colWidths = headers.map((header, index) => {
    const headerWidth = header.length * 2 + 4;
    const maxDataWidth = data.reduce((max, row) => {
      const cellWidth = String(row[index] || '').length * 2 + 4;
      return Math.max(max, cellWidth);
    }, 0);

    return Math.max(minColWidth, Math.min(maxColWidth, Math.max(headerWidth, maxDataWidth)));
  });

  // Ensure total width doesn't exceed maxWidth
  const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
  if (totalWidth > maxWidth) {
    const scaleFactor = maxWidth / totalWidth;
    return colWidths.map(width => Math.floor(width * scaleFactor));
  }

  return colWidths;
}

// Recipe PDF Export (special formatting)
export function exportRecipeToPDF(recipe: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFont('helvetica');

  // Title
  doc.setFontSize(24);
  doc.setTextColor(94, 59, 46);
  doc.text(recipe.name, 20, 25);

  // Category and difficulty
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  doc.text(`Category: ${recipe.category}`, 20, 35);
  doc.text(`Difficulty: ${'★'.repeat(recipe.difficulty)}${'☆'.repeat(5 - recipe.difficulty)}`, 20, 42);

  // Description
  if (recipe.description) {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const splitDescription = doc.splitTextToSize(recipe.description, 170);
    doc.text(splitDescription, 20, 52);
  }

  let currentY = 70;

  // Ingredients
  doc.setFontSize(16);
  doc.setTextColor(94, 59, 46);
  doc.text('Ingredients:', 20, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  recipe.ingredients?.forEach((ingredient: any) => {
    const unit = ingredient.unitOverride || ingredient.item?.unit || 'unit';
    doc.text(`• ${ingredient.quantity} ${unit} ${ingredient.item?.name || 'Unknown item'}`, 25, currentY);
    currentY += 6;
  });

  currentY += 10;

  // Instructions
  if (recipe.stepsMarkdown) {
    doc.setFontSize(16);
    doc.setTextColor(94, 59, 46);
    doc.text('Instructions:', 20, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const steps = recipe.stepsMarkdown.split('\\n').filter((step: string) => step.trim());
    steps.forEach((step: string, index: number) => {
      const cleanStep = step.replace(/^\\d+\\.\\s*/, '').trim();
      if (cleanStep) {
        const stepText = `${index + 1}. ${cleanStep}`;
        const splitStep = doc.splitTextToSize(stepText, 170);
        doc.text(splitStep, 20, currentY);
        currentY += splitStep.length * 5 + 3;
      }
    });
  }

  // Cost breakdown (for staff)
  if (recipe.calculatedCost !== undefined) {
    currentY += 10;
    doc.setFontSize(14);
    doc.setTextColor(94, 59, 46);
    doc.text('Cost Analysis:', 20, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Estimated Cost: $${recipe.calculatedCost.toFixed(2)}`, 25, currentY);
    currentY += 5;
    doc.text(`Suggested Sell Price: $${recipe.suggestedSellPrice?.toFixed(2) || 'N/A'}`, 25, currentY);
    currentY += 5;
    doc.text(`Target Margin: ${recipe.suggestedMargin || 'N/A'}%`, 25, currentY);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('🐉 The Dragon Saloon Recipe Collection', 20, 280);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 120, 280);

  doc.save(`${recipe.name.replace(/[^a-zA-Z0-9]/g, '_')}_recipe.pdf`);
}