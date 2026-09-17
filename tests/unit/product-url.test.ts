import { describe, expect, it } from "vitest"
import { buildProductUrl } from "@/lib/product/product-url"
import { PRODUCT_PLACEHOLDER_SRC } from "@/lib/product/product-placeholder"

describe("buildProductUrl", () => {
  it("ไม่มีคำค้นและอยู่หน้า 1 ได้ path เปล่า ๆ", () => {
    expect(buildProductUrl("", 1)).toBe("/product")
  })

  it("ตัด whitespace รอบคำค้นก่อนใส่ query string", () => {
    expect(buildProductUrl("  iphone  ", 1)).toBe("/product?q=iphone")
  })

  it("หน้ามากกว่า 1 ใส่ page ใน query string", () => {
    expect(buildProductUrl("", 3)).toBe("/product?page=3")
  })

  it("มีทั้งคำค้นและหน้า ใส่ทั้งสองค่าตามลำดับ q แล้ว page", () => {
    expect(buildProductUrl("iphone", 2)).toBe("/product?q=iphone&page=2")
  })

  it("คำค้นเป็นช่องว่างล้วน ถือว่าไม่มีคำค้น", () => {
    expect(buildProductUrl("   ", 1)).toBe("/product")
  })
})

describe("PRODUCT_PLACEHOLDER_SRC", () => {
  it("เป็น data URI ของ svg", () => {
    expect(PRODUCT_PLACEHOLDER_SRC.startsWith("data:image/svg+xml")).toBe(true)
  })

  it("ถอดรหัสกลับมาเป็น svg markup ได้", () => {
    const [, encoded] = PRODUCT_PLACEHOLDER_SRC.split(",")
    expect(decodeURIComponent(encoded)).toContain("<svg")
  })
})
