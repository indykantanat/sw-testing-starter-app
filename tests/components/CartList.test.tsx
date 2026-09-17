import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

// ใช้ store แยก (storage: null) ที่เป็น Zustand จริง แทน singleton ที่ persist ลง localStorage
vi.mock("@/lib/cart/cart-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/cart/cart-store")>()
  return {
    ...actual,
    useCartStore: actual.createCartStore({ storage: null }),
  }
})

import CartList from "@/app/(front)/components/CartList"
import { useCartStore } from "@/lib/cart/cart-store"

const iphone = { productId: 1, name: "iPhone 16 Pro", price: 45900, qty: 1 }
const airpods = { productId: 4, name: "AirPods Pro 2", price: 8990, qty: 2 }

beforeEach(() => {
  useCartStore.setState({ items: [] })
})

afterEach(() => {
  replaceMock.mockClear()
})

describe("CartList", () => {
  it("ตะกร้าว่าง แสดง empty state แทนตาราง", () => {
    render(<CartList />)
    expect(screen.getByTestId("cart-empty")).toBeInTheDocument()
  })

  it("มีสินค้า แสดงแถวครบและยอดรวมถูกต้อง", () => {
    useCartStore.setState({ items: [iphone, airpods] })
    render(<CartList />)

    expect(screen.getAllByTestId("cart-row")).toHaveLength(2)
    const expectedTotal = (iphone.price * iphone.qty + airpods.price * airpods.qty).toFixed(2)
    expect(screen.getByTestId("cart-total")).toHaveTextContent(expectedTotal)
  })

  it("กดลบสินค้าทีละชิ้น เอาแถวนั้นออกจากตะกร้าและอัปเดต store จริง", async () => {
    useCartStore.setState({ items: [iphone, airpods] })
    const user = userEvent.setup()
    render(<CartList />)

    await user.click(screen.getAllByTestId("cart-remove-item")[0])

    expect(screen.getAllByTestId("cart-row")).toHaveLength(1)
    expect(useCartStore.getState().items).toEqual([airpods])
  })

  it("กดลบสินค้าทั้งหมด กลับไปเป็น empty state", async () => {
    useCartStore.setState({ items: [iphone] })
    const user = userEvent.setup()
    render(<CartList />)

    await user.click(screen.getByTestId("cart-clear"))

    expect(screen.getByTestId("cart-empty")).toBeInTheDocument()
    expect(useCartStore.getState().items).toEqual([])
  })

  it("กด checkout เคลียร์ตะกร้าและ redirect ไป /product (ไม่ได้สร้างออร์เดอร์จริง)", async () => {
    useCartStore.setState({ items: [iphone] })
    const user = userEvent.setup()
    render(<CartList />)

    await user.click(screen.getByTestId("cart-checkout"))

    expect(useCartStore.getState().items).toEqual([])
    expect(replaceMock).toHaveBeenCalledWith("/product")
  })
})
