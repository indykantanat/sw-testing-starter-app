import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

/**
 * CartButton ใช้ useCartStore (singleton จริงที่ persist ลง localStorage) ตรง ๆ
 * mock ทั้งโมดูลแทนของจริง เพื่อไม่ให้เทสต์นี้แตะ localStorage หรือกระทบ store จริง
 * และเพื่อ assert ได้ตรง ๆ ว่า addItem ถูกเรียกด้วยอะไร
 *
 * ใช้ vi.hoisted เพราะ vi.mock ถูก hoist ขึ้นไปเหนือ import ทั้งหมด
 * ถ้าอ้าง addItem ที่ประกาศด้วย const ตรง ๆ ในนี้จะเจอ "Cannot access before initialization"
 */
const { addItem } = vi.hoisted(() => ({ addItem: vi.fn() }))

vi.mock("@/lib/cart/cart-store", () => ({
  useCartStore: (selector: (state: { addItem: typeof addItem }) => unknown) =>
    selector({ addItem }),
}))

import CartButton from "@/app/(front)/components/CartButton"

afterEach(() => {
  addItem.mockClear()
})

describe("CartButton", () => {
  it("แสดงปุ่มหยิบใส่ตะกร้า", () => {
    render(<CartButton product={{ id: 1, name: "iPhone 16 Pro", price: 45900 }} />)
    expect(screen.getByTestId("add-to-cart")).toBeInTheDocument()
  })

  it("กดปุ่มแล้วเรียก addItem ด้วยข้อมูลสินค้าและ qty เป็น 1 เสมอ", async () => {
    const user = userEvent.setup()
    render(<CartButton product={{ id: 1, name: "iPhone 16 Pro", price: 45900 }} />)

    await user.click(screen.getByTestId("add-to-cart"))

    expect(addItem).toHaveBeenCalledTimes(1)
    expect(addItem).toHaveBeenCalledWith({
      productId: 1,
      name: "iPhone 16 Pro",
      price: 45900,
      qty: 1,
    })
  })

  it("กดหลายครั้งเรียก addItem หลายครั้งตามจำนวนที่กด", async () => {
    const user = userEvent.setup()
    render(<CartButton product={{ id: 2, name: "AirPods Pro 2", price: 8990 }} />)

    const button = screen.getByTestId("add-to-cart")
    await user.click(button)
    await user.click(button)

    expect(addItem).toHaveBeenCalledTimes(2)
  })
})
