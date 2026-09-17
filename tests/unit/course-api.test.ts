import { describe, expect, it, vi } from "vitest"
import {
  CourseApiError,
  DEFAULT_COURSE_API_URL,
  fetchCourses,
  resolveCourseApiUrl,
} from "@/lib/course/course-api"

const validCourse = {
  id: 1,
  title: "ทดสอบซอฟต์แวร์เบื้องต้น",
  detail: "เรียนรู้การเขียนเทสต์ตั้งแต่ unit ถึง e2e",
  date: "2025-01-15",
  view: 100,
  picture: "https://example.com/picture.png",
}

describe("resolveCourseApiUrl", () => {
  it("ใช้ COURSE_API_URL จาก env เมื่อมีค่า", () => {
    expect(resolveCourseApiUrl({ COURSE_API_URL: "https://mock.local/course" })).toBe(
      "https://mock.local/course"
    )
  })

  it("ตัด whitespace รอบค่าที่ตั้งไว้", () => {
    expect(resolveCourseApiUrl({ COURSE_API_URL: "  https://mock.local/course  " })).toBe(
      "https://mock.local/course"
    )
  })

  it("ไม่ตั้งค่าหรือเป็นค่าว่าง ตกกลับไปใช้ endpoint จริง", () => {
    expect(resolveCourseApiUrl({})).toBe(DEFAULT_COURSE_API_URL)
    expect(resolveCourseApiUrl({ COURSE_API_URL: "   " })).toBe(DEFAULT_COURSE_API_URL)
  })
})

describe("fetchCourses", () => {
  it("คืนรายการหลักสูตรเมื่อ response ถูกต้องตาม schema", async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ data: [validCourse] }), { status: 200 })
    )

    const courses = await fetchCourses({ fetchImpl, url: "https://mock.local/course" })

    expect(courses).toEqual([validCourse])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it("เชื่อมต่อไม่สำเร็จ (fetch throw) โยน CourseApiError", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down")
    })

    await expect(fetchCourses({ fetchImpl })).rejects.toBeInstanceOf(CourseApiError)
  })

  it("response ไม่ ok โยน CourseApiError", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("server error", { status: 500, statusText: "Internal Server Error" })
    )

    await expect(fetchCourses({ fetchImpl })).rejects.toBeInstanceOf(CourseApiError)
  })

  it("response ไม่ใช่ JSON โยน CourseApiError", async () => {
    const fetchImpl = vi.fn(async () => new Response("not json at all", { status: 200 }))

    await expect(fetchCourses({ fetchImpl })).rejects.toBeInstanceOf(CourseApiError)
  })

  it("รูปแบบข้อมูลไม่ตรง schema โยน CourseApiError", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: [{ id: 1, title: "ขาดฟิลด์อื่น" }] }), {
          status: 200,
        })
    )

    await expect(fetchCourses({ fetchImpl })).rejects.toBeInstanceOf(CourseApiError)
  })
})
