import { describe, expect, it } from "vitest"
import {
  ADMIN_PRODUCT_PAGE_SIZE,
  DEFAULT_RECENT_ORDERS_LIMIT,
  MAX_RECENT_ORDERS_LIMIT,
  parseAdminProductQuery,
  parseOrdersLimit,
  parseRouteId,
} from "@/lib/admin/admin-params"
import { DASHBOARD_REFRESH_MS } from "@/lib/admin/dashboard-config"

describe("ค่าคงที่ config", () => {
  it("มีค่าตามที่ระบบพึ่งพา", () => {
    expect(ADMIN_PRODUCT_PAGE_SIZE).toBe(10)
    expect(DEFAULT_RECENT_ORDERS_LIMIT).toBe(5)
    expect(MAX_RECENT_ORDERS_LIMIT).toBe(50)
    expect(DASHBOARD_REFRESH_MS).toBe(30_000)
  })
})

describe("parseAdminProductQuery", () => {
  it("ไม่ส่งอะไรมา ได้ค่า default", () => {
    expect(parseAdminProductQuery(new URLSearchParams())).toEqual({ search: "", page: 1 })
  })

  it("ตัด whitespace ของคำค้น", () => {
    const params = new URLSearchParams({ search: "  iphone  " })
    expect(parseAdminProductQuery(params).search).toBe("iphone")
  })

  it("page ที่ไม่ใช่ตัวเลขหรือน้อยกว่า 1 ตกกลับไปหน้า 1", () => {
    expect(parseAdminProductQuery(new URLSearchParams({ page: "abc" })).page).toBe(1)
    expect(parseAdminProductQuery(new URLSearchParams({ page: "0" })).page).toBe(1)
    expect(parseAdminProductQuery(new URLSearchParams({ page: "-2" })).page).toBe(1)
  })

  it("page ที่ถูกต้องใช้ตามที่ส่งมา", () => {
    expect(parseAdminProductQuery(new URLSearchParams({ page: "5" })).page).toBe(5)
  })
})

describe("parseOrdersLimit", () => {
  it("ไม่ส่งมา ใช้ค่า default", () => {
    expect(parseOrdersLimit(new URLSearchParams())).toBe(DEFAULT_RECENT_ORDERS_LIMIT)
  })

  it("ค่าที่ไม่ถูกต้อง ใช้ค่า default", () => {
    expect(parseOrdersLimit(new URLSearchParams({ limit: "abc" }))).toBe(
      DEFAULT_RECENT_ORDERS_LIMIT
    )
    expect(parseOrdersLimit(new URLSearchParams({ limit: "0" }))).toBe(
      DEFAULT_RECENT_ORDERS_LIMIT
    )
  })

  it("ค่าที่เกิน MAX ถูกกันไว้ที่เพดาน", () => {
    expect(parseOrdersLimit(new URLSearchParams({ limit: "999" }))).toBe(
      MAX_RECENT_ORDERS_LIMIT
    )
  })

  it("ค่าที่ถูกต้องและไม่เกินเพดาน ใช้ตามที่ส่งมา", () => {
    expect(parseOrdersLimit(new URLSearchParams({ limit: "20" }))).toBe(20)
  })
})

describe("parseRouteId", () => {
  it("string ตัวเลขบวก แปลงเป็น number ได้", () => {
    expect(parseRouteId("42")).toBe(42)
  })

  it("undefined, ค่าไม่ใช่ตัวเลข, ศูนย์ หรือค่าติดลบ คืน null", () => {
    expect(parseRouteId(undefined)).toBeNull()
    expect(parseRouteId("abc")).toBeNull()
    expect(parseRouteId("0")).toBeNull()
    expect(parseRouteId("-5")).toBeNull()
  })
})
