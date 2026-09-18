import { test } from '@playwright/test';
import { authFile } from '../playwright.config';
import { LoginPage } from './pom/login-page';

// ล็อกอินเป็น admin และบันทึก session เพื่อนำไปใช้กับ test อื่นๆ
test('authen as admin', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_USER!, process.env.ADMIN_PASSWORD!);
    await loginPage.expectLoginSuccess();

    await page.context().storageState({ path: authFile });
})
