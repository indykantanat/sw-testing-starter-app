import { describe, expect, it } from "vitest"
import {
  formatCount,
  formatDateTimeTH,
  formatPrice,
  formatShortDateTH,
  formatTHB,
} from "@/lib/format"

describe("formatPrice", () => {
  it.for([
    { value: 100, expected: "100.00" },
    { value: 99.9, expected: "99.90" },
    { value: 1234.567, expected: "1234.57" }, // ปัดเศษทศนิยมตำแหน่งที่ 3 ขึ้น
    { value: 0, expected: "0.00" },
    { value: -50, expected: "-50.00" }, // ราคาติดลบ (เช่น ส่วนลด) ต้องไม่พังหรือถูกตัดทิ้ง
  ])("formatPrice($value) ได้ $expected", ({ value, expected }) => {
    expect(formatPrice(value)).toBe(expected)
  })

  it.for([
    { value: Number.NaN, label: "NaN" },
    { value: Number.POSITIVE_INFINITY, label: "Infinity" },
    { value: Number.NEGATIVE_INFINITY, label: "-Infinity" },
  ])("ค่าที่ไม่ใช่ finite number ($label) คืน 0.00 แทนการพัง", ({ value }) => {
    expect(formatPrice(value)).toBe("0.00")
  })
})

describe("formatTHB", () => {
  it("จัดรูปแบบเป็นสกุลเงินบาทแบบเดียวกับ Intl.NumberFormat(th-TH)", () => {
    const expected = new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 2,
    }).format(12345)

    expect(formatTHB(12345)).toBe(expected)
  })

  it("ค่าที่ไม่ใช่ finite number ตกไปใช้ 0 แทน", () => {
    const zero = new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 2,
    }).format(0)

    expect(formatTHB(Number.NaN)).toBe(zero)
  })

  it("ค่าติดลบ (เช่น ยอดคืนเงิน) แปลงตาม Intl ได้ปกติ ไม่ถูกตัดเครื่องหมายลบ", () => {
    const expected = new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 2,
    }).format(-500)

    expect(formatTHB(-500)).toBe(expected)
  })

  it.for([
    { value: 999, shouldHaveComma: false },
    { value: 1000, shouldHaveComma: true },
    { value: 1234567, shouldHaveComma: true },
  ])(
    "ใส่ตัวคั่นหลักพันเฉพาะตอนจำเป็น: $value → มี comma = $shouldHaveComma",
    ({ value, shouldHaveComma }) => {
      expect(formatTHB(value).includes(",")).toBe(shouldHaveComma)
    }
  )
})

describe("formatCount", () => {
  it("มีตัวคั่นหลักพันเมื่อจำนวนมากพอ", () => {
    expect(formatCount(1234567)).toBe(
      new Intl.NumberFormat("th-TH").format(1234567)
    )
  })

  it("ค่าที่ไม่ใช่ finite number คืน \"0\"", () => {
    expect(formatCount(Number.NaN)).toBe("0")
  })

  it("ค่าติดลบจัดรูปแบบตาม Intl ได้ปกติ", () => {
    expect(formatCount(-1234)).toBe(new Intl.NumberFormat("th-TH").format(-1234))
  })

  it("ค่าทศนิยม ไม่ถูกปัดทิ้งโดยไม่ตั้งใจ", () => {
    expect(formatCount(1234.5)).toBe(new Intl.NumberFormat("th-TH").format(1234.5))
  })

  it("ค่า 0 คืน \"0\" เหมือนกับค่าที่ไม่ finite", () => {
    expect(formatCount(0)).toBe("0")
  })
})

describe("formatDateTimeTH", () => {
  it.for([
    { value: null, label: "null" },
    { value: undefined, label: "undefined" },
    { value: "", label: "string ว่าง" },
    { value: "ไม่ใช่วันที่", label: "string ที่ parse ไม่ได้" },
  ])("คืน \"-\" เมื่อ input เป็น $label", ({ value }) => {
    expect(formatDateTimeTH(value)).toBe("-")
  })

  it("จัดรูปแบบ Date object ที่ถูกต้องได้ (ไม่ใช่ \"-\")", () => {
    const result = formatDateTimeTH(new Date(2025, 0, 15, 10, 30))
    expect(result).not.toBe("-")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })

  it("รับ ISO string ได้เหมือนกับรับ Date object (แปลงผ่าน toDate ภายใน)", () => {
    const fromDate = formatDateTimeTH(new Date("2025-01-15T10:30:00"))
    const fromString = formatDateTimeTH("2025-01-15T10:30:00")
    expect(fromString).toBe(fromDate)
  })

  it("มีเวลากำกับด้วย (ต่างจาก formatShortDateTH)", () => {
    const result = formatDateTimeTH(new Date(2025, 0, 15, 10, 30))
    expect(result).toContain(":")
  })
})

describe("formatShortDateTH", () => {
  it.for([
    { value: null, label: "null" },
    { value: undefined, label: "undefined" },
    { value: "", label: "string ว่าง" },
    { value: "garbage", label: "string ที่ parse ไม่ได้" },
  ])("คืน \"-\" เมื่อ input เป็น $label", ({ value }) => {
    expect(formatShortDateTH(value)).toBe("-")
  })

  it("จัดรูปแบบวันที่แบบสั้นได้ทั้ง Date object และ ISO string (ไม่ใช่ \"-\")", () => {
    expect(formatShortDateTH(new Date(2025, 0, 15))).not.toBe("-")
    expect(formatShortDateTH("2025-01-15")).not.toBe("-")
  })

  it("ไม่มีเวลากำกับ (ต่างจาก formatDateTimeTH)", () => {
    const result = formatShortDateTH(new Date(2025, 0, 15, 10, 30))
    expect(result).not.toContain(":")
  })
})
