import { parsePy } from 'plainb';
import { PARSERS } from '../parsers';
import { convertIfMissing } from '../convert';

describe('PARSERS registry', () => {
  it('contains all 4 parsers and each is a function', () => {
    expect(typeof PARSERS.parsePy).toBe('function');
    expect(typeof PARSERS.parseSphinxGallery).toBe('function');
    expect(typeof PARSERS.parseClassicMd).toBe('function');
    expect(typeof PARSERS.parseMystMd).toBe('function');
  });
});

describe('parsePy smoke test', () => {
  it('produces a valid nbformat 4.5 notebook with cell ids', () => {
    const nb = parsePy('# %%\nx = 1') as any;
    expect(nb.nbformat).toBe(4);
    expect(nb.nbformat_minor).toBe(5);
    expect(Array.isArray(nb.cells)).toBe(true);
    expect(nb.cells.length).toBeGreaterThan(0);
    for (const cell of nb.cells) {
      expect(typeof cell.id).toBe('string');
      expect(cell.id.length).toBeGreaterThan(0);
    }
  });
});

describe('convertIfMissing', () => {
  it('skips conversion when .ipynb already exists', async () => {
    const get = jest.fn().mockResolvedValue({});
    const save = jest.fn();
    const contents = { get, save } as any;
    const parser = jest.fn();

    await convertIfMissing(contents, 'notebooks/foo.py', parser);

    expect(get).toHaveBeenCalledWith('notebooks/foo.ipynb', { content: false });
    expect(parser).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('converts when .ipynb is missing', async () => {
    const get = jest
      .fn()
      .mockRejectedValueOnce(new Error('not found'))
      .mockResolvedValueOnce({ content: '# %%\nx = 1' });
    const save = jest.fn().mockResolvedValue({});
    const contents = { get, save } as any;
    const fakeNotebook = { nbformat: 4, cells: [] };
    const parser = jest.fn().mockReturnValue(fakeNotebook);

    await convertIfMissing(contents, 'notebooks/foo.py', parser);

    expect(parser).toHaveBeenCalledWith('# %%\nx = 1');
    expect(save).toHaveBeenCalledWith('notebooks/foo.ipynb', {
      type: 'notebook',
      format: 'json',
      content: fakeNotebook
    });
  });
});
