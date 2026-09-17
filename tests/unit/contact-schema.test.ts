import { describe, expect, it } from "vitest"
import { contactSchema } from "@/lib/contact-schema"

const valid = {
  name: "สมชาย ใจดี",
  email: "somchai@example.com",
  subject: "สอบถามเรื่องคอร์ส",
  message: "อยากทราบรายละเอียดเพิ่มเติมของคอร์สครับ",
}

describe("contactSchema", () => {
  it("ข้อมูลครบถ้วนถูกต้องผ่านการตรวจสอบ", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })

  it("ตัด whitespace รอบค่าก่อนตรวจความยาว", () => {
    const result = contactSchema.safeParse({ ...valid, name: "  สมชาย ใจดี  " })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.name).toBe("สมชาย ใจดี")
  })

  it("ชื่อสั้นกว่า 2 ตัวอักษร ไม่ผ่าน", () => {
    expect(contactSchema.safeParse({ ...valid, name: "ก" }).success).toBe(false)
  })

  it("อีเมลรูปแบบผิด ไม่ผ่าน", () => {
    expect(contactSchema.safeParse({ ...valid, email: "invalid" }).success).toBe(false)
  })

  it("หัวข้อสั้นกว่า 3 ตัวอักษร ไม่ผ่าน", () => {
    expect(contactSchema.safeParse({ ...valid, subject: "ab" }).success).toBe(false)
  })

  it("ข้อความสั้นกว่า 10 ตัวอักษร ไม่ผ่าน", () => {
    expect(contactSchema.safeParse({ ...valid, message: "สั้นไป" }).success).toBe(false)
  })

  it("ข้อความยาวเกิน 2000 ตัวอักษร ไม่ผ่าน", () => {
    expect(contactSchema.safeParse({ ...valid, message: "ก".repeat(2001) }).success).toBe(false)
  })
})
