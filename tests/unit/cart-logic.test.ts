import { describe, expect, it } from "vitest"
import {
  addItem,
  lineTotal,
  removeItem,
  totalItems,
  totalPrice,
  updateQty,
} from "@/lib/cart/cart-logic"
import type { CartItem } from "@/types/cart"

const iphone: CartItem = { productId: 1, name: "iPhone 16 Pro", price: 45900, qty: 1 }
const airpods: CartItem = { productId: 4, name: "AirPods Pro 2", price: 8990, qty: 2 }

describe("addItem", () => {
  it("เพิ่มสินค้าใหม่เข้าไปในตะกร้าเปล่า", () => {
    const result = addItem([], iphone)
    expect(result).toEqual([iphone])
  })

  it("ถ้ามีสินค้านั้นอยู่แล้ว ให้บวกจำนวนสะสมแทนการเพิ่มแถวใหม่", () => {
    const result = addItem([iphone], { ...iphone, qty: 2 })
    expect(result).toHaveLength(1)
    expect(result[0].qty).toBe(3)
  })

  it("qty ที่ไม่เกิน 0 ไม่ถูกเพิ่มเข้าตะกร้า", () => {
    const result = addItem([], { ...iphone, qty: 0 })
    expect(result).toEqual([])
  })

  it("ไม่แก้ไข array เดิม (immutable)", () => {
    const items: CartItem[] = [iphone]
    const result = addItem(items, airpods)
    expect(items).toHaveLength(1)
    expect(result).toHaveLength(2)
    expect(result).not.toBe(items)
  })
})

describe("removeItem", () => {
  it("ลบสินค้าตาม productId", () => {
    const result = removeItem([iphone, airpods], iphone.productId)
    expect(result).toEqual([airpods])
  })

  it("productId ที่ไม่มีในตะกร้า ไม่มีผลใด ๆ", () => {
    const result = removeItem([iphone], 999)
    expect(result).toEqual([iphone])
  })
})

describe("updateQty", () => {
  it("แก้จำนวนของสินค้าที่มีอยู่", () => {
    const result = updateQty([iphone], iphone.productId, 5)
    expect(result[0].qty).toBe(5)
  })

  it("จำนวนเป็น 0 เท่ากับลบสินค้าออกจากตะกร้า", () => {
    const result = updateQty([iphone, airpods], iphone.productId, 0)
    expect(result).toEqual([airpods])
  })

  it("จำนวนติดลบก็ถือว่าลบออกเช่นกัน", () => {
    const result = updateQty([iphone], iphone.productId, -3)
    expect(result).toEqual([])
  })
})

describe("totalItems", () => {
  it("รวมจำนวนชิ้นทุกรายการ", () => {
    expect(totalItems([iphone, airpods])).toBe(iphone.qty + airpods.qty)
  })

  it("ตะกร้าว่างรวมได้ 0", () => {
    expect(totalItems([])).toBe(0)
  })
})

describe("totalPrice", () => {
  it("รวมราคา x จำนวนทุกรายการ", () => {
    const expected = iphone.price * iphone.qty + airpods.price * airpods.qty
    expect(totalPrice([iphone, airpods])).toBe(expected)
  })

  it("ตะกร้าว่างรวมได้ 0", () => {
    expect(totalPrice([])).toBe(0)
  })
})

describe("lineTotal", () => {
  it("คำนวณราคารวมของรายการเดียว", () => {
    expect(lineTotal(airpods)).toBe(airpods.price * airpods.qty)
  })
})
