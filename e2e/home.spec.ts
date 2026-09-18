import { expect, test } from "@playwright/test";

// ไม่ใช่ auth state    ไม่ต้องลอคอิน  เอาไปวางที่ไฟล์ test/ page ที่ไม่ต้องการลอคอิน
test.use({ storageState:{ cookies: [], origins:[] } });

test("test logo is visible on homepage", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  const logo = page.getByRole("img", { name: "โลโก้ Next.js" });
  await expect(logo).toBeVisible();
});

test("verify login navigation link from homepage", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  const loginLink = page.getByRole("link", { name: "เข้าสู่ระบบ" });
  await expect(loginLink).toBeVisible();
  await loginLink.click();
  await expect(page).toHaveURL("http://localhost:3000/login");
});


