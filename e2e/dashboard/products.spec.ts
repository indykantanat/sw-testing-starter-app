import { test, expect } from '@playwright/test';

// กลุ่มทดสอบหน้าจัดการสินค้า
test.describe('Products Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/products');
    // รอโหลดสินค้า
    await page.waitForResponse((res) =>
      res.url().includes('/api/admin/products') && res.status() === 200
    );
  });

  // ทดสอบว่าหน้าจัดการสินค้าแสดงหัวข้อพร้อมจำนวนรายการ
  test('should display products management page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'จัดการสินค้า' })).toBeVisible();
    await expect(page.getByText(/หน้า \d+ จาก \d+ \(\d+ รายการ\)/)).toBeVisible();
  });

  // ทดสอบว่าตารางสินค้าแสดงคอลัมน์ที่ถูกต้องครบถ้วน
  test('should display products table with correct columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'รหัส' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ชื่อสินค้า' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'หมวดหมู่' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ราคา' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'เครื่องมือ' })).toBeVisible();
  });

  // ทดสอบว่าค้นหาสินค้าตามชื่อแล้วแสดงผลลัพธ์ถูกต้อง
  test('should search products by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('ค้นหาชื่อสินค้า...');
    await searchInput.fill('test_nonexistent_product_xyz');

    // รอ debounce 400ms
    await page.waitForTimeout(600);
    await expect(page.getByText('ไม่พบสินค้า')).toBeVisible();
  });

  // ทดสอบว่าสามารถล้างคำค้นหาได้
  test('should clear search query', async ({ page }) => {
    const searchInput = page.getByPlaceholder('ค้นหาชื่อสินค้า...');
    await searchInput.fill('test_nonexistent_product_xyz');
    await page.waitForTimeout(600);
    await expect(page.getByText('ไม่พบสินค้า')).toBeVisible();

    await searchInput.clear();
    await page.waitForTimeout(600);

    await expect(searchInput).toHaveValue('');
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  // ทดสอบว่าเปิด dialog เพิ่มสินค้าใหม่พร้อมแสดง form ครบ
  test('should open add product dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'เพิ่มสินค้า' }).click();

    await expect(page.getByRole('heading', { name: 'เพิ่มสินค้า' })).toBeVisible();
    await expect(page.locator('#product-name')).toBeVisible();
    await expect(page.locator('#product-price')).toBeVisible();
    await expect(page.locator('#product-category')).toBeVisible();
  });

  // ทดสอบว่าแสดง validation error เมื่อเพิ่มสินค้าโดยไม่กรอกข้อมูล
  test('should validate required fields on add', async ({ page }) => {
    await page.getByRole('button', { name: 'เพิ่มสินค้า' }).click();

    // Submit empty form
    await page.getByRole('button', { name: 'บันทึก' }).click();

    await expect(page.getByText('กรุณากรอกชื่อสินค้า')).toBeVisible();
    await expect(page.getByText('ราคาต้องมากกว่า 0')).toBeVisible();
    await expect(page.getByText('กรุณาเลือกหมวดหมู่')).toBeVisible();
  });

  // ทดสอบว่าเปิด dialog แก้ไขสินค้าแล้วแสดงข้อมูลเดิมที่กรอกไว้
  test('should open edit product dialog with pre-filled data', async ({ page }) => {
    // กดปุ่ม edit ของสินค้าแรก
    const editBtn = page.locator('table tbody tr').first()
      .getByRole('button', { name: /^แก้ไข/ });
    await editBtn.click();

    await expect(page.getByRole('heading', { name: 'แก้ไขสินค้า' })).toBeVisible();
    // ช่อง name ต้องมีค่า
    await expect(page.locator('#product-name')).not.toHaveValue('');
  });

  // ทดสอบว่าแก้ไขสินค้าสำเร็จ
  test('should edit product successfully', async ({ page }) => {
    const editBtn = page.locator('table tbody tr').first()
      .getByRole('button', { name: /^แก้ไข/ });
    await editBtn.click();

    // แก้ไขชื่อ
    const nameInput = page.locator('#product-name');
    const originalName = await nameInput.inputValue();
    await nameInput.clear();
    await nameInput.fill(originalName); // เปลี่ยนกลับเหมือนเดิม
    await page.getByRole('button', { name: 'บันทึก' }).click();

    await expect(page.getByText('แก้ไขสินค้าสำเร็จ')).toBeVisible({ timeout: 10_000 });
  });

  // ทดสอบว่ากดยกเลิกแล้ว dialog ปิดโดยไม่บันทึกข้อมูล
  test('should cancel form without saving', async ({ page }) => {
    await page.getByRole('button', { name: 'เพิ่มสินค้า' }).click();
    await page.locator('#product-name').fill('Should Not Save');

    await page.getByRole('button', { name: 'ยกเลิก' }).click();

    // Dialog ปิด
    await expect(page.getByRole('heading', { name: 'เพิ่มสินค้า' })).not.toBeVisible();
    // สินค้าไม่ปรากฏใน table
    await expect(page.getByText('Should Not Save')).not.toBeVisible();
  });

  // ทดสอบว่าเปลี่ยนหน้าสินค้าด้วยปุ่มถัดไป/ก่อนหน้าได้
  test('should paginate to next and previous page', async ({ page }) => {
    const status = page.getByText(/หน้า \d+ จาก \d+ \(\d+ รายการ\)/);
    await expect(status).toContainText('หน้า 1 จาก');

    await page.getByRole('button').filter({ has: page.locator('svg.lucide-chevron-right') }).click();
    await expect(status).toContainText('หน้า 2 จาก');

    await page.getByRole('button').filter({ has: page.locator('svg.lucide-chevron-left') }).click();
    await expect(status).toContainText('หน้า 1 จาก');
  });

  // กลุ่มทดสอบสินค้าจริง (เพิ่ม/ลบใน DB ต้องรันแบบ serial)
  // CRUD tests ต้องรัน serial เพราะสร้างและลบสินค้าใน DB
  test.describe('Product CRUD', () => {
    test.describe.configure({ mode: 'serial' });

    const productName = `E2E Test Product ${Date.now()}`;

    // ทดสอบว่าเพิ่มสินค้าใหม่สำเร็จและแสดงในตาราง
    test('should add new product successfully', async ({ page }) => {
      await page.getByRole('button', { name: 'เพิ่มสินค้า' }).click();

      await page.locator('#product-name').fill(productName);
      await page.locator('#product-price').fill('100');
      await page.locator('#product-category').click();
      await page.getByRole('option').first().click();
      await page.getByRole('button', { name: 'บันทึก' }).click();

      await expect(page.getByText('เพิ่มสินค้าสำเร็จ')).toBeVisible({ timeout: 10_000 });

      // ตรวจว่าสินค้าปรากฏใน table (เรียงจาก id ล่าสุด จึงอยู่แถวแรก)
      await expect(page.getByText(productName)).toBeVisible();
    });

    // ทดสอบว่าลบสินค้าที่เพิ่งเพิ่มออกได้ และข้อมูลไม่ค้างใน DB
    test('should delete the product created above', async ({ page }) => {
      await page.getByPlaceholder('ค้นหาชื่อสินค้า...').fill(productName);
      await page.waitForTimeout(600);

      const row = page.locator('table tbody tr').first();
      await expect(row).toContainText(productName);

      await row.getByRole('button', { name: /^ลบ/ }).click();

      await expect(page.getByRole('heading', { name: 'ยืนยันการลบสินค้า' })).toBeVisible();
      await page.getByRole('button', { name: 'ลบสินค้า' }).click();

      await expect(page.getByText(`ลบ "${productName}" แล้ว`)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('ไม่พบสินค้า')).toBeVisible();
    });
  });
});
