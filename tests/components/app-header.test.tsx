import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

// AppHeader import AppButton เข้ามาด้วย ซึ่งเรียก react-toastify ตอนกดปุ่ม ต้อง mock กันพลาด
vi.mock("react-toastify", () => ({ toast: vi.fn() }))

import AppHeader from "@/app/(front)/components/app-header"

describe("AppHeader", () => {
  it("แสดงหัวข้อ ปุ่ม และสรุปจำนวนนักศึกษาเมื่อมีข้อมูล (students.length > 0)", () => {
    render(<AppHeader />)

    expect(screen.getByText("Hello Header")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Click Me!" })).toBeInTheDocument()
    expect(screen.getByText("CodingThailand")).toBeInTheDocument()
    expect(screen.getByText("พบข้อมูลนักศึกษา")).toBeInTheDocument()
    expect(screen.getByText("นักศึกษาทั้งหมด 2 คน")).toBeInTheDocument()
  })

  it("ไม่แสดงข้อความ \"ไม่พบข้อมูล...\" เพราะข้อมูลนักศึกษามีอยู่เสมอในโค้ดปัจจุบัน", () => {
    render(<AppHeader />)
    expect(screen.queryByText("ไม่พบข้อมูล...")).not.toBeInTheDocument()
  })
})
