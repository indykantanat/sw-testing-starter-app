import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AppFooter from "@/app/(front)/components/app-footer"

describe("AppFooter", () => {
  it("แสดงชื่อบริษัทเริ่มต้นและอีเมลลิขสิทธิ์พร้อมปีปัจจุบัน", () => {
    render(<AppFooter />)

    expect(screen.getByText("CodingThailand")).toBeInTheDocument()

    const currentYear = new Date().getFullYear()
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === "P" &&
          element.textContent === `codingthailand@gmail.com © ${currentYear}`
      )
    ).toBeInTheDocument()
  })

  it("เอาเมาส์ชี้ที่ชื่อบริษัท แล้วเปลี่ยนจาก CodingThailand เป็น SWU", async () => {
    const user = userEvent.setup()
    render(<AppFooter />)

    await user.hover(screen.getByText("CodingThailand"))

    expect(screen.getByText("SWU")).toBeInTheDocument()
    expect(screen.queryByText("CodingThailand")).not.toBeInTheDocument()
  })
})
