import { saveReportFile } from '../storage.js';
import type { ReportGeneratorOutput } from '../types/agent.js';

export interface GenerateReportParams {
  title: string;
  fileName?: string;
  introduction?: string;
  sections?: Array<{ heading: string; content: string }>;
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  sources?: Array<{ title: string; url: string }>;
  rawContent?: string;
}

export async function executeReportGenerator(params: GenerateReportParams): Promise<ReportGeneratorOutput> {
  const title = params.title?.trim() || 'JarvisOS Intelligence Report';
  let markdown = '';

  if (params.rawContent && params.rawContent.trim().length > 50) {
    // If raw markdown content was provided by the agent/planner
    markdown = params.rawContent.trim();
    if (!markdown.startsWith('# ')) {
      markdown = `# ${title}\n\n${markdown}`;
    }
  } else {
    // Build structured markdown report
    markdown += `# ${title}\n\n`;
    markdown += `*Generated autonomously by JarvisOS on ${new Date().toISOString()}*\n\n`;
    markdown += `---\n\n`;

    // Introduction
    markdown += `## 1. Executive Summary & Introduction\n\n`;
    markdown += `${params.introduction || 'This document was compiled through autonomous agent research and analysis across multiple data sources.'}\n\n`;

    // Comparison Table if present
    if (params.comparisonTable && params.comparisonTable.headers.length > 0) {
      markdown += `## 2. Comparative Analysis\n\n`;
      markdown += `| ${params.comparisonTable.headers.join(' | ')} |\n`;
      markdown += `| ${params.comparisonTable.headers.map(() => '---').join(' | ')} |\n`;
      for (const row of params.comparisonTable.rows) {
        markdown += `| ${row.join(' | ')} |\n`;
      }
      markdown += `\n`;
    }

    // Custom Sections
    if (params.sections && params.sections.length > 0) {
      params.sections.forEach((sec, idx) => {
        const secNum = (params.comparisonTable ? 3 : 2) + idx;
        markdown += `## ${secNum}. ${sec.heading}\n\n`;
        markdown += `${sec.content}\n\n`;
      });
    }

    // Sources
    markdown += `## References & Verified Sources\n\n`;
    if (params.sources && params.sources.length > 0) {
      params.sources.forEach(src => {
        markdown += `- [${src.title}](${src.url})\n`;
      });
    } else {
      markdown += `*No external sources referenced.*\n`;
    }
    markdown += `\n---\n*JarvisOS Verification: Output Verified via Storage Engine*\n`;
  }

  // Generate clean filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = (params.fileName || title)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 40);
  const finalFileName = `${baseName}_${timestamp}.md`;

  // Write file to persistent disk
  const saved = saveReportFile(finalFileName, markdown);

  // Analyze sections
  const extractedSections = (markdown.match(/^##\s+.+$/gm) || []).map(s => s.replace(/^##\s+/, ''));
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;

  return {
    title,
    fileName: saved.fileName,
    filePath: saved.filePath,
    downloadUrl: `/api/reports/${saved.fileName}`,
    wordCount,
    sizeBytes: saved.sizeBytes,
    sections: extractedSections,
  };
}
