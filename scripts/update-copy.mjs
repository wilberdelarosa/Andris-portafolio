import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'app/src/content/contact-copy.ts');
let content = fs.readFileSync(file, 'utf8');

// Modificamos español
content = content.replace(
  /budgets: \[\s*"Hasta US\$150,000",\s*"US\$150,000 a US\$200,000",\s*"US\$200,000 a US\$300,000",\s*"Más de US\$300,000",\s*"Necesito orientación",\s*\],/,
  `budgets: [
      "Menos de US$150,000",
      "US$150,000 a US$250,000",
      "US$250,000 a US$400,000",
      "US$400,000 a US$600,000",
      "US$600,000 a US$800,000",
      "Más de US$800,000",
      "Necesito orientación",
    ],`
);

content = content.replace(
  /timeframes: \[\s*"En los próximos 3 meses",\s*"Entre 3 y 6 meses",\s*"Entre 6 y 12 meses",\s*"En más de 12 meses",\s*"Estoy explorando opciones",\s*\],/,
  `timeframes: [
      "Busco adquirir desde ya",
      "En los próximos 3 meses",
      "Entre 3 y 6 meses",
      "Entre 6 y 12 meses",
      "En más de 12 meses",
      "Estoy explorando opciones",
    ],`
);

// Modificamos inglés
content = content.replace(
  /budgets: \[\s*"Up to US\$150,000",\s*"US\$150,000 to US\$200,000",\s*"US\$200,000 to US\$300,000",\s*"Over US\$300,000",\s*"I need guidance",\s*\],/,
  `budgets: [
      "Less than US$150,000",
      "US$150,000 to US$250,000",
      "US$250,000 to US$400,000",
      "US$400,000 to US$600,000",
      "US$600,000 to US$800,000",
      "Over US$800,000",
      "I need guidance",
    ],`
);

content = content.replace(
  /timeframes: \[\s*"Within 3 months",\s*"In 3 to 6 months",\s*"In 6 to 12 months",\s*"In more than 12 months",\s*"I am exploring options",\s*\],/,
  `timeframes: [
      "I want to buy right now",
      "Within 3 months",
      "In 3 to 6 months",
      "In 6 to 12 months",
      "In more than 12 months",
      "I am exploring options",
    ],`
);

// Modificamos francés
content = content.replace(
  /budgets: \[\s*"Jusqu'à 150 000 US\$",\s*"150 000 à 200 000 US\$",\s*"200 000 à 300 000 US\$",\s*"Plus de 300 000 US\$",\s*"J'ai besoin de conseils",\s*\],/,
  `budgets: [
      "Moins de 150 000 US$",
      "150 000 à 250 000 US$",
      "250 000 à 400 000 US$",
      "400 000 à 600 000 US$",
      "600 000 à 800 000 US$",
      "Plus de 800 000 US$",
      "J'ai besoin de conseils",
    ],`
);

content = content.replace(
  /timeframes: \[\s*"Dans les 3 prochains mois",\s*"Dans 3 à 6 mois",\s*"Dans 6 à 12 mois",\s*"Dans plus de 12 mois",\s*"Je découvre les options",\s*\],/,
  `timeframes: [
      "Je souhaite acheter immédiatement",
      "Dans les 3 prochains mois",
      "Dans 3 à 6 mois",
      "Dans 6 à 12 mois",
      "Dans plus de 12 mois",
      "Je découvre les options",
    ],`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated contact-copy.ts");
