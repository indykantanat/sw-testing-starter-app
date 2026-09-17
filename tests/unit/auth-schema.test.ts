import { describe, expect, it } from "vitest"
import { loginSchema, registerSchema } from "@/lib/auth-schema"

describe("loginSchema", () => {
  it("อีเมลและรหัสผ่านถูกต้องผ่านการตรวจสอบ", () => {
    expect(
      loginSchema.safeParse({ email: "user@example.com", password: "password123" }).success
    ).toBe(true)
  })

  it("อีเมลรูปแบบผิด ไม่ผ่าน", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "password123" }).success).toBe(
      false
    )
  })

  it("อีเมลว่าง ไม่ผ่าน", () => {
    expect(loginSchema.safeParse({ email: "", password: "password123" }).success).toBe(false)
  })

  it("รหัสผ่านสั้นกว่า 8 ตัว ไม่ผ่าน", () => {
    expect(loginSchema.safeParse({ email: "user@example.com", password: "short" }).success).toBe(
      false
    )
  })
})

describe("registerSchema", () => {
  const valid = {
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    password: "password123",
    confirmPassword: "password123",
  }

  it("ข้อมูลครบถ้วนและรหัสผ่านตรงกันผ่านการตรวจสอบ", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it("รหัสผ่านกับยืนยันรหัสผ่านไม่ตรงกัน ไม่ผ่าน พร้อมชี้ error ที่ confirmPassword", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "different" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"])
    }
  })

  it("ชื่อสั้นกว่า 2 ตัวอักษร ไม่ผ่าน", () => {
    expect(registerSchema.safeParse({ ...valid, name: "ก" }).success).toBe(false)
  })

  it("ชื่อยาวเกิน 50 ตัวอักษร ไม่ผ่าน", () => {
    expect(registerSchema.safeParse({ ...valid, name: "a".repeat(51) }).success).toBe(false)
  })
})
