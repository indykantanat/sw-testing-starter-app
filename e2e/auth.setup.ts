import { test, expect } from '@playwright/test';
import { authFile } from '../playwright.config';

// ล็อกอินเป็น admin และบันทึก session เพื่อนำไปใช้กับ test อื่นๆ
test('authen as admin', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const email = page.getByRole('textbox', { name: 'อีเมล' });
    const password = page.getByRole('textbox', { name: 'รหัสผ่าน'});
    await email.fill(process.env.ADMIN_USER!);
    await password.fill(process.env.ADMIN_PASSWORD!);
    const submitBtn = page.getByRole('button', { name: 'เข้าสู่ระบบ' });
    await submitBtn.click();
    await page.waitForURL('/');
    await expect(page.getByTestId('nav-user-name')).toBeVisible();

    await page.context().storageState({ path: authFile });
})