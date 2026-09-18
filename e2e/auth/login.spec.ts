import { test, expect } from '@playwright/test';
import { LoginPage } from '../pom/login-page';

// ไม่ใช้ auth state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Page', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({page}) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('should display login form', async ({page}) => {
       await expect(page.locator('div').filter({ hasText: /^เข้าสู่ระบบ$/ })).toBeVisible();
       await expect(page.getByText('กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ')).toBeVisible();
       await expect(loginPage.emailInput).toBeVisible();
       await expect(loginPage.passwordInput).toBeVisible();
       await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
    });

    // ทดสอบว่าแสดง validation error เมื่อกดเข้าสู่ระบบโดยไม่กรอกอะไรเลย
    test('should show validation for empty fields', async ({page}) => {
        await loginPage.submitButton.click();

        await expect(page.getByText('กรุณากรอกอีเมล')).toBeVisible();
        await expect(page.getByText('กรุณากรอกรหัสผ่าน')).toBeVisible();
    });

    // ทดสอบว่าแสดง validation error เมื่อกรอกรหัสผ่านสั้นกว่าที่กำหนด
    test('should show validation for short password', async ({page}) => {
        await loginPage.emailInput.fill('someone@example.com');
        await loginPage.passwordInput.fill('123');
        await loginPage.submitButton.click();

        await expect(page.getByText('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')).toBeVisible();
    });

    // มีลิงก์ไปหน้าสมัครสมาชิก และสามารถคลิกไปได้
    test('should have link to can click to signup page', async ({page}) => {
        const signupLink = loginPage.signupLink;
        await expect(signupLink).toBeVisible();
        await signupLink.click();
        await page.waitForURL('/signup');
    });

    test('should login successfully with valid credentials', async ({page}) => {
        await loginPage.login(process.env.ADMIN_USER!, process.env.ADMIN_PASSWORD!);
        await expect(page).toHaveURL('/');
    });
});
