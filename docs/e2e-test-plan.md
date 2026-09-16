# E2E Test Plan (Playwright)

สถานะปัจจุบัน: ยังไม่มี E2E framework ติดตั้งในโปรเจกต์ (Vitest/Testing Library ถูกถอดออกไปโดยตั้งใจ) เอกสารนี้เป็นแผนก่อนเริ่มเขียนโค้ดจริง — ครอบคลุม scope, การเตรียมข้อมูลทดสอบ, และ test case ต่อ flow

## 1. เป้าหมายและขอบเขต

ทดสอบ flow หลักของแอปแบบ end-to-end ผ่านเบราว์เซอร์จริง โดยใช้ `data-testid` เป็น selector หลักตามที่ระบุไว้ใน README.md (ห้ามจับข้อความภาษาไทยที่เปลี่ยนบ่อย)

ครอบคลุม 4 กลุ่ม: **หน้าร้าน** (home/product/cart), **auth** (signup/login/logout), **contact form**, **admin** (dashboard + product management)

ไม่ครอบคลุม: unit/integration test ของ `src/lib/**` (ไม่มี test framework แล้ว, ถ้าต้องการ ให้แยกเป็นแผนอื่น), load/performance testing

## 2. เครื่องมือและโครงสร้าง

- **Playwright** (`@playwright/test`) — รองรับ multi-browser, auto-wait, trace viewer, เข้ากับ Next.js ปัจจุบันได้ดี
- โครงสร้างที่แนะนำ (ยังไม่มีอยู่จริง ต้องสร้างตอน implement):
  ```
  e2e/
    fixtures/
      auth.ts          # storageState helper: signup/login ครั้งเดียว แล้ว reuse session
      admin.ts          # helper สำหรับ promote user เป็น admin ใน test.db
    shop.spec.ts
    cart.spec.ts
    auth.spec.ts
    contact.spec.ts
    course.spec.ts
    admin-guard.spec.ts
    admin-dashboard.spec.ts
    admin-products.spec.ts
  playwright.config.ts
  ```
- `playwright.config.ts` ควรใช้ `webServer` สั่ง `next dev` (หรือ `next start` หลัง build) โดยตั้ง `DATABASE_URL="file:./prisma/test.db"` ผ่าน env ก่อนสตาร์ต ไม่ใช่ค่า default ที่ชี้ `dev.db`

## 3. เตรียมข้อมูลทดสอบ

- รัน `npm run db:test:setup` ก่อน suite เพื่อสร้าง `prisma/test.db` พร้อมสินค้าตัวอย่าง 50 รายการ (แยกจาก `prisma/dev.db` โดยเจตนา)
- **ยังไม่มีสคริปต์ seed ผู้ใช้/แอดมินสำหรับ test.db** — `setup-test-db.mjs` ใส่แค่ตาราง e-commerce ไม่แตะ Better Auth tables และแอปนี้ไม่มีทาง promote เป็นแอดมินผ่าน UI (by design ตาม CLAUDE.md) ดังนั้นก่อนเขียนเทส admin ต้องตัดสินใจอย่างใดอย่างหนึ่ง:
  1. เพิ่ม global setup script ที่ signup ผู้ใช้ทดสอบผ่าน UI/API จริง แล้ว `UPDATE user SET role='admin'` ตรงใน `test.db` ด้วย `better-sqlite3` (แพทเทิร์นเดียวกับที่ README อธิบายไว้สำหรับ dev.db)
  2. หรือ insert user/session แถวตรง ๆ ลง `test.db` โดยเลียนแบบ schema ของ Better Auth (เสี่ยงหลุด sync ถ้า schema เปลี่ยน)
  
  แนะนำแบบ (1) เพราะใช้ path เดียวกับที่แอปจริงรองรับ (signup แล้ว sign out/in ใหม่เพื่อให้ session อ่าน role ใหม่)
- `npm run db:seed:orders` (ชี้ไป `prisma/test.db` ผ่าน argument) จำเป็นสำหรับเทส dashboard เพราะข้อมูลใน `docs/` เป็นวันที่ fix ที่จะหลุดช่วง 7/30/90 วันตามเวลาจริง
- Cart ใช้ `localStorage` (`skill-cart`) ไม่ใช่ DB — แต่ละ test ต้องเริ่มจาก context ใหม่ (Playwright `browser.newContext()` ต่อ test file ก็พอ เพราะ default คือ isolate อยู่แล้ว) หรือ `page.evaluate(() => localStorage.clear())` ก่อนเริ่ม

## 4. Environment ที่ต้องตั้งก่อนรัน

