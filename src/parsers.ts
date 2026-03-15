import {
  parsePy,
  parseSphinxGallery,
  parseClassicMd,
  parseMystMd
} from 'plainb';

export type ParserName =
  | 'parsePy'
  | 'parseSphinxGallery'
  | 'parseClassicMd'
  | 'parseMystMd';

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
}

export const PARSERS: Record<ParserName, (text: string) => object> = {
  parsePy,
  parseSphinxGallery,
  parseClassicMd,
  parseMystMd
};

export const PARSER_LABELS: Record<ParserName, string> = {
  parsePy: 'Percent format (.py)',
  parseSphinxGallery: 'Sphinx Gallery (.py)',
  parseClassicMd: 'Classic Markdown (.md)',
  parseMystMd: 'MyST Notebook (.md)'
};

export const PARSER_EXTENSIONS: Record<ParserName, string[]> = {
  parsePy: ['.py'],
  parseSphinxGallery: ['.py'],
  parseClassicMd: ['.md'],
  parseMystMd: ['.md']
};
