import { jsPDF } from 'jspdf';
import type { CaseInput, IracArgument, Counterargument, LegalExplanation } from '../types/legal';
import { formatDate } from './formatting';

export const EDUCATIONAL_DISCLAIMER_TEXT = `Educational practice tool only. AI-generated material is for learning and moot-court practice and is not legal advice, legal representation, or a substitute for verified legal research or professional counsel. Do not rely on generated content as a real legal citation.`;

export function generateMarkdownBrief(
  input: CaseInput,
  argument?: IracArgument | null,
  counterargument?: Counterargument | null,
  explanation?: LegalExplanation | null,
  isMock = false
): string {
  const parts: string[] = [];

  parts.push(`# NAYAYA-AI — LEGAL LEARNING & MOOT COURT BRIEF`);
  parts.push(`*AI-Powered Legal Learning & Moot Court Assistant*`);
  parts.push(`*Generated on: ${formatDate(Date.now())}*`);
  parts.push(`*Subject:* ${input.subject} | *Jurisdiction:* ${input.jurisdiction}`);
  if (isMock) {
    parts.push(`> [!NOTE]\n> **Demo Mode — Example response. Connect the backend for live AI analysis.**`);
  }
  parts.push('');

  parts.push(`## 1. CASE DETAILS`);
  parts.push(`### Legal Issue:`);
  parts.push(`${input.issue.trim()}\n`);
  parts.push(`### Statement of Facts:`);
  parts.push(`${input.facts.trim()}\n`);

  if (argument) {
    parts.push(`---\n## 2. STRUCTURED IRAC ARGUMENT`);
    parts.push(`### [I] ISSUE\n${argument.issue}\n`);
    parts.push(`### [R] RULE / LEGAL PRINCIPLE\n${argument.rule}\n`);
    parts.push(`### [A] APPLICATION TO FACTS\n${argument.application}\n`);
    parts.push(`### [C] CONCLUSION\n${argument.conclusion}\n`);

    if (argument.general_principles && argument.general_principles.length > 0) {
      parts.push(`### General Legal Principles Used:`);
      argument.general_principles.forEach(p => parts.push(`* ${p}`));
      parts.push('');
    }

    if (argument.assumptions && argument.assumptions.length > 0) {
      parts.push(`### Assumptions:`);
      argument.assumptions.forEach(a => parts.push(`* ${a}`));
      parts.push('');
    }

    if (argument.limitations && argument.limitations.length > 0) {
      parts.push(`### Limitations:`);
      argument.limitations.forEach(l => parts.push(`* ${l}`));
      parts.push('');
    }
  }

  if (counterargument) {
    parts.push(`---\n## 3. MOOT-COURT COUNTERARGUMENT`);
    parts.push(`### Opposition Position:\n${counterargument.opposition_position}\n`);
    
    parts.push(`### Strongest Opposing Arguments:`);
    counterargument.opposing_arguments.forEach(arg => parts.push(`* ${arg}`));
    parts.push('');

    parts.push(`### Weaknesses in Student's Argument:`);
    counterargument.student_weaknesses.forEach(w => parts.push(`* ${w}`));
    parts.push('');

    parts.push(`### Possible Rebuttal Directions:`);
    counterargument.rebuttal_directions.forEach(r => parts.push(`* ${r}`));
    parts.push('');
  }

  if (explanation) {
    parts.push(`---\n## 4. PLAIN-LANGUAGE EXPLANATION (FIRST-YEAR LAW STUDENT PERSPECTIVE)`);
    parts.push(`### Clear Explanation:\n${explanation.plain_explanation}\n`);

    if (explanation.key_legal_terms && explanation.key_legal_terms.length > 0) {
      parts.push(`### Key Legal Terminology:`);
      explanation.key_legal_terms.forEach(t => {
        parts.push(`* **${t.term}**: ${t.meaning}${t.simple_example ? ` *(Example: ${t.simple_example})*` : ''}`);
      });
      parts.push('');
    }

    if (explanation.reasoning_breakdown && explanation.reasoning_breakdown.length > 0) {
      parts.push(`### What the Reasoning Means:`);
      explanation.reasoning_breakdown.forEach(s => parts.push(`* ${s}`));
      parts.push('');
    }

    if (explanation.nuances_limitations && explanation.nuances_limitations.length > 0) {
      parts.push(`### Important Nuances & Limitations:`);
      explanation.nuances_limitations.forEach(n => parts.push(`* ${n}`));
      parts.push('');
    }
  }

  parts.push(`\n---\n================================================================================`);
  parts.push(`DISCLAIMER:`);
  parts.push(EDUCATIONAL_DISCLAIMER_TEXT);
  parts.push(`================================================================================\n`);

  return parts.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

export function downloadAsTxt(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsPdf(
  input: CaseInput,
  argument?: IracArgument | null,
  counterargument?: Counterargument | null,
  explanation?: LegalExplanation | null,
  isMock = false,
  filename = 'Nayaya_AI_Practice_Brief.pdf'
): void {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin - 35) {
      addFooter();
      doc.addPage();
      y = margin + 10;
      addHeaderBanner();
    }
  }

  function addFooter() {
    doc.setFontSize(7.5);
    doc.setTextColor(130, 140, 155);
    doc.text(
      'Nayaya-AI — Educational Practice Tool | NOT Legal Advice | Page ' + doc.getNumberOfPages(),
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  function addHeaderBanner() {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y - 5, contentWidth, 2.5, 'F');
    y += 10;
  }

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42);
  doc.text('NAYAYA-AI — PRACTICE BRIEF', margin, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Subject: ${input.subject}    |    Jurisdiction: ${input.jurisdiction}    |    Date: ${formatDate(Date.now())}`, margin, y);
  y += 14;

  if (isMock) {
    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(191, 219, 254);
    doc.rect(margin, y, contentWidth, 18, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(29, 78, 216);
    doc.text('Demo Mode — Example response. Connect the backend for live AI analysis.', margin + 8, y + 12);
    y += 24;
  }

  // Educational Disclaimer Box
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.rect(margin, y, contentWidth, 34, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('PERSISTENT EDUCATIONAL DISCLAIMER', margin + 8, y + 11);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  const disclaimerLines = doc.splitTextToSize(EDUCATIONAL_DISCLAIMER_TEXT, contentWidth - 16);
  doc.text(disclaimerLines, margin + 8, y + 21);
  y += 44;

  // Section 1: Facts & Issue
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Case Facts & Issue', margin, y);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Legal Issue:', margin, y);
  y += 11;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const issueLines = doc.splitTextToSize(input.issue, contentWidth);
  checkPageBreak(issueLines.length * 10);
  doc.text(issueLines, margin, y);
  y += issueLines.length * 10 + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Case Facts:', margin, y);
  y += 11;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const factsLines = doc.splitTextToSize(input.facts, contentWidth);
  checkPageBreak(factsLines.length * 9.5);
  doc.text(factsLines, margin, y);
  y += factsLines.length * 9.5 + 14;

  // Section 2: IRAC
  if (argument) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Structured IRAC Practice Argument', margin, y);
    y += 12;

    const iracParts = [
      { label: '[I] ISSUE', text: argument.issue, color: [2, 132, 199] },
      { label: '[R] RULE', text: argument.rule, color: [124, 58, 237] },
      { label: '[A] APPLICATION', text: argument.application, color: [5, 150, 105] },
      { label: '[C] CONCLUSION', text: argument.conclusion, color: [217, 119, 6] }
    ];

    iracParts.forEach(part => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(part.color[0], part.color[1], part.color[2]);
      doc.text(part.label, margin, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(part.text, contentWidth);
      checkPageBreak(lines.length * 9.5);
      doc.text(lines, margin, y);
      y += lines.length * 9.5 + 8;
    });

    if (argument.general_principles && argument.general_principles.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('General Principles Used:', margin, y);
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      argument.general_principles.forEach(p => {
        const pLines = doc.splitTextToSize(`• ${p}`, contentWidth - 10);
        checkPageBreak(pLines.length * 9);
        doc.text(pLines, margin + 5, y);
        y += pLines.length * 9;
      });
      y += 6;
    }
  }

  // Section 3: Counterargument
  if (counterargument) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. Moot-Court Counterargument', margin, y);
    y += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(185, 28, 28);
    doc.text('Opposition Position:', margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const oppLines = doc.splitTextToSize(counterargument.opposition_position, contentWidth);
    checkPageBreak(oppLines.length * 9.5);
    doc.text(oppLines, margin, y);
    y += oppLines.length * 9.5 + 8;

    if (counterargument.opposing_arguments.length > 0) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('Strongest Opposing Arguments:', margin, y);
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      counterargument.opposing_arguments.forEach(arg => {
        const lines = doc.splitTextToSize(`• ${arg}`, contentWidth - 10);
        checkPageBreak(lines.length * 9);
        doc.text(lines, margin + 5, y);
        y += lines.length * 9;
      });
      y += 6;
    }
  }

  // Section 4: Plain Language
  if (explanation) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('4. Plain-Language Explanation', margin, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const plainLines = doc.splitTextToSize(explanation.plain_explanation, contentWidth);
    checkPageBreak(plainLines.length * 9.5);
    doc.text(plainLines, margin, y);
    y += plainLines.length * 9.5 + 8;
  }

  addFooter();
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
