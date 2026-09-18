import { expect, test } from "@playwright/test";
import { LoginPage } from "./pom/login-page";

test("login successfully when valid credentials are provided", async ({ page }) => {
  const name = "Login Test User";
  const email = `login-${Date.now()}@example.com`;
  const password = "P@ssw0rd123";

  // สมัครสมาชิกใหม่ก่อน เพื่อให้มี credential ที่ใช้ล็อกอินได้แน่นอน
  await page.goto("http://localhost:3000/signup");
  await page.waitForLoadState("networkidle");
  await page.getByTestId("signup-name").fill(name);
  await page.getByTestId("signup-email").fill(email);
  await page.getByTestId("signup-password").fill(password);
  await page.getByTestId("signup-confirm-password").fill(password);
  await page.getByTestId("signup-submit").click();
  await expect(page).toHaveURL("http://localhost:3000/login");

  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);
  await loginPage.expectLoginSuccess(name);
});

test("shows an error toast when credentials are invalid", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(`no-such-user-${Date.now()}@example.com`, "WrongPassword123");
  await loginPage.expectLoginError();
});
