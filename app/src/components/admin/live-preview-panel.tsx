"use client";

import { useMemo } from "react";
import { PropertyCard } from "../property-card";
import { ExperienceProvider } from "../experience-provider";
import { draftToProject, type DraftPreview } from "@/lib/cms/draft-preview";

export type { DraftPreview } from "@/lib/cms/draft-preview";

export function LivePreviewPanel({ activeTab, draft }: { activeTab: string, draft: DraftPreview }) {
  const project = useMemo(() => draftToProject(draft), [draft]);
  
  const hasCoords = !!project.map.coordinates && project.map.coordinates.length === 2 && !isNaN(project.map.coordinates[0]);

  return (
    <div className="admin-preview-panel">
      <div className="admin-preview-header">
        <h3>Vista Previa en Vivo</h3>
        <span className="admin-preview-badge">Reactiva</span>
      </div>
      
      <div className="admin-preview-content">
        {activeTab === "mapa" ? (
          <div className="admin-preview-map">
            {hasCoords ? (
              <div className="admin-preview-iframe-wrapper">
                 <iframe 
                   src={`https://maps.google.com/maps?q=${project.map.coordinates![0]},${project.map.coordinates![1]}&t=k&z=17&output=embed`}
                   width="100%" 
                   height="100%" 
                   style={{ border: 0, borderRadius: '12px' }} 
                   allowFullScreen 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade"
                 />
              </div>
            ) : (
              <div className="admin-preview-empty-map">
                <p>Ingresa un enlace de Google Maps o coordenadas para previsualizar el mapa.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="admin-preview-card-wrapper">
            <ExperienceProvider>
              <div style={{ pointerEvents: "none" }}>
                <PropertyCard project={project} />
              </div>
            </ExperienceProvider>
          </div>
        )}
      </div>
    </div>
  );
}
