"use client";

import React from "react";
import Image from "next/image";
import { STORAGE_TEMPLATES } from "@/lib/storage-templates";

interface StorageVisualizerProps {
  templateId: string;
  activeRegionId?: string;
  className?: string;
  onRegionClick?: (id: string) => void;
}

export function StorageVisualizer({ templateId, activeRegionId, className = "", onRegionClick }: StorageVisualizerProps) {
  const template = STORAGE_TEMPLATES[templateId];

  if (!template) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "12px", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "16px", width: "100%" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: "200px", aspectRatio: "1 / 1", borderRadius: "8px", overflow: "hidden", background: "var(--bg-base)", border: "2px solid var(--border)", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <Image
          src={template.imageUrl}
          alt={template.name}
          fill
          style={{ objectFit: "contain", padding: "8px" }}
        />
        {template.regions.map(region => {
          const isActive = activeRegionId === region.id;
          return (
            <div
              key={region.id}
              onClick={() => onRegionClick && onRegionClick(region.id)}
              style={{
                position: "absolute",
                pointerEvents: onRegionClick ? "auto" : "none",
                cursor: onRegionClick ? "pointer" : "default",
                transition: "all 0.3s",
                left: `${region.bounds.x}%`,
                top: `${region.bounds.y}%`,
                width: `${region.bounds.width}%`,
                height: `${region.bounds.height}%`,
                border: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                backgroundColor: isActive ? "rgba(59,130,246,0.3)" : (onRegionClick ? "rgba(255,255,255,0.1)" : "transparent"),
                boxShadow: isActive ? "0 0 15px rgba(59,130,246,0.5)" : "none",
                zIndex: isActive ? 10 : 1,
              }}
            >
              {isActive && (
                 <div style={{
                   position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                   backgroundColor: "#2563eb", color: "white", fontSize: "10px", fontWeight: "bold",
                   padding: "4px 8px", borderRadius: "4px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                   whiteSpace: "nowrap"
                 }}>
                   {region.name}
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
