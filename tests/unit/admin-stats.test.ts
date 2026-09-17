import { describe, expect, it } from "vitest"
import { calcDashboardStats } from "@/lib/admin/stats"

describe("calcDashboardStats", () => {
  it("คำนวณค่าเฉลี่ยต่อออร์เดอร์ได้ถูกต้อง", () => {
    const result = calcDashboardStats({
      orderCount: 4,
      productCount: 50,
      customerCount: 10,
      revenueSum: 4000,
    })

    expect(result).toEqual({
      totalOrders: 4,
      totalProducts: 50,
      totalCustomers: 10,
      totalRevenue: 4000,
      averageOrderValue: 1000,
    })
  })

  it("ไม่มีออร์เดอร์เลย averageOrderValue เป็น 0 ไม่ใช่ NaN", () => {
    const result = calcDashboardStats({
      orderCount: 0,
      productCount: 50,
      customerCount: 0,
      revenueSum: 0,
    })

    expect(result.averageOrderValue).toBe(0)
    expect(Number.isNaN(result.averageOrderValue)).toBe(false)
  })

  it("revenueSum เป็น null ถือเป็น 0", () => {
    const result = calcDashboardStats({
      orderCount: 2,
      productCount: 10,
      customerCount: 5,
      revenueSum: null,
    })

    expect(result.totalRevenue).toBe(0)
    expect(result.averageOrderValue).toBe(0)
  })
})
