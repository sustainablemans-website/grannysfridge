"use client";

import React, { useState } from "react";
import { STORAGE_TEMPLATES } from "@/lib/storage-templates";
import { StorageVisualizer } from "@/components/StorageVisualizer";
import { useLanguage } from "@/store/LanguageContext";

export default function TestVisualizerPage() {
  const { language, setLanguage, t } = useLanguage();
  const [activeRegions, setActiveRegions] = useState<Record<string, string>>({});

  const handleRegionClick = (templateId: string, regionId: string) => {
    setActiveRegions(prev => ({ ...prev, [templateId]: regionId }));
  };

  return (
    <div style={{ padding: "40px", minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>儲存空間視覺化測試畫面</h1>
        <button 
          className="btn btn-secondary" 
          onClick={() => setLanguage(language === "zh-TW" ? "en-US" : "zh-TW")}
        >
          切換語言: {language}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px" }}>
        {Object.entries(STORAGE_TEMPLATES).map(([templateId, template]) => (
          <div key={templateId} className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>{template.name}</h2>
            
            <StorageVisualizer 
              templateId={templateId} 
              activeRegionId={activeRegions[templateId]} 
              className="w-full max-w-[300px]"
            />

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              <button 
                className={`btn btn-sm ${!activeRegions[templateId] ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleRegionClick(templateId, "")}
              >
                清除選取
              </button>
              {template.regions.map(region => (
                <button
                  key={region.id}
                  className={`btn btn-sm ${activeRegions[templateId] === region.id ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => handleRegionClick(templateId, region.id)}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
