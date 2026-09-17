import { describe, expect, it } from "vitest"
import {
  calcSkip,
  calcTotalPages,
  parseProductSearchParams,
} from "@/lib/product/product-params"

describe("parseProductSearchParams", () => {
  it("ไม่ส่ง params อะไรมาเลย ได้ค่า default", () => {
    expect(parseProductSearchParams()).toEqual({ q: "", page: 1 })
  })

  it("ตัด whitespace รอบคำค้นให้", () => {
    expect(parseProductSearchParams({ q: "  iphone  " })).toEqual({
      q: "iphone",
      page: 1,
    })
  })

  it("q ที่เป็น array (query ซ้ำ) ถือว่าไม่มีคำค้น", () => {
    expect(parseProductSearchParams({ q: ["a", "b"] })).toEqual({
      q: "",
      page: 1,
    })
  })

  it("แปลง page เป็นตัวเลขได้ถูกต้อง", () => {
    expect(parseProductSearchParams({ page: "3" })).toEqual({ q: "", page: 3 })
  })

  it("page ที่ parse ไม่ได้ ตกกลับไปหน้า 1", () => {
    expect(parseProductSearchParams({ page: "abc" })).toEqual({ q: "", page: 1 })
  })

  it("page ติดลบหรือ 0 ถูก clamp ให้อย่างน้อยเป็น 1", () => {
    expect(parseProductSearchParams({ page: "0" }).page).toBe(1)
    expect(parseProductSearchParams({ page: "-5" }).page).toBe(1)
  })
})

describe("calcTotalPages", () => {
  it("ปัดขึ้นเสมอเมื่อหารไม่ลงตัว", () => {
    expect(calcTotalPages(25, 10)).toBe(3)
  })

  it("หารลงตัวพอดี", () => {
    expect(calcTotalPages(20, 10)).toBe(2)
  })

  it("ไม่มีสินค้าเลย ยังคงมีอย่างน้อย 1 หน้า", () => {
    expect(calcTotalPages(0, 10)).toBe(1)
  })

  it("pageSize เป็น 0 หรือติดลบ ไม่หารด้วย 0 คืน 1 หน้าแทน", () => {
    expect(calcTotalPages(50, 0)).toBe(1)
    expect(calcTotalPages(50, -10)).toBe(1)
  })
})

describe("calcSkip", () => {
  it("หน้า 1 ไม่ข้ามแถวใด ๆ", () => {
    expect(calcSkip(1, 10)).toBe(0)
  })

  it("หน้า 3 ข้าม 2 หน้าก่อนหน้า", () => {
    expect(calcSkip(3, 10)).toBe(20)
  })

  it("หน้าติดลบไม่ทำให้ skip ติดลบ", () => {
    expect(calcSkip(-1, 10)).toBe(0)
  })
})
