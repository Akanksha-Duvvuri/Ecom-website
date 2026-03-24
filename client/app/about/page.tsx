"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Terminal } from "lucide-react"

export default function AboutPage() {
  const router = useRouter();

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", color: "#fff", padding: "50px" }}>
      {/* Hero */}

      <Link href="/">
        <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}  onMouseEnter={e => (e.currentTarget.style.color = "#e8e8e8")}
          onMouseLeave={e => (e.currentTarget.style.color = "#555")}>←  Click here to go back</p>
      </Link>

      
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }} >
        <Terminal  size={60} color="#fff"></Terminal>
        <Link href="/">
        <h1 style= {{fontSize: "60px"}}> TurNext
        <span style={{
            display: "inline-block",
            width: 2, height: "60px",
            background: "#fff",
            marginLeft: 20,
            verticalAlign: "middle",
            animation: "blink 1.5s ease-in-out infinite",
          }} />


        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
       </h1>
      </Link>
      
      </div>

      

      <div style={{
        padding: "6rem 2rem 4rem",
        textAlign: "center",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Who we are</p>
        <h1 style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 700, lineHeight: 1.1,
          letterSpacing: "-0.03em", marginBottom: "1.5rem",
        }}>
          Built for those who<br />
          <span style={{ color: "#555" }}>dress with intention.</span>
        </h1>
        <p style={{ fontSize: 16, color: "#666", maxWidth: 520, margin: "0 auto", lineHeight: 1.8 }}>
          TurNext is a clothing brand for people who see style as self-expression — not a trend to follow, but a language to speak.
        </p>
      </div>

      {/* Values */}
      <div style={{ padding: "4rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}>
          {[
            { title: "Quality first", desc: "Every piece is selected for its material, fit and finish. No fast fashion, no cutting corners." },
            { title: "Minimal by design", desc: "We strip away the noise. Clean silhouettes, muted palettes, timeless cuts." },
            { title: "Built to last", desc: "We'd rather you buy one great piece than ten mediocre ones. That's the TurNext standard." },
            { title: "For everyone", desc: "Style has no size, no gender, no age. Our collections are designed to fit all identities." },
          ].map(({ title, desc }) => (
            <div key={title} style={{
              background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: 14, padding: "1.5rem",
            }}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{title}</p>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div style={{
        padding: "4rem 2rem",
        background: "#111",
        borderTop: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Our story</p>
          <p style={{ fontSize: 16, color: "#aaa", lineHeight: 1.9, marginBottom: "1.25rem" }}>
            TurNext started as an idea — that clothing should feel intentional. Not a uniform, not a costume, but an extension of who you are.
          </p>
          <p style={{ fontSize: 16, color: "#aaa", lineHeight: 1.9, marginBottom: "1.25rem" }}>
            We started small, curating pieces that we'd actually wear ourselves. Every item in our store has been worn, tested, and loved before it ever reaches you.
          </p>
          <p style={{ fontSize: 16, color: "#aaa", lineHeight: 1.9 }}>
            Today, TurNext is more than a store — it's a community of people who believe that how you dress is how you show up in the world.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        padding: "4rem 2rem",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, marginBottom: "1rem" }}>
          Ready to build your identity?
        </h2>
        <p style={{ fontSize: 14, color: "#555", marginBottom: "2rem" }}>
          Browse our latest collection and find what speaks to you.
        </p>
        <Link href="/shop" style={{
          padding: "13px 40px", background: "#fff", color: "#000",
          borderRadius: 10, fontSize: 14, fontWeight: 600,
          textDecoration: "none", display: "inline-block",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#e8e8e8")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
        >
          Shop now
        </Link>
      </div>
    </div>
  );
}