import {
  parsePy,
  parseSphinxGallery,
  parseClassicMd,
  parseMystMd,
  toPy,
  toSphinxGallery,
  toClassicMd,
  toMystMd
} from 'plainb';
import type { Notebook } from 'plainb';

// parseQuartoMd should be implemented in plainb
// https://github.com/notebook-link/plainb/issues/18
var parseQuartoMd = parseClassicMd;

export type ParserName =
  | 'parsePy'
  | 'parseSphinxGallery'
  | 'parseClassicMd'
  | 'parseMystMd'
  | 'parseQuartoMd';

export interface IRule {
  dir: string;
  parser: ParserName;
}

export interface IKernelspec {
  name: string;
  display_name: string;
  language: string;
}

export interface IPlainTextNotebookConfig {
  rules?: IRule[];
  defaultKernelspec?: IKernelspec;
  notebookMetadataFilter?: string;
  cellMetadataFilter?: string;
}

export const PARSERS: Record<ParserName, (text: string) => object> = {
  parsePy,
  parseSphinxGallery,
  parseClassicMd,
  parseMystMd,
  parseQuartoMd
};

export const SERIALIZERS: Record<ParserName, (notebook: Notebook) => string> = {
  parsePy: toPy,
  parseSphinxGallery: toSphinxGallery,
  parseClassicMd: toClassicMd,
  parseMystMd: toMystMd,
  parseQuartoMd: toClassicMd
};

export const PARSER_LABELS: Record<ParserName, string> = {
  parsePy: 'Percent format (.py)',
  parseSphinxGallery: 'Sphinx Gallery (.py)',
  parseClassicMd: 'Classic Markdown (.md)',
  parseMystMd: 'MyST Notebook (.md)',
  parseQuartoMd: 'Quarto (.qmd)'
};

export const PARSER_EXTENSIONS: Record<ParserName, string[]> = {
  parsePy: ['.py'],
  parseSphinxGallery: ['.py'],
  parseClassicMd: ['.md'],
  parseMystMd: ['.md'],
  parseQuartoMd: ['.qmd']
};

export const CONTEXT_MENU_LABELS: Record<ParserName, string> = {
  parsePy: 'Notebook (Percent .py)',
  parseSphinxGallery: 'Notebook (Sphinx Gallery .py)',
  parseClassicMd: 'Notebook (Classic Markdown .md)',
  parseMystMd: 'Notebook (MyST .md)',
  parseQuartoMd: "Notebook (Quarto .qmd)"
};
