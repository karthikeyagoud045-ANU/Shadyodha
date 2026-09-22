export function Logo({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-[#3b2d71] via-[#4f46e5] to-[#8b5cf6] p-[1.5px] shadow-glow">
        <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0A0D25]">
          <svg viewBox="0 0 36 36" className="h-6 w-6 animate-eye-glow" aria-hidden>
            <defs>
              <linearGradient id="irisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="45%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <radialGradient id="pupilGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#030712" />
                <stop offset="70%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
            </defs>
            {/* Outer eye contour */}
            <path
              d="M3 18 C 8 9, 28 9, 33 18 C 28 27, 8 27, 3 18 Z"
              fill="none"
              stroke="url(#irisGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Iris circle */}
            <circle cx="18" cy="18" r="8" fill="url(#irisGrad)" />
            {/* Inner pupil */}
            <circle cx="18" cy="18" r="4.5" fill="url(#pupilGlow)" />
            {/* Tech concentric circular reticle */}
            <circle
              cx="18"
              cy="18"
              r="6.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity="0.7"
              strokeDasharray="2.5 2"
            />
            {/* Glint light catch */}
            <circle cx="16" cy="16" r="1.5" fill="#ffffff" />
          </svg>
        </div>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
      </div>
      {!compact && (
        <div>
          <p
            className={`text-base font-bold tracking-wide ${
              light ? "text-white" : "text-white"
            }`}
          >
            DRISHTI AI
          </p>
          <p className="text-[11px] font-normal tracking-tight text-indigo-200/70">
            Explainable AI for Retinal Screening
          </p>
        </div>
      )}
    </div>
  );
}

