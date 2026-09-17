import { expect, test } from "@playwright/test";

test("login successfully when valid credentials are provided", async ({ page }) => {
  const name = "Login Test User";
  const email = `login-${Date.now()}@example.com`;
  const password = "P@ssw0rd123";

  // สมัครสมาชิกใหม่ก่อน เพื่อให้มี credential ที่ใช้ล็อกอินได้แน่นอน
  await page.goto("http://localhost:3000/signup");
  await page.getByTestId("signup-name").fill(name);
  await page.getByTestId("signup-email").fill(email);
  await page.getByTestId("signup-password").fill(password);
  await page.getByTestId("signup-confirm-password").fill(password);
  await page.getByTestId("signup-submit").click();
  await expect(page).toHaveURL("http://localhost:3000/login");

  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL("http://localhost:3000/");
  await expect(page.getByTestId("nav-user-name")).toContainText(name);
});

test("shows an error toast when credentials are invalid", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.getByTestId("login-email").fill(`no-such-user-${Date.now()}@example.com`);
  await page.getByTestId("login-password").fill("WrongPassword123");
  await page.getByTestId("login-submit").click();

  await expect(page.locator(".Toastify__toast--error")).toBeVisible();
  await expect(page).toHaveURL("http://localhost:3000/login");
});
