import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

/**
 * mock cart-store ให้ useCartStore เป็น store แยก (storage: null) แทน singleton จริง
 * เพื่อไม่ให้เทสต์นี้แตะ localStorage หรือรั่ว state ไปเทสต์ไฟล์อื่น
 * แต่ยังคงเป็น store ของ Zustand จริง ๆ (มี getState/setState/subscribe) เพื่อทดสอบ
 * ว่า useSyncExternalStore ใน CountCartItem subscribe และ re-render ตาม store จริงหรือไม่
 */
vi.mock("@/lib/cart/cart-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/cart/cart-store")>()
  return {
    ...actual,
    useCartStore: actual.createCartStore({ storage: null }),
  }
})

import CountCartItem from "@/app/(front)/components/CountCartItem"
import { useCartStore } from "@/lib/cart/cart-store"

beforeEach(() => {
  useCartStore.setState({ items: [] })
})

afterEach(() => {
  useCartStore.setState({ items: [] })
})

describe("CountCartItem", () => {
  it("แสดง 0 เมื่อตะกร้าว่าง", () => {
    render(<CountCartItem />)
    expect(screen.getByTestId("cart-count")).toHaveTextContent("0")
  })

  it("อัปเดตจำนวนอัตโนมัติเมื่อ store เปลี่ยน (พิสูจน์ว่า subscribe ทำงานจริง)", () => {
    render(<CountCartItem />)

    act(() => {
      useCartStore.getState().addItem({ productId: 1, name: "iPhone 16 Pro", price: 45900, qty: 3 })
    })

    expect(screen.getByTestId("cart-count")).toHaveTextContent("3")
  })

  it("รวมจำนวนจากหลายรายการ", () => {
    render(<CountCartItem />)

    act(() => {
      useCartStore.getState().addItem({ productId: 1, name: "A", price: 10, qty: 2 })
      useCartStore.getState().addItem({ productId: 2, name: "B", price: 20, qty: 5 })
    })

    expect(screen.getByTestId("cart-count")).toHaveTextContent("7")
  })
})
