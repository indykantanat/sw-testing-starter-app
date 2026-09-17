import { describe, expect, it } from "vitest"
import { parseNumberInput, productSchema } from "@/lib/admin/product-schema"

describe("productSchema", () => {
  const valid = { name: "iPhone 16 Pro", description: "สมาร์ทโฟน", price: 45900, categoryId: 1 }

  it("ข้อมูลถูกต้องผ่านการตรวจสอบ", () => {
    expect(productSchema.safeParse(valid).success).toBe(true)
  })

  it("description ว่างก็ผ่านได้ (optional)", () => {
    expect(productSchema.safeParse({ ...valid, description: "" }).success).toBe(true)
  })

  it("ชื่อว่างไม่ผ่าน", () => {
    expect(productSchema.safeParse({ ...valid, name: "" }).success).toBe(false)
  })

  it("ราคาติดลบหรือ 0 ไม่ผ่าน", () => {
    expect(productSchema.safeParse({ ...valid, price: 0 }).success).toBe(false)
    expect(productSchema.safeParse({ ...valid, price: -100 }).success).toBe(false)
  })

  it("ราคาสูงเกินเพดานไม่ผ่าน", () => {
    expect(productSchema.safeParse({ ...valid, price: 20_000_000 }).success).toBe(false)
  })

  it("หมวดหมู่ที่ไม่ใช่จำนวนเต็มบวกไม่ผ่าน", () => {
    expect(productSchema.safeParse({ ...valid, categoryId: 0 }).success).toBe(false)
    expect(productSchema.safeParse({ ...valid, categoryId: 1.5 }).success).toBe(false)
  })
})

describe("parseNumberInput", () => {
  it("string ตัวเลขล้วนแปลงเป็น number", () => {
    expect(parseNumberInput("45900")).toBe(45900)
  })

  it("ตัดตัวคั่นหลักพัน (,) ออกก่อนแปลง", () => {
    expect(parseNumberInput("1,234.5")).toBe(1234.5)
  })

  it("number ที่ส่งมาตรง ๆ ผ่านได้เลยถ้า finite", () => {
    expect(parseNumberInput(100)).toBe(100)
    expect(parseNumberInput(Number.NaN)).toBeNull()
  })

  it("string ว่างหรือแปลงไม่ได้ คืน null", () => {
    expect(parseNumberInput("")).toBeNull()
    expect(parseNumberInput("abc")).toBeNull()
  })

  it("null หรือ undefined คืน null", () => {
    expect(parseNumberInput(null)).toBeNull()
    expect(parseNumberInput(undefined)).toBeNull()
  })
})
