import { test, expect } from '@playwright/test';

// กลุ่มทดสอบหน้า Dashboard หลัก (ภาพรวมร้าน)
test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    // รอโหลดตัวเลขสรุป
    await page.waitForResponse((res) =>
      res.url().includes('/api/admin/stats') && res.status() === 200
    );
  });

  // ทดสอบว่าแสดงหัวข้อของหน้าภาพรวมร้าน
  test('should display dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'ภาพรวมร้าน' })).toBeVisible();
  });

  // ทดสอบว่าแสดงการ์ดสรุป 4 ใบ (ยอดขายรวม, คำสั่งซื้อ, สินค้า, ลูกค้า)
  test('should display four KPI cards', async ({ page }) => {
    await expect(page.getByText('ยอดขายรวม', { exact: true })).toBeVisible();
    await expect(page.getByText('คำสั่งซื้อ', { exact: true })).toBeVisible();
    await expect(page.getByText('สินค้า', { exact: true })).toBeVisible();
    await expect(page.getByText('ลูกค้า', { exact: true }).first()).toBeVisible();
  });

  // ทดสอบว่าแสดงการ์ดกราฟยอดขายพร้อมปุ่มเลือกช่วงเวลา (7, 30, 90 วัน)
  test('should display revenue chart with period buttons', async ({ page }) => {
    await expect(page.getByText('ยอดขาย', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '7 วัน' })).toBeVisible();
    await expect(page.getByRole('button', { name: '30 วัน' })).toBeVisible();
    await expect(page.getByRole('button', { name: '90 วัน' })).toBeVisible();
  });

  // ทดสอบว่าเปลี่ยนช่วงเวลาของกราฟแล้วยิง API ใหม่และปุ่มถูกเลือก
  test('should switch revenue period', async ({ page }) => {
    const responsePromise = page.waitForResponse((res) =>
      res.url().includes('/api/admin/revenue?period=90d') && res.status() === 200
    );
    await page.getByRole('button', { name: '90 วัน' }).click();
    await responsePromise;

    await expect(page.getByRole('button', { name: '90 วัน' })).toHaveAttribute('aria-pressed', 'true');
  });

  // ทดสอบว่าแสดงการ์ดคำสั่งซื้อล่าสุดพร้อมหัวตาราง
  test('should display recent orders card', async ({ page }) => {
    await page.waitForResponse((res) =>
      res.url().includes('/api/admin/orders') && res.status() === 200
    );

    await expect(page.getByText('คำสั่งซื้อล่าสุด')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'วันที่' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ลูกค้า' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'สถานะ' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ยอดรวม' })).toBeVisible();
  });

  // ทดสอบว่าคลิกเมนู "จัดการสินค้า" แล้วนำทางไปหน้าจัดการสินค้า
  test('should navigate to products page from nav', async ({ page }) => {
    await page.getByRole('link', { name: 'จัดการสินค้า' }).click();
    await page.waitForURL('/admin/products');
  });

  // ทดสอบว่าคลิก "กลับหน้าร้าน" แล้วนำทางกลับหน้าแรกของร้าน
  test('should navigate back to shop', async ({ page }) => {
    await page.getByRole('link', { name: 'กลับหน้าร้าน' }).click();
    await page.waitForURL('/');
  });
});
