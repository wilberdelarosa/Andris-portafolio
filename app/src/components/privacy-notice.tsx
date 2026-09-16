"use client";
import { contactCopy } from "@/content/contact-copy";
import { useExperience } from "./experience-provider";

export function PrivacyNotice() {
  const { locale } = useExperience();
  return (
    <div className="privacy-notice">
      {contactCopy[locale].privacyParagraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
