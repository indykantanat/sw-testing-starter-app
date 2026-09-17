import { describe, expect, it } from "vitest"
import { toProductViewModel, toProductViewModels } from "@/lib/product/product-view-model"
import type { ProductRow } from "@/types/product"

const baseRow: ProductRow = {
  id: 1,
  name: "iPhone 16 Pro",
  description: "สมาร์ทโฟน",
  price: 45900,
  category_id: 1,
  product_images: [{ image_name: "iphone.jpg" }],
}

describe("toProductViewModel", () => {
  it("แปลงแถวปกติที่มีรูปและไฟล์รูปมีอยู่จริง", () => {
    const result = toProductViewModel(baseRow, () => true)
    expect(result).toEqual({
      id: 1,
      name: "iPhone 16 Pro",
      description: "สมาร์ทโฟน",
      price: 45900,
      picture: "iphone.jpg",
    })
  })

  it("มีชื่อรูปแต่ไฟล์ไม่มีอยู่จริง picture เป็น null", () => {
    const result = toProductViewModel(baseRow, () => false)
    expect(result.picture).toBeNull()
  })

  it("ไม่มีรูปเลย picture เป็น null โดยไม่ต้องเรียก imageExists", () => {
    let called = false
    const result = toProductViewModel(
      { ...baseRow, product_images: [] },
      () => {
        called = true
        return true
      }
    )
    expect(result.picture).toBeNull()
    expect(called).toBe(false)
  })

  it("ฟิลด์ nullable แทนด้วยค่า default", () => {
    const result = toProductViewModel(
      { ...baseRow, name: null, description: null, price: null, product_images: [] },
      () => true
    )
    expect(result.name).toBe("(ไม่มีชื่อสินค้า)")
    expect(result.description).toBe("")
    expect(result.price).toBe(0)
  })
})

describe("toProductViewModels", () => {
  it("แปลงหลายแถวพร้อมกัน", () => {
    const rows: ProductRow[] = [baseRow, { ...baseRow, id: 2, product_images: [] }]
    const results = toProductViewModels(rows, () => true)

    expect(results).toHaveLength(2)
    expect(results[0].picture).toBe("iphone.jpg")
    expect(results[1].picture).toBeNull()
  })

  it("array ว่าง คืน array ว่าง", () => {
    expect(toProductViewModels([], () => true)).toEqual([])
  })
})
