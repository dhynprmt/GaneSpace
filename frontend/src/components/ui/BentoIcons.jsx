const BOX_THEMES = {
  lime: "bg-[#D6F45A] text-[#102B69] border-[#102B69] shadow-[2px_2px_0_0_#102B69]",
  royal: "bg-[#102B69] text-[#D6F45A] border-[#102B69] dark:border-[#D6F45A] shadow-[2px_2px_0_0_#1685F5]",
  blue: "bg-[#1649B8] text-white border-[#102B69] dark:border-[#D6F45A] shadow-[2px_2px_0_0_#102B69]",
  danger: "bg-[#FF5A5F] text-white border-[#102B69] shadow-[2px_2px_0_0_#102B69]",
  amber: "bg-[#FFD166] text-[#102B69] border-[#102B69] shadow-[2px_2px_0_0_#102B69]",
};

export default function BentoIcon({ name = "device", tone = "lime", size = "md" }) {
  const dim = size === "sm" ? "w-9 h-9 rounded-xl" : "w-11 h-11 rounded-2xl";
  const svgDim = size === "sm" ? "w-5 h-5" : "w-6 h-6";

  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center border-2 shrink-0 ${dim} ${
        BOX_THEMES[tone] || BOX_THEMES.lime
      }`}
    >
      <svg viewBox="0 0 28 28" fill="none" className={svgDim}>
        {name === "device" && (
          <>
            <rect x="4" y="6" width="20" height="13" rx="2.5" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.2" />
            <rect x="8" y="9.5" width="7" height="2.5" rx="1.2" fill="currentColor" />
            <path d="M2.5 22H25.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </>
        )}

        {name === "alert" && (
          <>
            <path d="M14 4L25 22.5H3L14 4Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M14 11V16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="14" cy="19.3" r="1.4" fill="currentColor" />
          </>
        )}

        {name === "users" && (
          <>
            <circle cx="11" cy="10" r="3.8" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.2" />
            <path d="M4.5 22.5C4.5 18.8 7.4 16.5 11 16.5C14.6 16.5 17.5 18.8 17.5 22.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="19.5" cy="11" r="2.6" stroke="currentColor" strokeWidth="2" />
            <path d="M19.5 16.5C21.8 16.8 23.5 18.4 23.5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {name === "student" && (
          <>
            <path d="M14 5L25 10.5L14 16L3 10.5L14 5Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M7.5 13V19.5C7.5 21 10.5 22.5 14 22.5C17.5 22.5 20.5 21 20.5 19.5V13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}

        {name === "org" && (
          <>
            <rect x="5" y="5" width="11" height="18" rx="2" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.2" />
            <path d="M16 11H23V23H16" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M9 10H12M9 14H12M9 18H12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}

        {name === "calendar" && (
          <>
            <rect x="4" y="6.5" width="20" height="17" rx="3" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.2" />
            <path d="M4 12H24" stroke="currentColor" strokeWidth="2.2" />
            <path d="M9.5 4V8.5M18.5 4V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="9" y="15.5" width="4" height="4" rx="1" fill="currentColor" />
          </>
        )}

        {name === "verify" && (
          <>
            <path d="M14 3.5L22.5 7V13.5C22.5 18.8 18.8 22.8 14 24.5C9.2 22.8 5.5 18.8 5.5 13.5V7L14 3.5Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M10 14L12.8 16.8L18.2 11.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {name === "moderation" && (
          <>
            <rect x="5" y="4.5" width="18" height="19" rx="3" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.2" />
            <path d="M9.5 11.5H18.5M9.5 16H15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="19" cy="19" r="4" fill="#D6F45A" stroke="#102B69" strokeWidth="1.8" />
          </>
        )}

        {name === "security" && (
          <>
            <rect x="6" y="12.5" width="16" height="11" rx="2.5" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.2" />
            <path d="M9.5 12.5V9.2C9.5 6.8 11.5 5 14 5C16.5 5 18.5 6.8 18.5 9.2V12.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="14" cy="18" r="1.8" fill="currentColor" />
          </>
        )}
      </svg>
    </span>
  );
}