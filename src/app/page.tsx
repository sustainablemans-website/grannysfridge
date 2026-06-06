"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/store/LanguageContext";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError(t("login.error")); return; }
    setLoading(true); setError("");
    const res = await signIn("credentials", { name: name.trim(), redirect: false });
    if (res?.ok) router.push("/dashboard");
    else { setError(t("login.failed")); setLoading(false); }
  };

  if (status === "loading") return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh" }}>
      <div className="animate-spin" style={{ width:40,height:40,border:"3px solid var(--border)",borderTop:"3px solid var(--accent)",borderRadius:"50%" }} />
    </div>
  );

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at top, rgba(74,158,255,0.08) 0%, var(--bg-base) 60%)",
      padding: 20,
    }}>
      <div style={{ position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position:"absolute",
            borderRadius:"50%",
            background: i%2===0 ? "rgba(74,158,255,0.04)" : "rgba(63,185,80,0.03)",
            width: 200+i*120, height: 200+i*120,
            left: `${10+i*15}%`, top: `${5+i*12}%`,
            animation: `spin ${20+i*5}s linear infinite`,
          }} />
        ))}
      </div>

      <div className="card animate-bounce-in" style={{ width:"100%",maxWidth:440,padding:48,textAlign:"center",position:"relative" }}>
        <div style={{ fontSize:80,marginBottom:16,filter:"drop-shadow(0 8px 24px rgba(74,158,255,0.4))" }}></div>
        <h1 style={{ fontSize:32,fontWeight:700,marginBottom:8,
          background:"linear-gradient(135deg, var(--accent-light), var(--green))",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
        }}>
          {t("app.title")}
        </h1>
        <p style={{ color:"var(--text-secondary)",marginBottom:40,fontSize:15 }}>
          {t("login.subtitle")}
        </p>

        <div style={{ display:"flex",flexDirection:"column",gap:16,textAlign:"center" }}>
          <button
            id="login-google-btn"
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setLoading(true);
              signIn("google", { callbackUrl: "/dashboard" });
            }}
            disabled={loading}
            style={{ justifyContent:"center",padding:"14px 24px",fontSize:16, background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            {loading ? (
              <span className="animate-spin" style={{ display:"inline-block",width:18,height:18,border:"2px solid rgba(0,0,0,0.3)",borderTop:"2px solid var(--accent)",borderRadius:"50%" }} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                <span>🚀 使用 Google 帳號登入</span>
              </div>
            )}
          </button>
        </div>

        <div style={{ marginTop:48,display:"flex",gap:16,justifyContent:"center" }}>
          {[t("login.tag1"), t("login.tag2"), t("login.tag3")].map(f => (
            <span key={f} className="tag">{f}</span>
           ))}
        </div>
      </div>
    </main>
  );
}