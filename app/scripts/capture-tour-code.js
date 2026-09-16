export default async function captureTourCode(page) {
  const views = ["Exterior", "Entrada", "Sala", "Cocina", "Dormitorio", "Terraza"];
  const canvas = page.locator("canvas");
  for (const view of views) {
    await page.getByRole("button", { name: view, exact: true }).click();
    await page.waitForTimeout(2200);
  }
  const box = await canvas.boundingBox();
  if (box) {
    for (let i = 0; i < 3; i++) {
      await page.mouse.move(box.x + box.width * 0.28, box.y + box.height * 0.52);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.45, { steps: 20 });
      await page.mouse.up();
      await page.waitForTimeout(1800);
    }
  }
  await page.waitForTimeout(3000);
  return "recorrido grabado";
}
