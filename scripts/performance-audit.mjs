import { chromium } from 'playwright';
import fs from 'fs';

const pagesToTest = [
  { name: "Inicio (Home)", url: "http://localhost:3000/" },
  { name: "Proyectos", url: "http://localhost:3000/proyectos" },
  { name: "Detalle de Proyecto", url: "http://localhost:3000/proyectos/melcon-paradise" },
  { name: "Mapa", url: "http://localhost:3000/mapa" },
  { name: "Calculadora", url: "http://localhost:3000/calculadora" },
  { name: "Contacto", url: "http://localhost:3000/contacto" },
  { name: "Login Admin", url: "http://localhost:3000/admin" }
];

async function runAudit() {
  console.log("Iniciando auditoria de rendimiento y errores...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  let dashboardMd = "# Dashboard de Rendimiento y Errores\\n\\nEste dashboard presenta los resultados de la auditoria automatizada en tiempo real de los modulos de la aplicacion.\\n\\n## Resumen Ejecutivo\\n";

  let totalErrors = 0;
  let results = [];

  for (const pageInfo of pagesToTest) {
    const page = await context.newPage();
    let pageErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', exception => {
      pageErrors.push(exception.message);
    });

    console.log("Auditando " + pageInfo.name + "...");
    const startTime = Date.now();
    
    try {
      await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const loadTime = Date.now() - startTime;
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        loadTime,
        errors: pageErrors,
        responsiveIssues: hasHorizontalScroll ? ["Existe scroll horizontal (posible solapamiento)"] : []
      });
      totalErrors += pageErrors.length;
    } catch (error) {
      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        loadTime: "Timeout/Error",
        errors: [error.message],
        responsiveIssues: []
      });
      totalErrors += 1;
    }
    
    await page.close();
  }

  await browser.close();

  dashboardMd += "- **Total de modulos auditados:** " + results.length + "\\n";
  dashboardMd += "- **Errores de consola totales detectados:** " + totalErrors + "\\n\\n";
  dashboardMd += "## Resultados por Modulo\\n\\n";

  for (const res of results) {
    dashboardMd += "### " + res.name + "\\n";
    dashboardMd += "- **Tiempo de Carga (Network Idle):** " + res.loadTime + "ms\\n";
    dashboardMd += "- **Estado Responsive:** " + (res.responsiveIssues.length > 0 ? "⚠️ Alertas detectadas" : "✅ Estable") + "\\n";
    if (res.responsiveIssues.length > 0) {
      res.responsiveIssues.forEach(i => dashboardMd += "  - " + i + "\\n");
    }
    dashboardMd += "- **Errores de Consola:** " + (res.errors.length > 0 ? "⚠️ Errores encontrados" : "✅ Sin errores") + "\\n";
    if (res.errors.length > 0) {
      dashboardMd += "  ```text\\n";
      res.errors.forEach(e => dashboardMd += "  " + e + "\\n");
      dashboardMd += "  ```\\n";
    }
    dashboardMd += "\\n";
  }

  fs.writeFileSync('performance-dashboard.md', dashboardMd);
  console.log("Auditoria finalizada. performance-dashboard.md creado.");
}

runAudit().catch(console.error);
