"use client";

import { useEffect, useState } from "react";
import { DM_Mono } from "next/font/google";

const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"] });

export default function VerdictBlock({ game, score }) {
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchVerdict() {
      try {
        const res = await fetch("/api/verdict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game, score }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setVerdict(data.verdict);
      } catch (err) {
        if (!cancelled) setError("Couldn't get a verdict.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVerdict();
    return () => { cancelled = true; };
  }, [game.id]); // only game.id as dep — stable, won't re-fire on re-render

  return (
    <div style={{
      background: "#111111",
      border: "1px solid #1e1e1e",
      padding: "32px 32px 28px",
      marginBottom: 2,
    }}>
      <p style={{
        fontSize: 9,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "#2e2e2e",
        marginBottom: 16,
      }}>
        Verdict
      </p>

      {loading && (
        <p style={{ fontSize: 12, color: "#2a2a2a", fontStyle: "italic" }}>
          Writing verdict...
        </p>
      )}

      {error && !loading && (
        <p style={{ fontSize: 12, color: "#e85a1a" }}>{error}</p>
      )}

      {verdict && (
        <p style={{
          fontSize: 13,
          color: "#f0ede8",
          lineHeight: 1.75,
          fontWeight: 300,
          maxWidth: 520,
        }}>
          {verdict}
        </p>
      )}
    </div>
  );
}