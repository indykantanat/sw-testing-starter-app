import { describe, expect, it } from "vitest"
import { eachDayKey, toDayKey } from "@/lib/admin/day-key"

describe("toDayKey", () => {
  it("แปลง Date เป็น YYYY-MM-DD ตามเวลาไทย (UTC+7)", () => {
    // 10:00 UTC ของ 1 ม.ค. = 17:00 เวลาไทย ยังเป็นวันเดียวกัน
    expect(toDayKey(new Date("2025-01-01T10:00:00Z"))).toBe("2025-01-01")
  })

  it("เวลาที่ข้ามวันเมื่อแปลงเป็นเขตเวลาไทย ต้องนับเป็นวันถัดไป", () => {
    // 20:00 UTC ของ 1 ม.ค. = 03:00 เวลาไทย ของวันที่ 2 ม.ค.
    expect(toDayKey(new Date("2025-01-01T20:00:00Z"))).toBe("2025-01-02")
  })
})

describe("eachDayKey", () => {
  it("from และ to เป็นวันเดียวกัน ได้ลิสต์ยาว 1", () => {
    const day = new Date("2025-01-01T05:00:00Z")
    expect(eachDayKey(day, day)).toEqual(["2025-01-01"])
  })

  it("รวมปลายทั้งสองข้าง (inclusive) และเรียงจากวันแรกไปวันสุดท้าย", () => {
    const from = new Date("2025-01-01T05:00:00Z")
    const to = new Date("2025-01-04T05:00:00Z")
    expect(eachDayKey(from, to)).toEqual([
      "2025-01-01",
      "2025-01-02",
      "2025-01-03",
      "2025-01-04",
    ])
  })
})
