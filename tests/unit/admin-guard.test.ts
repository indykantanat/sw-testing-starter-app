import { describe, expect, it } from "vitest"
import { ADMIN_ROLE, isAdmin } from "@/lib/admin/admin-guard"

describe("isAdmin", () => {
  it("role ตรงกับ ADMIN_ROLE ถือว่าเป็นแอดมิน", () => {
    expect(isAdmin({ user: { id: "1", role: ADMIN_ROLE } })).toBe(true)
  })

  it("role อื่นที่ไม่ใช่แอดมิน คืน false", () => {
    expect(isAdmin({ user: { id: "1", role: "customer" } })).toBe(false)
  })

  it("ไม่มี session, ไม่มี user, หรือ role เป็น null/undefined คืน false", () => {
    expect(isAdmin(null)).toBe(false)
    expect(isAdmin(undefined)).toBe(false)
    expect(isAdmin({})).toBe(false)
    expect(isAdmin({ user: null })).toBe(false)
    expect(isAdmin({ user: { id: "1", role: null } })).toBe(false)
    expect(isAdmin({ user: { id: "1" } })).toBe(false)
  })
})
