// "Worth-It Score"


export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden">

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Faint radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(249,115,22,0.06),transparent)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* Eyebrow label */}
        <p className="mb-6 text-[10px] tracking-[0.25em] uppercase text-[#3d3a37] font-mono">
          Worth-It-Score
        </p>

        {/* Heading */}
        <h1
          className="text-[clamp(2.8rem,8vw,6rem)] font-bold leading-none tracking-tight text-[#f5f0e8]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Worth-It Score
        </h1>

        {/* Accent rule */}
        <div className="mt-5 mb-5 h-[1.5px] w-40 bg-orange-500 opacity-80 rounded-full" />

        {/* Subtitle */}
        <p
          className="max-w-sm text-[0.9rem] leading-relaxed tracking-wide text-[#635e59]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Was last night&apos;s NBA game worth staying up for?{" "}
          <span className="text-[#857d76]">Let&apos;s find out.</span>
        </p>

      </div>

      {/* Bottom metadata strip */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#2a2825] font-mono">
          NBA · 2024–25 Season
        </p>
      </div>

    </main>
  );
}
