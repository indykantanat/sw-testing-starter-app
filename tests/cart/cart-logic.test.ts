import { addItem, lineTotal } from "@/lib/cart/cart-logic";
import { CartItem } from "@/types/cart";
import { describe, expect, it } from "vitest";

const item = (over: Partial<CartItem> = {}): CartItem => ({
  productId: 1,
  name: "สินค้าทดสอบ",
  price: 100,
  qty: 1,
  ...over,
});

describe("addItem", () => {
  it("เพิ่มสินค้าใหม่เข้าไปในตะกร้า", () => {
    //arrange
    const product = item();
    //act
    const result = addItem([], product);
    //assert
    expect(result).toEqual([product]);
  });
});

describe("lineTotal", () => {
  it.for([
    {qty:1,price:100,total:100},
    {qty:2,price:100,total:200},
    {qty:3,price:100,total:300},
  ])("คำนวน $qty x $price", ({qty, price, total }) => {
    const product = item({qty, price});
    const result = lineTotal(product);
    expect(result).toBe(total);
  });
});
