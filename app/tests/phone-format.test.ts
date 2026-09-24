import test from "node:test";
import assert from "node:assert/strict";
import {
  formatPhone,
  formatPhoneWithCaret,
  phoneDigits,
} from "../src/lib/phone-format.ts";

test("agrupa el plan +1 (Republica Dominicana, EE. UU., Canada)", () => {
  assert.equal(formatPhone("+18095551234"), "+1 809 555 1234");
  assert.equal(formatPhone("+1809"), "+1 809");
  assert.equal(formatPhone("+1"), "+1");
  assert.equal(formatPhone("+"), "+");
});

test("acepta pegar un numero con parentesis, guiones o 00 delante", () => {
  assert.equal(formatPhone("+1 (809) 555-1234"), "+1 809 555 1234");
  assert.equal(formatPhone("0018095551234"), "+1 809 555 1234");
  assert.equal(formatPhone("+1.809.555.1234"), "+1 809 555 1234");
});

test("no bloquea formatos internacionales fuera del mercado principal", () => {
  assert.equal(formatPhone("+33612345678"), "+33 6 12 34 56 78");
  assert.equal(formatPhone("+34612345678"), "+34 612 345 678");
  assert.equal(formatPhone("+351912345678"), "+351 912 345 678");
  // Prefijo que la tabla no conoce: se agrupa de tres en tres, no se pierde.
  assert.equal(formatPhone("+59170012345"), "+591 700 123 45");
});

test("sin prefijo no inventa un pais", () => {
  assert.equal(formatPhone("8095551234"), "809 555 1234");
  assert.equal(formatPhone("809"), "809");
});

test("nunca descarta digitos, aunque sobren para el plan", () => {
  const largo = "+1809555123499999";
  assert.equal(phoneDigits(formatPhone(largo)), phoneDigits(largo));
});

test("es idempotente: reformatear el resultado no lo cambia", () => {
  for (const value of ["+18095551234", "+33612345678", "8095551234", "+1", ""]) {
    const once = formatPhone(value);
    assert.equal(formatPhone(once), once);
  }
});

test("el cursor se conserva por digitos, no por caracteres", () => {
  // "+1809|5551234": 4 digitos a la izquierda del cursor.
  const { value, caret } = formatPhoneWithCaret("+18095551234", 5);
  assert.equal(value, "+1 809 555 1234");
  assert.equal(phoneDigits(value.slice(0, caret)).length, 4);
});

test("un campo vacio sigue vacio", () => {
  assert.equal(formatPhone(""), "");
  assert.equal(formatPhone("   "), "");
});
