import test from "node:test";
import assert from "node:assert/strict";
import { calculatePayment } from "../src/lib/payment.ts";
test("full allocation of odd cents cannot create a negative delivery balance", () => {
  const p = calculatePayment({
    price: 1.01,
    signing: 50,
    construction: 50,
    months: 1,
  });
  assert.equal(p.signing, 0.51);
  assert.equal(p.construction, 0.5);
  assert.equal(p.delivery, 0);
  assert.throws(() =>
    calculatePayment({
      price: 0.001,
      signing: 10,
      construction: 40,
      months: 1,
    }),
  );
});
test("10/40/50 scenario preserves full value and construction installments", () => {
  const p = calculatePayment({
    price: 150000,
    signing: 10,
    construction: 40,
    months: 24,
  });
  assert.equal(p.signing, 15000);
  assert.equal(p.construction, 60000);
  assert.equal(p.delivery, 75000);
  assert.equal(p.monthly, 2500);
  assert.equal(p.lastMonthly, 2500);
});
test("fractional cents reconcile through the last installment", () => {
  const p = calculatePayment({
    price: 113900.99,
    signing: 10,
    construction: 40,
    months: 37,
  });
  assert.equal(
    Math.round((p.signing + p.construction + p.delivery) * 100),
    11390099,
  );
  assert.equal(
    Math.round((p.monthly * 36 + p.lastMonthly) * 100),
    Math.round(p.construction * 100),
  );
});
test("single month and zero construction require no division special cases", () => {
  const p = calculatePayment({
    price: 123456.78,
    signing: 100,
    construction: 0,
    months: 1,
  });
  assert.equal(p.delivery, 0);
  assert.equal(p.monthly, 0);
  assert.equal(p.lastMonthly, 0);
});
test("invalid amounts, overallocated percentages and invalid months are rejected", () => {
  const baseline = { price: 150000, signing: 10, construction: 40, months: 24 };
  for (const invalid of [
    { price: 0 },
    { price: -1 },
    { price: Infinity },
    { price: NaN },
    { price: 100000001 },
    { signing: -1 },
    { construction: 95 },
    { months: 0 },
    { months: 121 },
    { months: 1.5 },
  ])
    assert.throws(() => calculatePayment({ ...baseline, ...invalid }));
});
