import { expect, test } from "@playwright/test";

test("signup successfully with valid data", async ({ page }) => {
  const name = "Signup Test User";
  const email = `signup-${Date.now()}@example.com`;
  const password = "P@ssw0rd123";

  await page.goto("http://localhost:3000/signup");
  // รอให้ React hydrate ฟอร์มก่อน ไม่งั้นค่าที่พิมพ์ในช่องแรกจะโดนรีเซ็ตทิ้งตอน hydrate
  await page.waitForLoadState("networkidle");
  await page.getByTestId("signup-name").fill(name);
  await page.getByTestId("signup-email").fill(email);
  await page.getByTestId("signup-password").fill(password);
  await page.getByTestId("signup-confirm-password").fill(password);
  await page.getByTestId("signup-submit").click();

  // สมัครสำเร็จแล้ว auto redirect ไปหน้า login (autoSignIn ปิดอยู่)
  await expect(page).toHaveURL("http://localhost:3000/login");
});

test("shows validation error when passwords do not match", async ({ page }) => {
  await page.goto("http://localhost:3000/signup");
  await page.waitForLoadState("networkidle");
  await page.getByTestId("signup-name").fill("Mismatch Test User");
  await page.getByTestId("signup-email").fill(`mismatch-${Date.now()}@example.com`);
  await page.getByTestId("signup-password").fill("P@ssw0rd123");
  await page.getByTestId("signup-confirm-password").fill("SomethingElse123");
  await page.getByTestId("signup-submit").click();

  await expect(page.getByText("รหัสผ่านไม่ตรงกัน")).toBeVisible();
  await expect(page).toHaveURL("http://localhost:3000/signup");
});
