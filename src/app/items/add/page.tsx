"use client";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";

export default function AddItemPage() {
  const router = useRouter();
  // Redirect to items list with modal open signal  or just go back
  if (typeof window !== "undefined") router.push("/items");
  return (
    <div className="page-layout">
      <Navigation />
      <main className="main-content">
        <p style={{ color:"var(--text-muted)" }}>重新導向中...</p>
      </main>
    </div>
  );
}