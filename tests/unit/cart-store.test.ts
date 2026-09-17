import { describe, expect, it } from "vitest"
import { createCartStore } from "@/lib/cart/cart-store"
import type { CartItem } from "@/types/cart"

const iphone: CartItem = { productId: 1, name: "iPhone 16 Pro", price: 45900, qty: 1 }

/**
 * storage: null ปิด persist ไว้ ทำให้แต่ละเทสต์ได้ store แยกกันจริง
 * ไม่ต้องยุ่งกับ localStorage และไม่รั่ว state ข้ามเคส
 */
function createTestStore(initialItems: CartItem[] = []) {
  return createCartStore({ storage: null, initialItems })
}

describe("createCartStore", () => {
  it("เริ่มต้นด้วย initialItems ที่กำหนด", () => {
    const store = createTestStore([iphone])
    expect(store.getState().items).toEqual([iphone])
  })

  it("addItem เพิ่มสินค้าและอัปเดต state", () => {
    const store = createTestStore()
    store.getState().addItem(iphone)
    expect(store.getState().items).toEqual([iphone])
  })

  it("removeItem ลบสินค้าตาม productId", () => {
    const store = createTestStore([iphone])
    store.getState().removeItem(iphone.productId)
    expect(store.getState().items).toEqual([])
  })

  it("updateQty แก้จำนวนสินค้า", () => {
    const store = createTestStore([iphone])
    store.getState().updateQty(iphone.productId, 5)
    expect(store.getState().items[0].qty).toBe(5)
  })

  it("clearCart ล้างตะกร้าทั้งหมด", () => {
    const store = createTestStore([iphone])
    store.getState().clearCart()
    expect(store.getState().items).toEqual([])
  })

  it("totalItems และ totalPrice คำนวณจาก state ปัจจุบัน", () => {
    const store = createTestStore()
    store.getState().addItem(iphone)
    store.getState().addItem({ productId: 4, name: "AirPods Pro 2", price: 8990, qty: 2 })

    expect(store.getState().totalItems()).toBe(3)
    expect(store.getState().totalPrice()).toBe(iphone.price + 8990 * 2)
  })

  it("แต่ละ store ที่สร้างแยกกัน ไม่แชร์ state กัน", () => {
    const storeA = createTestStore()
    const storeB = createTestStore()

    storeA.getState().addItem(iphone)

    expect(storeA.getState().items).toEqual([iphone])
    expect(storeB.getState().items).toEqual([])
  })
})
