import { useEffect, useRef, useState } from "react";

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-1 z-[60] bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-[#D6F45A] shadow-[0_0_10px_#D6F45A] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function RevealOnScroll({
  children,
  delay = 0,
  tilt = "0deg",
  className = "",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible
          ? "translate3d(0, 0, 0) scale(1) rotate(0deg)"
          : `translate3d(0, 28px, 0) scale(0.97) rotate(${tilt})`,
      }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
        visible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function RotatingShape({
  variant = "asterisk",
  reverse = false,
  className = "w-12 h-12 text-[#1685F5]",
}) {
  const animClass = reverse ? "animate-spin-slow-reverse" : "animate-spin-slow";

  if (variant === "star") {
    return (
      <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" className={`${animClass} ${className}`}>
        <path d="M32 2L39 25L62 32L39 39L32 62L25 39L2 32L25 25L32 2Z" />
      </svg>
    );
  }

  if (variant === "flower") {
    return (
      <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" className={`${animClass} ${className}`}>
        <circle cx="32" cy="14" r="11" />
        <circle cx="32" cy="50" r="11" />
        <circle cx="14" cy="32" r="11" />
        <circle cx="50" cy="32" r="11" />
        <circle cx="19" cy="19" r="10" />
        <circle cx="45" cy="19" r="10" />
        <circle cx="19" cy="45" r="10" />
        <circle cx="45" cy="45" r="10" />
        <circle cx="32" cy="32" r="12" />
      </svg>
    );
  }

  if (variant === "plus") {
    return (
      <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" className={`${animClass} ${className}`}>
        <rect x="24" y="6" width="16" height="52" rx="8" />
        <rect x="6" y="24" width="52" height="16" rx="8" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="6.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={`${animClass} ${className}`}
    >
      <line x1="32" y1="6" x2="32" y2="58" />
      <line x1="6" y1="32" x2="58" y2="32" />
      <line x1="13" y1="13" x2="51" y2="51" />
      <line x1="51" y1="13" x2="13" y2="51" />
    </svg>
  );
}