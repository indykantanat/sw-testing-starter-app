import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AppProductCard from "@/app/(front)/components/app-product-card"

describe("AppProductCard", () => {
  it("แสดงชื่อและราคาที่ format แล้ว", () => {
    render(<AppProductCard name="iPhone 16 Pro" price={45900} onAddToCart={vi.fn()} />)

    expect(screen.getByTestId("app-product-name")).toHaveTextContent("iPhone 16 Pro")
    expect(screen.getByTestId("app-product-price")).toHaveTextContent("45900.00")
  })

  it("ไม่มีสินค้าในสต็อก (ค่า default) ไม่แสดงจำนวนคงเหลือและปุ่มเพิ่มลงตะกร้า", () => {
    render(<AppProductCard name="สินค้าหมด" price={100} onAddToCart={vi.fn()} />)

    expect(screen.queryByTestId("app-product-stock")).not.toBeInTheDocument()
    expect(screen.queryByTestId("app-product-add")).not.toBeInTheDocument()
  })

  it("มีสต็อก แสดงจำนวนคงเหลือและปุ่มเพิ่มลงตะกร้า", () => {
    render(<AppProductCard name="AirPods Pro 2" price={8990} stock={5} onAddToCart={vi.fn()} />)

    expect(screen.getByTestId("app-product-stock")).toHaveTextContent("5")
    expect(screen.getByTestId("app-product-add")).toBeInTheDocument()
  })

  it("กดปุ่มเพิ่มลงตะกร้าแล้วเรียก onAddToCart ด้วยชื่อสินค้า", async () => {
    const user = userEvent.setup()
    const onAddToCart = vi.fn()

    render(<AppProductCard name="AirPods Pro 2" price={8990} stock={5} onAddToCart={onAddToCart} />)
    await user.click(screen.getByTestId("app-product-add"))

    expect(onAddToCart).toHaveBeenCalledTimes(1)
    expect(onAddToCart).toHaveBeenCalledWith("AirPods Pro 2")
  })
})
