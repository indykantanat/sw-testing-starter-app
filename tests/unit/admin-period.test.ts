import { describe, expect, it } from "vitest"
import { DEFAULT_PERIOD, PERIODS, parsePeriod, periodRange, periodToDays } from "@/lib/admin/period"

describe("parsePeriod", () => {
  it("ค่าที่อยู่ในลิสต์ PERIODS ใช้ตามนั้น", () => {
    for (const p of PERIODS) {
      expect(parsePeriod(p)).toBe(p)
    }
  })

  it("ค่าที่ไม่รู้จัก null หรือ undefined ตกไปใช้ DEFAULT_PERIOD", () => {
    expect(parsePeriod("1y")).toBe(DEFAULT_PERIOD)
    expect(parsePeriod(null)).toBe(DEFAULT_PERIOD)
    expect(parsePeriod(undefined)).toBe(DEFAULT_PERIOD)
  })
})

describe("periodToDays", () => {
  it("แปลง period เป็นจำนวนวันถูกต้อง", () => {
    expect(periodToDays("7d")).toBe(7)
    expect(periodToDays("30d")).toBe(30)
    expect(periodToDays("90d")).toBe(90)
  })
})

describe("periodRange", () => {
  it("7d: from คือย้อนหลัง 6 วันเวลา 00:00:00, to คือเวลาปัจจุบันเป๊ะ ๆ", () => {
    const now = new Date(2025, 5, 15, 10, 30, 0)
    const { from, to } = periodRange("7d", now)

    expect(to.getTime()).toBe(now.getTime())
    expect(from.getFullYear()).toBe(2025)
    expect(from.getMonth()).toBe(5)
    expect(from.getDate()).toBe(9)
    expect(from.getHours()).toBe(0)
    expect(from.getMinutes()).toBe(0)
    expect(from.getSeconds()).toBe(0)
    expect(from.getMilliseconds()).toBe(0)
  })

  it("30d: from ย้อนหลัง 29 วัน", () => {
    const now = new Date(2025, 5, 15)
    const { from } = periodRange("30d", now)
    expect(from.getMonth()).toBe(4)
    expect(from.getDate()).toBe(17)
  })

  it("ไม่ส่ง now เข้ามา ใช้เวลาปัจจุบันของเครื่อง", () => {
    const before = Date.now()
    const { to } = periodRange("7d")
    const after = Date.now()
    expect(to.getTime()).toBeGreaterThanOrEqual(before)
    expect(to.getTime()).toBeLessThanOrEqual(after)
  })
})
