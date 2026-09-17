import { describe, expect, it } from "vitest"
import { buildRevenueSeries, sumRevenue } from "@/lib/admin/revenue"

describe("buildRevenueSeries", () => {
  const range = {
    from: new Date("2025-01-01T05:00:00Z"), // เที่ยงวันไทยของ 1 ม.ค.
    to: new Date("2025-01-03T05:00:00Z"), // เที่ยงวันไทยของ 3 ม.ค.
  }

  it("รวมยอดตามวัน (เขตเวลาไทย) และเติม 0 ให้วันที่ไม่มีออร์เดอร์", () => {
    const orders = [
      { date: new Date("2025-01-01T10:00:00Z"), total_amount: 100 }, // 17:00 ไทย 1 ม.ค.
      { date: new Date("2025-01-01T20:00:00Z"), total_amount: 50 }, // 03:00 ไทย 2 ม.ค. (ข้ามวัน)
      { date: new Date("2025-01-03T04:00:00Z"), total_amount: 25 }, // 11:00 ไทย 3 ม.ค.
    ]

    expect(buildRevenueSeries(orders, range)).toEqual([
      { date: "2025-01-01", revenue: 100 },
      { date: "2025-01-02", revenue: 50 },
      { date: "2025-01-03", revenue: 25 },
    ])
  })

  it("ออร์เดอร์ที่ date เป็น null ถูกข้าม", () => {
    const orders = [
      { date: null, total_amount: 999 },
      { date: new Date("2025-01-01T10:00:00Z"), total_amount: 10 },
    ]

    const series = buildRevenueSeries(orders, range)
    expect(series.find((p) => p.date === "2025-01-01")?.revenue).toBe(10)
    expect(sumRevenue(series)).toBe(10)
  })

  it("total_amount เป็น null นับเป็น 0", () => {
    const orders = [{ date: new Date("2025-01-01T10:00:00Z"), total_amount: null }]
    const series = buildRevenueSeries(orders, range)
    expect(series.find((p) => p.date === "2025-01-01")?.revenue).toBe(0)
  })

  it("หลายออร์เดอร์วันเดียวกันถูกรวมยอด", () => {
    const orders = [
      { date: new Date("2025-01-01T10:00:00Z"), total_amount: 100 },
      { date: new Date("2025-01-01T11:00:00Z"), total_amount: 200 },
    ]
    const series = buildRevenueSeries(orders, range)
    expect(series.find((p) => p.date === "2025-01-01")?.revenue).toBe(300)
  })

  it("ไม่มีออร์เดอร์เลย ทุกวันในช่วงเป็น 0", () => {
    const series = buildRevenueSeries([], range)
    expect(series).toEqual([
      { date: "2025-01-01", revenue: 0 },
      { date: "2025-01-02", revenue: 0 },
      { date: "2025-01-03", revenue: 0 },
    ])
  })
})

describe("sumRevenue", () => {
  it("รวมยอดของทุกจุดในกราฟ", () => {
    expect(
      sumRevenue([
        { date: "2025-01-01", revenue: 10 },
        { date: "2025-01-02", revenue: 20 },
      ])
    ).toBe(30)
  })

  it("array ว่าง รวมได้ 0", () => {
    expect(sumRevenue([])).toBe(0)
  })
})
