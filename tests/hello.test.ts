import { describe, expect, it } from "vitest";

//ฟังชันสำหรับทดสอบ
function sum(a: number, b: number): number {
  return a + b;
}

it("should return the sum of two numbers", () => {
  //arragr เตรียมข้อมูล
  const a = 1;
  const b = 2;

  //act เรียกใช้ฟังชัน
  const result = sum(a, b);

  //assert ตรวจสอบผลลัพธ์
  expect(result).toBe(3);
});

it("should return the sum of two numbers", () => {
  expect(sum(1, 2)).toBe(3);
  expect(sum(-1, 1)).toBe(0);
  expect(sum(0, 0)).toBe(0);
});
