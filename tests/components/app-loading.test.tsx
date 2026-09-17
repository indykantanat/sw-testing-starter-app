import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import AppLoading from "@/app/(front)/components/app-loading"

describe("AppLoading", () => {
  it("แสดง spinner ที่มี role status พร้อม label Loading", () => {
    render(<AppLoading />)
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument()
  })
})