| ตัวแปร | ทำไมต้องมี |
|---|---|
| `DATABASE_URL=file:./prisma/test.db` | กันไม่ให้เทสไปเพิ่ม/ลบข้อมูลใน `dev.db` |
| `COURSE_API_URL` | ชี้ไป mock server หรือปล่อยว่างแล้ว intercept ที่ network layer ของ Playwright (`page.route`) โดยใช้ข้อมูลจาก `docs/fixtures/courses.json` — อย่าพึ่ง `api.codingthailand.com` จริงใน CI |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | ถ้าไม่ตั้ง contact form จะคืน error message ภาษาไทยเสมอ (ไม่ throw) — ต้องตัดสินใจว่าจะเทสเส้นทาง success จริง (ต้องมีคีย์ทดสอบ) หรือเทสแค่เส้นทาง error ที่ deterministic กว่า |
| `BETTER_AUTH_SECRET` | ต้องมีค่า ไม่งั้น build จะ fail (`next dev` รันได้แต่ไม่ควรพึ่ง default) |

## 5. Selector ground truth

อย่า hardcode รายการ testid ในเอกสารนี้ซ้ำ (README.md มีอยู่แล้วและอาจตกยุค) ให้รันตรวจก่อนเขียนเทสทุกครั้ง:
```bash
grep -rho 'data-testid="[^"]*"' src | sort -u
```
ข้อสังเกตจากการตรวจจริงตอนวางแผนนี้:
- ส่วน async ของ admin (`stats`, `revenue`, `recent-orders`, `product-table`) สร้าง testid แบบ dynamic ผ่าน `AsyncSection` (`${id}-loading` / `${id}-error` / `${id}-retry`) grep ตรง ๆ จะไม่เจอ ต้องดูที่ `src/app/admin/components/AsyncSection.tsx` และค่า `testId=` ที่แต่ละ section ส่งเข้าไป
- `cart-checkout` ไม่ได้สร้าง order จริงในฝั่ง backend — แค่ `clearCart()` แล้ว `router.replace("/product")` (`CartList.tsx:19-22`) เทสอย่าคาดหวัง order record ใน DB จาก flow นี้

## 6. Test Suites

Priority: **P0** = ต้องผ่านก่อน merge ทุกครั้ง, **P1** = รันใน CI แต่ไม่ block, **P2** = nice-to-have / edge case

### 6.1 หน้าแรก & navigation
| ID | Priority | Scenario | testid หลัก |
|---|---|---|---|
| HOME-1 | P0 | หน้าแรกโหลดแล้วเห็นสินค้าแนะนำ | `featured-product-list`, `featured-product-card` |
| NAV-1 | P1 | ยังไม่ล็อกอิน เห็นปุ่ม login/signup ใน nav | `nav-login`, `nav-signup` |
| NAV-2 | P1 | ล็อกอินแล้ว เห็นชื่อผู้ใช้แทนปุ่ม login | `nav-user-name` |

### 6.2 Product catalog / search
| ID | Priority | Scenario | testid หลัก |
|---|---|---|---|
| PROD-1 | P0 | เข้าหน้า `/product` เห็นรายการสินค้า | `product-list`, `product-card`, `product-name`, `product-price` |
| PROD-2 | P0 | ค้นหาด้วยคำที่มีผลลัพธ์ → filter รายการ | `product-search-input`, `product-search-submit` |
| PROD-3 | P1 | ค้นหาคำที่ไม่มีผลลัพธ์ → แสดง empty state | `product-empty` |
| PROD-4 | P1 | เปลี่ยนหน้า (pagination) แล้วรายการเปลี่ยน + ปุ่ม prev/next enable/disable ถูกต้องที่หน้าแรก/หน้าสุดท้าย | `product-next-page`, `product-prev-page`, `product-pagination-status` |
| PROD-5 | P2 | สินค้าที่ไม่มีรูป (ไฟล์ไม่มีจริงใน `public/product-image/`) แสดง placeholder แทนที่จะ error | — (เช็ค `img[src]` เป็น data URI) |

### 6.3 Cart
| ID | Priority | Scenario | testid หลัก |
|---|---|---|---|
| CART-1 | P0 | กด add-to-cart จากหน้า product → `cart-count` เพิ่มขึ้น | `add-to-cart`, `cart-count` |
| CART-2 | P0 | เข้า `/cart` เห็นรายการที่เพิ่ม พร้อมราคารวมถูกต้อง | `cart-row`, `cart-item-qty`, `cart-item-total`, `cart-total` |
| CART-3 | P1 | ลบสินค้าออกทีละชิ้น → total อัปเดต, ลบหมด → เห็น empty state | `cart-remove-item`, `cart-empty` |
| CART-4 | P1 | กด "ลบสินค้าทั้งหมด" → ตะกร้าว่าง | `cart-clear` |
| CART-5 | P0 | กด checkout → ตะกร้าว่างและ redirect ไป `/product` (ไม่ใช่สร้าง order จริง — ดูหมายเหตุข้อ 5) | `cart-checkout` |
| CART-6 | P2 | ตะกร้า persist ข้าม reload หน้า (localStorage `skill-cart`) แต่นับ `0` ตอน first paint ก่อน hydrate (`useSyncExternalStore` server snapshot) | `cart-count` |

