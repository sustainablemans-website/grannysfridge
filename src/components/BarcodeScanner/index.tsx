"use client";
import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  useEffect(() => {
    // We delay the initialization slightly to ensure the DOM element exists
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 150 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [0] // 0 means normal camera, no file upload
        },
        /* verbose= */ false
      );

      scanner.render(
        (text) => {
          scanner.clear();
          onScan(text);
        },
        (error) => {
          // ignore continuous scanning warnings
        }
      );

      // Cleanup
      return () => {
        scanner.clear().catch(e => console.error("Scanner clear failed", e));
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [onScan]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "var(--bg-base)", padding: 24, borderRadius: 16, width: "100%", maxWidth: 400, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
        <h3 style={{ marginBottom: 16, textAlign: "center", fontSize: 18, fontWeight: "bold" }}>📸 掃描商品條碼</h3>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>請將條碼對準鏡頭方塊內</p>
        
        {/* html5-qrcode will render inside this div */}
        <div id="reader" style={{ width: "100%", overflow: "hidden", borderRadius: 8 }}></div>
        
        <button 
          className="btn btn-secondary" 
          style={{ width: "100%", marginTop: 24 }} 
          onClick={onClose}
        >
          取消掃描
        </button>
      </div>
    </div>
  );
}
