import { expect, test, type Page } from '@playwright/test';

const FILE_BROWSER_TIMEOUT = 30000;
const CONVERT_TIMEOUT = 15000;

async function waitForFileBrowser(page: Page): Promise<void> {
  await page.waitForSelector('.jp-DirListing', {
    timeout: FILE_BROWSER_TIMEOUT
  });
}

function fileItem(page: Page, name: string) {
  return page.locator('.jp-DirListing-item').filter({ hasText: name }).first();
}

async function openConvertSubmenu(page: Page, fileName: string): Promise<void> {
  await fileItem(page, fileName).click({ button: 'right' });
  await page
    .locator('.lm-Menu-itemLabel')
    .filter({ hasText: 'Convert to Notebook' })
    .hover();
}

test.describe('ptjnb', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForFileBrowser(page);
  });

  test('auto-convert creates .ipynb files on startup', async ({ page }) => {
    await fileItem(page, 'percent').dblclick();
    await expect(fileItem(page, 'numpy_demo.ipynb')).toBeVisible({
      timeout: CONVERT_TIMEOUT
    });
    await expect(page).toHaveScreenshot('auto-convert-result.png');
  });

  test('right-click shows Convert to Notebook submenu for .py file', async ({
    page
  }) => {
    await fileItem(page, 'complicated.py').click({ button: 'right' });
    await expect(
      page
        .locator('.lm-Menu-itemLabel')
        .filter({ hasText: 'Convert to Notebook' })
    ).toBeVisible();
    await expect(page).toHaveScreenshot('context-menu.png');
  });

  test('converts .py to .ipynb when no sibling exists', async ({ page }) => {
    await openConvertSubmenu(page, 'complicated.py');
    await page
      .locator('.lm-Menu-itemLabel')
      .filter({ hasText: 'Percent format (.py)' })
      .click();
    await expect(fileItem(page, 'complicated.ipynb')).toBeVisible({
      timeout: CONVERT_TIMEOUT
    });
    await expect(page).toHaveScreenshot('after-convert.png');
  });

  test('overwrite dialog appears when .ipynb already exists', async ({
    page
  }) => {
    await fileItem(page, 'percent').dblclick();
    await expect(fileItem(page, 'numpy_demo.ipynb')).toBeVisible({
      timeout: CONVERT_TIMEOUT
    });
    await openConvertSubmenu(page, 'numpy_demo.py');
    await page
      .locator('.lm-Menu-itemLabel')
      .filter({ hasText: 'Percent format (.py)' })
      .click();
    await expect(page.locator('.jp-Dialog-header')).toContainText(
      'Overwrite notebook?'
    );
    await expect(page).toHaveScreenshot('overwrite-dialog.png');
  });

  test('cancel on overwrite dialog leaves notebook unchanged', async ({
    page
  }) => {
    await fileItem(page, 'percent').dblclick();
    await expect(fileItem(page, 'numpy_demo.ipynb')).toBeVisible({
      timeout: CONVERT_TIMEOUT
    });
    await openConvertSubmenu(page, 'numpy_demo.py');
    await page
      .locator('.lm-Menu-itemLabel')
      .filter({ hasText: 'Percent format (.py)' })
      .click();
    await expect(page.locator('.jp-Dialog')).toBeVisible();
    await page.locator('.jp-Dialog-footer .jp-mod-reject').click();
    await expect(page.locator('.jp-Dialog')).toBeHidden();
    await expect(fileItem(page, 'numpy_demo.ipynb')).toBeVisible();
    await expect(page).toHaveScreenshot('after-cancel.png');
  });
});