### 6.4 Auth
| ID | Priority | Scenario | testid หลัก |
|---|---|---|---|
| AUTH-1 | P0 | สมัครสมาชิกด้วยอีเมลใหม่ → สำเร็จ, session ถูกสร้าง | `signup-name`, `signup-email`, `signup-password`, `signup-confirm-password`, `signup-submit` |
| AUTH-2 | P1 | สมัครด้วยอีเมลที่มีอยู่แล้ว → API คืน 200 พร้อม `token: null` (anti-enumeration) ต้องเช็คพฤติกรรม UI จริงว่าขึ้นข้อความอะไร ไม่ใช่คาดเดาจาก error code | `signup-*` |
| AUTH-3 | P0 | ล็อกอินด้วยบัญชีที่ถูกต้อง → เห็นชื่อผู้ใช้ใน nav | `login-email`, `login-password`, `login-submit`, `nav-user-name` |
| AUTH-4 | P1 | ล็อกอินด้วยรหัสผ่านผิด → แสดง error, ไม่ redirect | `login-form` |
| AUTH-5 | P0 | ล็อกเอาท์ → nav กลับมาเป็นปุ่ม login/signup (ต้องรอ `router.refresh()`) | `logout-button`, `nav-login` |
| AUTH-6 | P2 | รหัสผ่านสั้นกว่า 8 ตัว → client-side validation error ก่อนยิง request | `signup-password` |

### 6.5 Contact form
| ID | Priority | Scenario | testid หลัก |
|---|---|---|---|
| CONTACT-1 | P0 | กรอกฟอร์มถูกต้องแล้วส่ง → เห็น success state (ต้องมี Resend env ครบ — ดูข้อ 4) | `contact-name`, `contact-message`, `contact-submit`, `contact-success` |
| CONTACT-2 | P1 | ส่งฟอร์มโดยไม่ตั้ง Resend env → เห็น error message ภาษาไทย ไม่ throw 500 | `contact-error` |
| CONTACT-3 | P2 | Honeypot field ถูกเติมค่า (บอทจำลอง) → ฟอร์ม reject แบบเงียบ ๆ ไม่ใช่ error ปกติ (ดู `honeypot.ts`) | `contact-form` |

### 6.6 Course
| ID | Priority | Scenario | testid หลัก |
|---|---|---|---|
| COURSE-1 | P0 | เข้า `/course` แล้ว mock/intercept ให้คืนข้อมูลจาก `docs/fixtures/courses.json` → เห็นการ์ดคอร์ส | `course-list`, `course-card` |
| COURSE-2 | P1 | Mock ให้ API fail (500 หรือ network error) → หน้าเรนเดอร์ error state แทนที่จะ crash | `course-error` |
| COURSE-3 | P2 | Mock ให้คืน array ว่าง → empty state | `course-empty` |

### 6.7 Admin — guard
| ID | Priority | Scenario | testid หลัก |
|---|---|---|---|
| ADMIN-GUARD-1 | P0 | ไม่ได้ล็อกอิน เข้า `/admin` → redirect ไป `/login` | — (เช็ค URL) |
| ADMIN-GUARD-2 | P0 | ล็อกอินแล้วแต่ role ไม่ใช่ admin เข้า `/admin` → redirect ไป `/` | — (เช็ค URL) |
| ADMIN-GUARD-3 | P1 | เรียก API admin (`/api/admin/*`) ตรง ๆ โดยไม่มี session → 401; มี session แต่ไม่ใช่ admin → 403 | — (เช็ค response status) |

### 6.8 Admin — dashboard
ต้องมี admin user + รัน `npm run db:seed:orders` ชี้ไป `test.db` ก่อน
| ID | Priority | Scenario | testid หลัก |
|---|---|---|---|
| ADMIN-DASH-1 | P0 | เข้า dashboard เห็นค่า stats/revenue โหลดสำเร็จ (ไม่ค้างที่ loading) | `stats-loading`→หาย, `revenue-total` |
| ADMIN-DASH-2 | P1 | สลับ period selector (7d/30d/90d) → ตัวเลขเปลี่ยนตามช่วง | `period-selector` |
| ADMIN-DASH-3 | P1 | Mock API ให้ error → เห็น error state + กด retry แล้วเรียกใหม่ | `stats-error`, `stats-retry` |
| ADMIN-DASH-4 | P2 | ไม่มี order ในช่วงที่เลือก → revenue empty state | `revenue-empty` |
| ADMIN-DASH-5 | P1 | เห็นรายการ order ล่าสุดพร้อมวันที่/ยอดถูกต้อง | `recent-order-row`, `recent-order-date`, `recent-order-total` |

