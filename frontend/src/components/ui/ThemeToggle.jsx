import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ubah ke Light Mode" : "Ubah ke Night Mode"}
      title={isDark ? "Night Mode Aktif — Klik untuk Light Mode" : "Light Mode Aktif — Klik untuk Night Mode"}
      className={`group relative inline-flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 shrink-0 ${
        isDark
          ? "bg-[#090F1E] border-[#D6F45A] shadow-[0_0_12px_rgba(214,244,90,0.45)] hover:scale-105"
          : "bg-[#0F172A] border-[#102B69] hover:scale-105"
      }`}
    >
      <svg
        viewBox="0 0 48 48"
        className="w-7 h-7 overflow-visible animate-float-gentle"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ghostLimeGrad" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ECFF66" />
            <stop offset="65%" stopColor="#C8F236" />
            <stop offset="100%" stopColor="#86B81A" />
          </radialGradient>
          <filter id="limeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2.2"
              floodColor={isDark ? "#D6F45A" : "#FFFFFF"}
              floodOpacity={isDark ? "0.65" : "0.3"}
            />
          </filter>
        </defs>

        <g filter="url(#limeGlow)">
          {/* Lipatan bawah bagian dalam (kiri bawah seperti referensi) */}
          <path
            d="M11 35 C11 41.5 18 43 24 38.5 C20 35 14 33 11 35 Z"
            fill={isDark ? "#4D6914" : "#A3ADB8"}
          />

          {/* Badan karakter melengkung utuh + ujung bergelombang */}
          <path
            d="M11 35 L11 21 C11 11 17 6 24 6 C31 6 37 11 37 21 L37 36.5 C37 40 31.5 41.5 26 38.2 C21 35.2 14.5 31.5 11 35 Z"
            fill={isDark ? "url(#ghostLimeGrad)" : "#FFFFFF"}
          />

          {/* Sepasang mata bulat hitam berkedip */}
          <g className="animate-cute-blink">
            <circle cx="20" cy="19.5" r="2.2" fill="#0B0F19" />
            <circle cx="28" cy="19.5" r="2.2" fill="#0B0F19" />
          </g>

          {/* Senyum mungil */}
          <path
            d="M21.6 22.8 Q24 25.4 26.4 22.8"
            fill="none"
            stroke="#0B0F19"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </button>
  );
}