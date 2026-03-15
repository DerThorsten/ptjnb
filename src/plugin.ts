import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { showDialog, Dialog } from '@jupyterlab/apputils';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { PageConfig } from '@jupyterlab/coreutils';
import { MenuSvg } from '@jupyterlab/ui-components';
import { PARSERS, PARSER_LABELS, PARSER_EXTENSIONS } from './parsers';
import type {
  ParserName,
  IPlainTextNotebookConfig,
  IKernelspec
} from './parsers';
import { convertFile, autoConvert } from './convert';

export const plugin: JupyterFrontEndPlugin<void> = {
  id: 'ptjnb:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: async (
    app: JupyterFrontEnd,
    browserFactory: IFileBrowserFactory
  ) => {
    console.log('ptjnb extension activated!');
    const { commands, contextMenu } = app;

    const cfgStr = PageConfig.getOption('plainTextNotebookConfig');
    let cfg: IPlainTextNotebookConfig = {};
    try {
      cfg = cfgStr ? JSON.parse(cfgStr) : {};
    } catch {
      console.error('ptjnb: invalid plainTextNotebookConfig JSON');
    }
    const defaultKernelspec: IKernelspec | undefined = cfg.defaultKernelspec;

    const getCurrentBrowser = () => browserFactory.tracker.currentWidget;

    (Object.keys(PARSERS) as ParserName[]).forEach(parserName => {
      const commandId = `ptjnb:convert-${parserName}`;
      const parser = PARSERS[parserName];
      const exts = PARSER_EXTENSIONS[parserName];

      commands.addCommand(commandId, {
        label: PARSER_LABELS[parserName],
        isVisible: () => {
          const browser = getCurrentBrowser();
          if (!browser) {
            return false;
          }
          const selection = browser.selectedItems();
          const first = selection.next();
          if (first.done || !first.value) {
            return false;
          }
          return exts.some(ext => first.value.path.endsWith(ext));
        },
        execute: async () => {
          const browser = getCurrentBrowser();
          if (!browser) {
            return;
          }
          const selection = browser.selectedItems();
          const first = selection.next();
          if (first.done || !first.value) {
            return;
          }
          const filePath = first.value.path;
          const notebookPath = filePath.replace(/\.(py|md)$/, '.ipynb');
          const contents = app.serviceManager.contents;
          try {
            let fileExists = false;
            try {
              await contents.get(notebookPath, { content: false });
              fileExists = true;
            } catch {
              /* empty */
            }
            if (fileExists) {
              const result = await showDialog({
                title: 'Overwrite notebook?',
                body: `"${notebookPath}" already exists. Overwrite it?`,
                buttons: [
                  Dialog.cancelButton(),
                  Dialog.warnButton({ label: 'Overwrite' })
                ]
              });
              if (!result.button.accept) {
                return;
              }
            }
            await convertFile(contents, filePath, parser, defaultKernelspec);
          } catch (e) {
            console.error('ptjnb: conversion failed', e);
          }
        }
      });
    });

    const submenu = new MenuSvg({ commands });
    submenu.title.label = 'Convert to Notebook';
    submenu.addItem({ command: 'ptjnb:convert-parsePy' });
    submenu.addItem({ command: 'ptjnb:convert-parseSphinxGallery' });
    submenu.addItem({ command: 'ptjnb:convert-parseClassicMd' });
    submenu.addItem({ command: 'ptjnb:convert-parseMystMd' });

    contextMenu.addItem({
      type: 'submenu',
      submenu,
      selector: '.jp-DirListing-item[data-isdir="false"]',
      rank: 10
    });

    if (cfg.rules?.length) {
      await autoConvert(
        app.serviceManager.contents,
        cfg.rules,
        defaultKernelspec
      );
    }
  }
};