### 6.9 Admin — product management
| ID | Priority | Scenario | testid หลัก |
|---|---|---|---|
| ADMIN-PROD-1 | P0 | เห็นตารางสินค้าทั้งหมด พร้อม pagination | `products-admin`, `product-row`, `product-pagination` |
| ADMIN-PROD-2 | P0 | สร้างสินค้าใหม่ผ่านฟอร์ม → ปรากฏในตาราง | `product-create`, `product-form`, `product-name-input`, `product-price-input`, `product-form-submit` |
| ADMIN-PROD-3 | P0 | แก้ไขสินค้าที่มีอยู่ → ค่าที่แก้ไข reflect ในตาราง | `product-edit` |
| ADMIN-PROD-4 | P0 | ลบสินค้าที่ไม่มี order ผูกอยู่ → ยืนยัน dialog แล้วหายจากตาราง | `product-delete`, `delete-dialog`, `delete-confirm` |
| ADMIN-PROD-5 | P1 | ยกเลิกการลบ (`delete-cancel`) → สินค้ายังอยู่ | `delete-cancel` |
| ADMIN-PROD-6 | P1 | ลบสินค้าที่มี `order_items` อ้างอิงอยู่ → คืน 409 พร้อมข้อความภาษาไทย ไม่ crash (FK คือ `onDelete: NoAction`) | `delete-dialog-message` |
| ADMIN-PROD-7 | P2 | ค้นหาสินค้าในตาราง admin | `product-search` |
| ADMIN-PROD-8 | P2 | Toast แสดงหลัง create/edit/delete สำเร็จ (ไม่มี testid ใช้ CSS class) | `.admin-toast-success` |

## 7. ความเสี่ยง/สิ่งที่ต้องตัดสินใจก่อน implement

1. **Admin bootstrap** — ยังไม่มีสคริปต์ promote admin ใน `test.db` ต้องสร้างก่อน (ดูข้อ 3) มิฉะนั้นกลุ่ม 6.7–6.9 เขียนไม่ได้
2. **Course API dependency** — ถ้าไม่ mock จริง เทสจะ flaky ตามอินเทอร์เน็ต/บริการภายนอก ต้องเลือก intercept ผ่าน Playwright `page.route` หรือรัน mock server แล้วตั้ง `COURSE_API_URL`
3. **Resend/contact** — ถ้าไม่มีคีย์ทดสอบจริง แนะนำเทสแค่ error path (deterministic) และ mock/route ปิด network call ฝั่ง server แทนการยิงอีเมลจริงทุกครั้งที่รัน CI
4. **`cacheComponents: true`** — ทุกหน้าที่แตะ DB มี `export const instant = false` และ `await connection()` อยู่แล้ว ไม่น่ากระทบเทส แต่ถ้าเพิ่มหน้าใหม่ที่ลืมใส่ อาจเห็นพฤติกรรม cache แปลก ๆ ระหว่างรัน suite ซ้ำ ๆ
5. **Dev server ต้องรีสตาร์ตหลัง `db push`/`setup-test-db.mjs`** — เช่นเดียวกับที่ CLAUDE.md เตือนเรื่อง `dev.db`, ถ้า Playwright `webServer` สตาร์ตก่อนรัน setup script ไฟล์ DB handle อาจค้าง ให้รัน setup ให้เสร็จก่อนสั่ง `playwright test` เสมอ (ทำเป็น `pretest` script)

## 8. ขั้นตอนถัดไป (เมื่อพร้อม implement)

1. `npm install -D @playwright/test && npx playwright install`
2. เขียน `scripts/seed-test-admin.mjs` (signup ผ่าน API จริงของ dev server ที่รันอยู่ หรือ insert ตรงด้วย `better-sqlite3` ตาม Better Auth schema แล้ว promote role)
3. เขียน `playwright.config.ts` (`webServer` ชี้ `next dev` พร้อม `DATABASE_URL` ของ test db, `use.baseURL`)
4. Implement suite ตามลำดับ priority P0 ก่อน: PROD → CART → AUTH → ADMIN-GUARD → ADMIN-PROD → ที่เหลือ
