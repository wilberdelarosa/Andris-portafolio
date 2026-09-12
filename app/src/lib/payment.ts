export interface PaymentInput {
  price: number;
  signing: number;
  construction: number;
  months: number;
}
export function calculatePayment(input: PaymentInput) {
  const { price, signing, construction, months } = input;
  if (![price, signing, construction, months].every(Number.isFinite))
    throw new Error("finite");
  if (
    price < 0.01 ||
    price > 100000000 ||
    signing < 0 ||
    construction < 0 ||
    signing + construction > 100 ||
    !Number.isInteger(months) ||
    months < 1 ||
    months > 120
  )
    throw new Error("range");
  const totalCents = Math.round(price * 100);
  const signingCents = Math.round((totalCents * signing) / 100);
  const constructionCents = Math.min(
    totalCents - signingCents,
    Math.round((totalCents * construction) / 100),
  );
  const monthlyCents = Math.floor(constructionCents / months);
  const lastMonthlyCents = constructionCents - monthlyCents * (months - 1);
  return {
    total: totalCents / 100,
    signing: signingCents / 100,
    construction: constructionCents / 100,
    delivery: (totalCents - signingCents - constructionCents) / 100,
    deliveryPercent: 100 - signing - construction,
    monthly: monthlyCents / 100,
    lastMonthly: lastMonthlyCents / 100,
    months,
  };
}
