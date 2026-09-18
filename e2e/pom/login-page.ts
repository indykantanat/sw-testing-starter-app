import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("login-email");
    this.passwordInput = page.getByTestId("login-password");
    this.submitButton = page.getByTestId("login-submit");
    this.errorToast = page.locator(".Toastify__toast--error");
  }

  async goto() {
    await this.page.goto("/login");
    // รอให้ React hydrate ฟอร์มก่อน ไม่งั้นค่าที่พิมพ์ในช่องแรกจะโดนรีเซ็ตทิ้งตอน hydrate
    await this.page.waitForLoadState("networkidle");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoginSuccess(name?: string) {
    await expect(this.page).toHaveURL("/");
    const navUserName = this.page.getByTestId("nav-user-name");
    if (name) {
      await expect(navUserName).toContainText(name);
    } else {
      await expect(navUserName).toBeVisible();
    }
  }

  async expectLoginError() {
    await expect(this.errorToast).toBeVisible();
    await expect(this.page).toHaveURL("/login");
  }
}
