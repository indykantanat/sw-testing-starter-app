import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "@generated/prisma/client"
import { buildProductWhere, findProductPage } from "@/lib/product/product-repository"

/**
 * ต้องรัน `npm run db:test:setup` ก่อน เพื่อสร้าง prisma/test.db พร้อมสินค้าตัวอย่าง 50 รายการ
 * เทสต์ชุดนี้ต่อฐานข้อมูลจริง (ผ่าน PrismaClient ของตัวเอง) ไม่ใช้ singleton @/lib/prisma
 * เพราะตัวนั้นผูกกับ DATABASE_URL ของ dev.db ตั้งแต่ตอน import
 */
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/test.db" })
const prisma = new PrismaClient({ adapter })

beforeAll(async () => {
  const count = await prisma.products.count()
  if (count === 0) {
    throw new Error(
      "prisma/test.db ไม่มีข้อมูลสินค้า — รัน `npm run db:test:setup` ก่อนรัน integration test"
    )
  }
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe("buildProductWhere", () => {
  it("คำค้นว่าง แปลว่าเอาทั้งหมด (ไม่มี where clause)", () => {
    expect(buildProductWhere("")).toEqual({})
    expect(buildProductWhere("   ")).toEqual({})
  })

  it("มีคำค้น สร้างเงื่อนไข contains บนชื่อ", () => {
    expect(buildProductWhere("iPhone")).toEqual({ name: { contains: "iPhone" } })
  })
})

describe("findProductPage", () => {
  it("ไม่ค้นหาอะไร หน้าแรก ได้สินค้าตาม pageSize และ total ครบ 50 รายการ", async () => {
    const result = await findProductPage(prisma, { q: "", page: 1, pageSize: 10 })

    expect(result.total).toBe(50)
    expect(result.rows).toHaveLength(10)
  })

  it("แบ่งหน้าได้ถูกต้อง หน้า 2 ได้สินค้าคนละชุดกับหน้า 1", async () => {
    const page1 = await findProductPage(prisma, { q: "", page: 1, pageSize: 10 })
    const page2 = await findProductPage(prisma, { q: "", page: 2, pageSize: 10 })

    const page1Ids = page1.rows.map((r) => r.id)
    const page2Ids = page2.rows.map((r) => r.id)

    expect(page2Ids).toHaveLength(10)
    expect(page1Ids.some((id) => page2Ids.includes(id))).toBe(false)
  })

  it("ค้นหาด้วยคำที่มีสินค้าจริง กรองผลลัพธ์และ total ให้ตรงกัน", async () => {
    const result = await findProductPage(prisma, { q: "iPhone", page: 1, pageSize: 10 })

    expect(result.total).toBeGreaterThan(0)
    expect(result.rows.length).toBe(result.total)
    for (const row of result.rows) {
      expect(row.name).toContain("iPhone")
    }
  })

  it("ค้นหาด้วยคำที่ไม่มีสินค้าเลย ได้ผลลัพธ์ว่าง", async () => {
    const result = await findProductPage(prisma, {
      q: "ไม่มีสินค้านี้แน่นอน-xyz",
      page: 1,
      pageSize: 10,
    })

    expect(result.total).toBe(0)
    expect(result.rows).toEqual([])
  })

  it("แต่ละแถวมี product_images ติดมาด้วย (include ทำงาน)", async () => {
    const result = await findProductPage(prisma, { q: "", page: 1, pageSize: 1 })

    expect(result.rows[0]).toHaveProperty("product_images")
    expect(Array.isArray(result.rows[0].product_images)).toBe(true)
  })
})
