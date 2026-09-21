import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'app/src/components/contact-section.tsx');
let content = fs.readFileSync(file, 'utf8');

const originalModal = `<div className="summary-actions">
          <button
            className="button button-primary"
            onClick={() => downloadText("consulta-andris-pena.txt", summary)}
          >
            <DownloadSimple size={18} />
            {t.download}
          </button>
          <button
            className="button button-outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(summary);
                setCopied(true);
              } catch {
                downloadText("consulta-andris-pena.txt", summary);
              }
            }}
          >
            <Copy size={18} />
            {copied ? t.copied : t.copy}
          </button>
        </div>
        {email && (
          <a
            className="contact-channel"
            href={\`mailto:\${email}?subject=\${encodeURIComponent("Consulta a Andris Peña")}&body=\${encodeURIComponent(summary)}\`}
          >
            <EnvelopeSimple size={20} />
            {t.sendEmail}
            <ArrowUpRight />
          </a>
        )}
        {whatsapp && (
          <a
            className="contact-channel"
            href={\`https://wa.me/\${whatsapp}?text=\${encodeURIComponent(summary)}\`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappLogo size={20} />
            {t.sendWhatsApp}
            <ArrowUpRight />
          </a>
        )}`;

const newModal = `
        {whatsapp && (
          <a
            className="button button-primary"
            style={{ width: "100%", height: "54px", marginBottom: "16px", fontSize: "16px", background: "#25D366", color: "#fff", borderColor: "#25D366" }}
            href={\`https://wa.me/\${whatsapp}?text=\${encodeURIComponent(summary)}\`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappLogo size={22} weight="fill" />
            {t.sendWhatsApp}
          </a>
        )}
        <div className="summary-actions">
          <button
            className="button button-outline"
            onClick={() => downloadText("consulta-andris-pena.txt", summary)}
          >
            <DownloadSimple size={18} />
            {t.download}
          </button>
          <button
            className="button button-outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(summary);
                setCopied(true);
              } catch {
                downloadText("consulta-andris-pena.txt", summary);
              }
            }}
          >
            <Copy size={18} />
            {copied ? t.copied : t.copy}
          </button>
        </div>
        {email && (
          <a
            className="contact-channel"
            href={\`mailto:\${email}?subject=\${encodeURIComponent("Consulta a Andris Peña")}&body=\${encodeURIComponent(summary)}\`}
          >
            <EnvelopeSimple size={20} />
            {t.sendEmail}
            <ArrowUpRight />
          </a>
        )}`;

// Some characters might be mangled so let's do a substring replace if needed.
// Better yet, just use standard string matching with a robust strategy.
const indexOfSummaryActions = content.indexOf('<div className="summary-actions">');
const indexOfEmailAndWhatsapp = content.indexOf('!email && !whatsapp');

if (indexOfSummaryActions !== -1 && indexOfEmailAndWhatsapp !== -1) {
  const prefix = content.slice(0, indexOfSummaryActions);
  const suffix = content.slice(indexOfEmailAndWhatsapp);
  content = prefix + newModal + "\n        {!" + suffix.slice(2);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Updated contact-section.tsx successfully");
} else {
  console.log("Could not find the target strings in contact-section.tsx");
}
