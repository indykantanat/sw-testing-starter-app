import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }))
vi.mock("react-toastify", () => ({ toast: toastMock }))

import AppButton from "@/app/(front)/components/app-button"

describe("AppButton", () => {
  it("แสดงปุ่ม Click Me!", () => {
    render(<AppButton />)
    expect(screen.getByRole("button", { name: "Click Me!" })).toBeInTheDocument()
  })

  it("กดปุ่มแล้วเรียก toast พร้อมข้อความ Hello Next.js", async () => {
    const user = userEvent.setup()
    render(<AppButton />)

    await user.click(screen.getByRole("button", { name: "Click Me!" }))

    expect(toastMock).toHaveBeenCalledWith("Hello Next.js")
  })
})
