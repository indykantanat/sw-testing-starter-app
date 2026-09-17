import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("รวมหลาย class name เข้าด้วยกัน", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold")
  })

  it("ตัด class ปลอม/undefined/false ออก", () => {
    expect(cn("text-sm", undefined, false, null, "font-bold")).toBe("text-sm font-bold")
  })

  it("class tailwind ที่ขัดแย้งกัน ตัวหลังชนะ (twMerge)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })

  it("รองรับ conditional object syntax ของ clsx", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active")
  })
})
