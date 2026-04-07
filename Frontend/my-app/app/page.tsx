"use client";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useInView, useMotionValueEvent } from "framer-motion";

const getToken = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split(";")
    .find((row) => row.trim().startsWith("session_token="))
    ?.split("=")[1];
};

interface UpcomingSession {
  id: string;
  topic_name: string;
  subject_name: string;
  scheduled_at: string;
  status: string;
  registered_count: number;
}

const API = process.env.NEXT_PUBLIC_API_URL;

/* ── Animated Counter ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Floating Objects (Anti-Gravity) ── */
function FloatingObjects() {
  const objects = useMemo(() => [
    { emoji: "💡", x: 8, y: 15, size: 36, dur: 6, delay: 0, rotate: 15 },
    { emoji: "📚", x: 85, y: 20, size: 32, dur: 7, delay: 1, rotate: -10 },
    { emoji: "❓", x: 15, y: 60, size: 28, dur: 5, delay: 0.5, rotate: 20 },
    { emoji: "🏆", x: 90, y: 55, size: 34, dur: 8, delay: 2, rotate: -15 },
    { emoji: "🧠", x: 5, y: 80, size: 30, dur: 6.5, delay: 1.5, rotate: 12 },
    { emoji: "⭐", x: 75, y: 75, size: 24, dur: 5.5, delay: 0.8, rotate: -8 },
    { emoji: "🎯", x: 50, y: 10, size: 26, dur: 7.5, delay: 3, rotate: 25 },
    { emoji: "✨", x: 30, y: 85, size: 22, dur: 6, delay: 2.5, rotate: -20 },
    { emoji: "📝", x: 65, y: 40, size: 24, dur: 5, delay: 1.2, rotate: 8 },
    { emoji: "🔬", x: 40, y: 25, size: 26, dur: 7, delay: 0.3, rotate: -12 },
  ], []);

  return (
    <div className="floating-objects">
      {objects.map((obj, i) => (
        <motion.div
          key={i}
          className="floating-obj"
          style={{ left: `${obj.x}%`, top: `${obj.y}%`, fontSize: obj.size }}
          animate={{
            y: [0, -25, 5, -15, 0],
            x: [0, 8, -5, 10, 0],
            rotate: [0, obj.rotate, -obj.rotate / 2, obj.rotate / 3, 0],
          }}
          transition={{
            duration: obj.dur,
            repeat: Infinity,
            delay: obj.delay,
            ease: "easeInOut",
          }}
        >
          {obj.emoji}
        </motion.div>
      ))}
    </div>
  );
}

/* ── Soft Bubbles ── */
function SoftBubbles() {
  const bubbles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 12 + 4,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      color: ['#c4b5fd', '#93c5fd', '#f9a8d4', '#86efac', '#fcd34d'][Math.floor(Math.random() * 5)],
    })), []);

  return (
    <div className="bubbles-container">
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="soft-bubble"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            background: b.color,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 20, -10, 0],
            opacity: [0.25, 0.5, 0.25],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Section Reveal ── */
function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Scroll Media Component ── */
function ScrollMediaSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerTop = rect.top;
      const containerHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Check if container is in view
      const visible = containerTop < windowHeight * 0.5 && containerTop + containerHeight > windowHeight * 0.5;
      setIsVisible(visible);

      if (visible) {
        // Calculate progress through the container (0 to 1)
        const scrolled = (windowHeight * 0.5 - containerTop) / (containerHeight - windowHeight);
        const clamped = Math.max(0, Math.min(1, scrolled));
        setProgress(clamped);
        const step = Math.min(3, Math.floor(clamped * 4));
        setActiveStep(step);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const steps = [
    {
      emoji: "📚",
      title: "Choose Your Topic",
      desc: "Browse through 500+ topics across science, math, history, tech, and more. Find what sparks your curiosity.",
      color: "#7c3aed",
      bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
      img: "/hero-antigravity.png",
      stats: ["500+ Topics", "12 Categories", "New daily"],
    },
    {
      emoji: "⚡",
      title: "Answer 10 Questions",
      desc: "Fast-paced rounds with instant feedback. Each correct answer boosts your score and builds your streak.",
      color: "#ec4899",
      bg: "linear-gradient(135deg, #fce7f3, #fbcfe8)",
      img: "/hero-whimsical.png",
      stats: ["10 Questions", "30s Timer", "Instant results"],
    },
    {
      emoji: "⚔️",
      title: "Compete Live",
      desc: "Join scheduled quiz battles against real players. Same questions, same timer — may the best mind win.",
      color: "#3b82f6",
      bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
      img: "/hero-antigravity.png",
      stats: ["Real-time", "Global players", "Fair matchups"],
    },
    {
      emoji: "🏆",
      title: "Climb the Leaderboard",
      desc: "Your accuracy and speed determine your rank. Track progress over time and dominate your categories.",
      color: "#f59e0b",
      bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
      img: "/hero-whimsical.png",
      stats: ["Global ranks", "Weekly resets", "Badges & rewards"],
    },
  ];

  const currentStep = steps[activeStep];

  return (
    <div ref={containerRef} className="scroll-media-container">
      {/* Fixed overlay that appears when scrolling through this section */}
      <div className={`scroll-media-fixed ${isVisible ? "visible" : ""}`}>
        {/* Header */}
        <div className="sm-header">
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>
            <span className="eyebrow-bar" />
            How BrainBolt Works
          </div>
          <h2 className="sm-heading">
            Your journey from<br />
            <span style={{ color: currentStep.color, transition: "color 0.4s" }}>curious to champion.</span>
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="sm-progress-bar">
          <div className="sm-progress-fill" style={{ width: `${progress * 100}%` }} />
          <div className="sm-progress-steps">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`sm-progress-dot ${activeStep >= i ? "active" : ""}`}
                style={{ left: `${(i / 3) * 100}%` }}
              >
                <span className="sm-dot-icon">{s.emoji}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="sm-content">
          {/* Left side - text */}
          <div className="sm-text-side">
            <div className="sm-step-number" style={{ color: currentStep.color }}>
              Step {activeStep + 1}
            </div>
            <h3 className="sm-step-title" key={`title-${activeStep}`}>{currentStep.title}</h3>
            <p className="sm-step-desc">{currentStep.desc}</p>
            <div className="sm-step-tags">
              {currentStep.stats.map((stat, j) => (
                <span key={j} className="sm-tag" style={{ borderColor: `${currentStep.color}30`, color: currentStep.color, background: `${currentStep.color}08` }}>
                  {stat}
                </span>
              ))}
            </div>
          </div>

          {/* Right side - media */}
          <div className="sm-media-side">
            <div className="sm-card-inner" style={{ background: currentStep.bg, transition: "background 0.5s" }}>
              <div className="sm-card-emoji">{currentStep.emoji}</div>
              <img src={currentStep.img} alt={currentStep.title} className="sm-card-img" />
              <div className="sm-card-label" style={{ background: currentStep.color, transition: "background 0.4s" }}>
                {currentStep.title}
              </div>
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div className="sm-step-dots">
          {steps.map((_, i) => (
            <div key={i} className={`sm-dot ${activeStep === i ? "active" : ""}`}
              style={activeStep === i ? { background: currentStep.color } : {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE — BRIGHT ANTI-GRAVITY
   ═══════════════════════════════════════════ */
export default function HomeLanding() {
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([]);
  const [now, setNow] = useState(new Date());
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUpcoming = async () => {
      if (!API) return;
      try {
        const token = getToken();
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/api/quiz/upcomingQuizzes`, { headers, signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (data.data) setUpcoming(data.data.slice(0, 3));
      } catch (e) {
        if ((e as Error).name !== "AbortError") console.error(e);
      }
    };
    fetchUpcoming();
    return () => controller.abort();
  }, []);

  const getTimeUntil = useCallback((scheduledAt: string) => {
    const diff = new Date(scheduledAt).getTime() - now.getTime();
    if (diff <= 0) return "Starting soon";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }, [now]);

  const features = [
    { icon: "🎯", title: "Instant Quiz", desc: "Pick a topic, get 10 questions, test yourself instantly. No signup walls.", cta: "Start now", href: "/quiz", color: "#7c3aed" },
    { icon: "⚔️", title: "Live Battles", desc: "Compete in real-time scheduled quizzes against players worldwide.", cta: "View schedule", href: "/quiz", color: "#ec4899" },
    { icon: "🏆", title: "Leaderboard", desc: "Climb the ranks. Top scores sorted by accuracy and speed.", cta: "See rankings", href: "/leaderBoard", color: "#f59e0b" },
    { icon: "📈", title: "Track Progress", desc: "Review your attempts, identify weak spots, and improve over time.", cta: "My profile", href: "/profile", color: "#10b981" },
  ];

  const stats = [
    { value: 100, suffix: "+", label: "Players", icon: "👥" },
    { value: 50, suffix: "+", label: "Quiz Topics", icon: "📚" },
    { value: 500, suffix: "+", label: "Questions Answered", icon: "✅" },
    { value: 99, suffix: "%", label: "Uptime", icon: "⚡" },
  ];

  const marqueeTopics = ["Science", "Mathematics", "History", "Geography", "Technology", "Sports", "Literature", "AI", "Entertainment", "Culture", "Physics", "Chemistry"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,800;9..144,900&display=swap');

        :root {
          --bg: #faf8ff;
          --bg-warm: #fdf4ff;
          --bg-cool: #f0f4ff;
          --bg-mint: #f0fdf4;
          --surface: #ffffff;
          --surface-raised: #ffffff;
          --border: rgba(0,0,0,0.06);
          --border-accent: rgba(124,58,237,0.15);
          --text: #1a1033;
          --text-secondary: #6b7280;
          --text-muted: #9ca3af;
          --purple: #7c3aed;
          --purple-light: #ede9fe;
          --pink: #ec4899;
          --pink-light: #fce7f3;
          --blue: #3b82f6;
          --blue-light: #dbeafe;
          --green: #10b981;
          --green-light: #d1fae5;
          --amber: #f59e0b;
          --amber-light: #fef3c7;
          --radius: 20px;
          --radius-lg: 28px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03);
          --shadow-md: 0 4px 20px rgba(0,0,0,0.06);
          --shadow-lg: 0 12px 40px rgba(0,0,0,0.08);
          --shadow-glow: 0 8px 32px rgba(124,58,237,0.15);
        }

        .landing * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* ── FLOATING OBJECTS ── */
        .floating-objects {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          overflow: hidden;
        }
        .floating-obj {
          position: absolute;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
          opacity: 0.6;
        }

        /* ── BUBBLES ── */
        .bubbles-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        .soft-bubble {
          position: absolute;
          border-radius: 50%;
          filter: blur(1px);
        }

        /* ── BACKGROUND SHAPES ── */
        .bg-shapes {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .bg-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }
        .bg-circle-1 {
          width: 600px; height: 600px;
          background: rgba(124,58,237,0.08);
          top: -150px; right: -100px;
        }
        .bg-circle-2 {
          width: 500px; height: 500px;
          background: rgba(236,72,153,0.06);
          bottom: 20%; left: -150px;
        }
        .bg-circle-3 {
          width: 400px; height: 400px;
          background: rgba(59,130,246,0.06);
          top: 40%; right: 10%;
        }
        .bg-circle-4 {
          width: 350px; height: 350px;
          background: rgba(16,185,129,0.05);
          bottom: 5%; right: 30%;
        }

        /* ── DOT GRID ── */
        .dot-grid {
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, rgba(124,58,237,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          z-index: 1;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 100%);
        }

        /* ════════ HERO ════════ */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 40px 60px;
          z-index: 5;
          overflow: hidden;
        }
        .hero-inner {
          max-width: 1100px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .hero-left { position: relative; z-index: 2; }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--purple-light);
          border: 1px solid rgba(124,58,237,0.2);
          color: var(--purple);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 8px 18px;
          border-radius: 100px;
          margin-bottom: 28px;
        }
        .badge-dot {
          width: 8px; height: 8px;
          background: var(--purple);
          border-radius: 50%;
          animation: gentlePulse 2s infinite;
        }
        @keyframes gentlePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); }
        }

        .hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(44px, 5.5vw, 72px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 20px;
        }
        .hero-gradient {
          background: linear-gradient(135deg, #7c3aed 0%, #ec4899 45%, #3b82f6 75%, #10b981 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 6s ease-in-out infinite;
        }
        @keyframes gradientFlow {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-desc {
          font-size: 17px;
          color: var(--text-secondary);
          line-height: 1.75;
          max-width: 440px;
          margin-bottom: 36px;
          font-weight: 400;
        }

        .hero-btns {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          color: #fff;
          font-family: 'Fraunces', serif;
          font-size: 15px;
          font-weight: 700;
          padding: 15px 32px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          box-shadow: var(--shadow-glow);
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 200%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: btnShimmer 3s infinite;
        }
        @keyframes btnShimmer {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(50%); }
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--surface);
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          padding: 15px 28px;
          border-radius: 16px;
          border: 1.5px solid var(--border);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        /* Hero Image */
        .hero-right {
          position: relative;
          z-index: 2;
        }
        .hero-image-wrapper {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
        }
        .hero-image-wrapper img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: var(--radius-lg);
        }
        .hero-image-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(circle at 50% 50%, rgba(124,58,237,0.12), transparent 70%);
          pointer-events: none;
          z-index: -1;
          border-radius: 50%;
          filter: blur(40px);
        }

        /* Mini floating info cards over hero image */
        .hero-float-card {
          position: absolute;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 14px;
          padding: 12px 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 10;
        }
        .hfc-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .hfc-text { font-size: 12px; font-weight: 700; color: var(--text); }
        .hfc-sub { font-size: 10px; color: var(--text-muted); font-weight: 500; }

        /* ════════ MARQUEE ════════ */
        .marquee-wrap {
          overflow: hidden;
          padding: 24px 0;
          background: linear-gradient(135deg, var(--purple) 0%, #6366f1 50%, #8b5cf6 100%);
          position: relative;
          z-index: 5;
        }
        .marquee-track {
          display: flex;
          animation: marqueeMove 25s linear infinite;
          white-space: nowrap;
        }
        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 0 28px;
          font-family: 'Fraunces', serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }
        .marquee-star {
          width: 6px; height: 6px;
          background: rgba(255,255,255,0.5);
          border-radius: 50%;
          flex-shrink: 0;
        }
        @keyframes marqueeMove {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ════════ STATS ════════ */
        .stats-section {
          position: relative;
          z-index: 5;
          padding: 80px 40px;
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .stats-grid {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .stat-card {
          text-align: center;
          padding: 28px 16px;
          border-radius: var(--radius);
          background: var(--bg);
          border: 1px solid var(--border);
        }
        .stat-icon { font-size: 28px; margin-bottom: 10px; display: block; }
        .stat-num {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 800;
          color: var(--purple);
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 600;
        }

        /* ════════ FEATURES ════════ */
        .features-section {
          position: relative;
          z-index: 5;
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 40px;
        }
        .section-header { margin-bottom: 56px; }
        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--purple);
          margin-bottom: 12px;
        }
        .eyebrow-bar {
          width: 28px; height: 3px;
          background: linear-gradient(90deg, var(--purple), var(--pink));
          border-radius: 10px;
        }
        .section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(32px, 4vw, 50px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .feat-card {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 36px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .feat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 28px 28px 0 0;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feat-card:hover::before { opacity: 1; }
        .feat-card:hover { box-shadow: var(--shadow-lg); border-color: transparent; }

        .feat-num {
          position: absolute;
          top: 16px; right: 22px;
          font-family: 'Fraunces', serif;
          font-size: 56px;
          font-weight: 900;
          color: rgba(0,0,0,0.03);
          line-height: 1;
        }
        .feat-icon-box {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .feat-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }
        .feat-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 24px;
        }
        .feat-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          transition: gap 0.25s;
        }
        .feat-card:hover .feat-cta { gap: 14px; }

        /* ════════ SCROLL MEDIA ════════ */
        .scroll-media-container {
          position: relative;
          z-index: 5;
          height: 400vh;
        }
        .scroll-media-fixed {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 40px 40px 240px;
          max-width: 100%;
          overflow: hidden;
          background: var(--bg);
          z-index: 100;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .scroll-media-fixed.visible {
          opacity: 1;
          pointer-events: all;
        }
        .sm-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .sm-header .section-eyebrow { justify-content: center; }
        .sm-heading {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
          line-height: 1.15;
        }

        /* Progress */
        .sm-progress-bar {
          position: relative;
          height: 4px;
          background: rgba(0,0,0,0.06);
          border-radius: 10px;
          margin: 0 auto 36px;
          max-width: 500px;
          width: 100%;
        }
        .sm-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7c3aed, #ec4899, #3b82f6, #f59e0b);
          border-radius: 10px;
        }
        .sm-progress-steps {
          position: absolute;
          top: -14px;
          left: 0; right: 0;
          height: 32px;
        }
        .sm-progress-dot {
          position: absolute;
          transform: translateX(-50%);
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--surface);
          border: 2px solid rgba(0,0,0,0.08);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.4s;
          box-shadow: var(--shadow-sm);
        }
        .sm-progress-dot.active {
          border-color: currentColor;
          transform: translateX(-50%) scale(1.15);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .sm-dot-icon { font-size: 14px; }

        /* Content */
        .sm-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          flex: 1;
          min-height: 0;
        }
        .sm-text-side {
          position: relative;
          margin-left:10px;
        }
        .sm-step-text {
          padding: 8px 0;
        }
        .sm-step-number {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .sm-step-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 14px;
          line-height: 1.15;
        }
        .sm-step-desc {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.75;
          margin-bottom: 20px;
          max-width: 420px;
        }
        .sm-step-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .sm-tag {
          font-size: 12px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 100px;
          border: 1.5px solid;
          letter-spacing: 0.02em;
        }

        /* Media Card */
        .sm-media-side {
          position: relative;
          perspective: 1000px;
        }
        .sm-media-card {
          width: 100%;
        }
        .sm-card-inner {
          border-radius: var(--radius-lg);
          padding: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .sm-card-emoji {
          font-size: 48px;
          margin-bottom: 16px;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
        }
        .sm-card-img {
          width: 90%;
          max-height: 220px;
          object-fit: cover;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .sm-card-label {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          color: #fff;
          font-family: 'Fraunces', serif;
          font-size: 13px;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: 100px;
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        /* Step dots */
        .sm-step-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }
        .sm-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: rgba(0,0,0,0.1);
          transition: all 0.4s;
        }
        .sm-dot.active {
          width: 28px;
          border-radius: 10px;
        }

        @media (max-width: 860px) {
          .scroll-media-container { height: 350vh; }
          .scroll-media-fixed { padding: 20px; }
          .scroll-media-sticky { padding: 20px; }
          .sm-content { grid-template-columns: 1fr; gap: 24px; }
          .sm-media-side { max-width: 350px; margin: 0 auto; }
          .sm-card-inner { min-height: 250px; }
        }

        /* ════════ UPCOMING ════════ */
        .upcoming-section {
          position: relative;
          z-index: 5;
          padding: 80px 0;
          background: linear-gradient(135deg, #1a1033 0%, #1e1145 50%, #0f172a 100%);
        }
        .upcoming-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 40px;
        }
        .up-eyebrow {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 12px;
          display: flex; align-items: center; gap: 10px;
        }
        .up-bar { width: 28px; height: 3px; background: rgba(167,139,250,0.5); border-radius: 10px; }
        .up-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 3vw, 42px);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 40px;
        }
        .up-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .up-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius);
          padding: 28px;
          cursor: pointer;
          backdrop-filter: blur(12px);
        }
        .up-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(167,139,250,0.3);
        }
        .up-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 14px;
        }
        .badge-live { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
        .badge-soon { background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
        .up-topic {
          font-family: 'Fraunces', serif;
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }
        .up-subj { font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; margin-bottom: 14px; }
        .up-time { font-size: 14px; color: #a5b4fc; font-weight: 600; font-variant-numeric: tabular-nums; }
        .up-reg { font-size: 12px; color: rgba(255,255,255,0.2); margin-top: 6px; }

        /* ════════ CTA ════════ */
        .cta-section {
          position: relative;
          z-index: 5;
          padding: 120px 40px;
          text-align: center;
          overflow: hidden;
          background: linear-gradient(135deg, var(--bg) 0%, var(--bg-warm) 40%, var(--bg-cool) 70%, var(--bg-mint) 100%);
        }
        .cta-bg-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(124,58,237,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .cta-content { position: relative; z-index: 1; }
        .cta-emoji { font-size: 60px; margin-bottom: 24px; display: block; }
        .cta-heading {
          font-family: 'Fraunces', serif;
          font-size: clamp(34px, 5vw, 56px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
          margin-bottom: 16px;
          line-height: 1.1;
        }
        .cta-sub {
          font-size: 17px;
          color: var(--text-secondary);
          margin-bottom: 40px;
          font-weight: 400;
        }
        .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

        /* ════════ RESPONSIVE ════════ */
        @media (max-width: 860px) {
          .hero { padding: 100px 20px 60px; min-height: auto; }
          .hero-inner { grid-template-columns: 1fr; gap: 40px; text-align: center; }
          .hero-desc { margin: 0 auto 36px; }
          .hero-btns { justify-content: center; }
          .hero-right { max-width: 400px; margin: 0 auto; }
          .hero-float-card { display: none; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .features-section, .upcoming-inner { padding: 60px 20px; }
          .features-grid, .up-grid { grid-template-columns: 1fr; }
          .cta-section { padding: 80px 20px; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="landing">

           {/* ═══ MARQUEE ═══ */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {Array(3).fill(null).map((_, i) =>
              marqueeTopics.map((t, j) => (
                <span key={`${i}-${j}`} className="marquee-item">
                  <span className="marquee-star" />
                  {t}
                </span>
              ))
            )}
          </div>
        </div>




        {/* Background elements */}
        <div className="bg-shapes">
          <motion.div className="bg-circle bg-circle-1" animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="bg-circle bg-circle-2" animate={{ x: [0, -40, 25, 0], y: [0, 30, -15, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="bg-circle bg-circle-3" animate={{ x: [0, 20, -30, 0], y: [0, -25, 20, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="bg-circle bg-circle-4" animate={{ x: [0, -15, 35, 0], y: [0, 20, -10, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
        </div>
        <div className="dot-grid" />
        {/* <SoftBubbles />
        <FloatingObjects /> */}

        {/* ═══ HERO ═══ */}
        <motion.section className="hero" style={{ y: heroY }}>
          <div className="hero-inner">
            <div className="hero-left">
              <motion.div
                className="hero-badge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="badge-dot" />
                Live quizzes · Real competition
              </motion.div>

              <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Prove You&apos;re<br />
                <span className="hero-gradient">The Smartest</span><br />
                in the Room.
              </motion.h1>

              <motion.p
                className="hero-desc"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
              >
                Jump into live quiz battles, challenge yourself across dozens of topics,
                and climb the global leaderboard. Your brain deserves a workout.
              </motion.p>

              <motion.div
                className="hero-btns"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <motion.button
                  className="btn-primary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/quiz")}
                >
                  ⚡ Play Now
                </motion.button>
                <motion.button
                  className="btn-outline"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/leaderBoard")}
                >
                  🏆 Leaderboard
                </motion.button>
              </motion.div>
            </div>

            <motion.div
              className="hero-right"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero-image-glow" />
              <div className="hero-image-wrapper">
                <img src="/hero-antigravity.png" alt="Anti-gravity quiz world" />
              </div>

              {/* Floating info cards */}
              <motion.div
                className="hero-float-card"
                style={{ top: -10, left: -30 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="hfc-icon" style={{ background: "var(--purple-light)" }}>🎯</div>
                <div>
                  <div className="hfc-text">10 Questions</div>
                  <div className="hfc-sub">Fast-paced rounds</div>
                </div>
              </motion.div>

              <motion.div
                className="hero-float-card"
                style={{ bottom: 20, right: -20 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="hfc-icon" style={{ background: "var(--pink-light)" }}>⚔️</div>
                <div>
                  <div className="hfc-text">Live Battles</div>
                  <div className="hfc-sub">Real-time matchups</div>
                </div>
              </motion.div>

              <motion.div
                className="hero-float-card"
                style={{ top: '50%', right: -40 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <div className="hfc-icon" style={{ background: "var(--amber-light)" }}>🏅</div>
                <div>
                  <div className="hfc-text">Earn Ranks</div>
                  <div className="hfc-sub">Climb the board</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

     

        {/* ═══ STATS ═══ */}
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <RevealSection key={i} delay={i * 0.1}>
                <motion.div
                  className="stat-card"
                  whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
                >
                  <span className="stat-icon">{s.icon}</span>
                  <div className="stat-num">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="stat-label">{s.label}</div>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section className="features-section">
          <RevealSection>
            <div className="section-header">
              <div className="section-eyebrow">
                <span className="eyebrow-bar" />
                How it works
              </div>
              <div className="section-title">
                Four ways to<br />get smarter.
              </div>
            </div>
          </RevealSection>

          <div className="features-grid">
            {features.map((f, i) => (
              <RevealSection key={i} delay={i * 0.1}>
                <motion.div
                  className="feat-card"
                  onClick={() => router.push(f.href)}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ '--feat-c': f.color } as React.CSSProperties}
                >
                  <div className="feat-num">0{i + 1}</div>
                  <div className="feat-icon-box" style={{ background: `${f.color}15` }}>{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                  <div className="feat-cta" style={{ color: f.color }}>{f.cta} →</div>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: 3, background: `linear-gradient(90deg, ${f.color}, ${f.color}80)`,
                    borderRadius: "28px 28px 0 0",
                    opacity: 0, transition: "opacity 0.3s",
                  }} className="feat-bar" />
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </section>

        {/* ═══ SCROLL MEDIA — HOW IT WORKS ═══ */}
        <ScrollMediaSection />

        {/* ═══ UPCOMING BATTLES ═══ */}
        {upcoming.length > 0 && (
          <section className="upcoming-section">
            <div className="upcoming-inner">
              <RevealSection>
                <div className="up-eyebrow">
                  <span className="up-bar" />
                  Live & Scheduled
                </div>
                <div className="up-title">Upcoming Battles</div>
              </RevealSection>

              <div className="up-grid">
                {upcoming.map((s, i) => (
                  <RevealSection key={s.id} delay={i * 0.1}>
                    <motion.div
                      className="up-card"
                      whileHover={{ y: -4 }}
                      onClick={() => router.push("/quiz")}
                    >
                      <div className={`up-badge ${s.status === "active" ? "badge-live" : "badge-soon"}`}>
                        {s.status === "active" ? "🟢 Live Now" : "⏰ Upcoming"}
                      </div>
                      <div className="up-topic">{s.topic_name}</div>
                      <div className="up-subj">{s.subject_name}</div>
                      {s.status === "upcoming" && (
                        <div className="up-time">⏳ {getTimeUntil(s.scheduled_at)}</div>
                      )}
                      <div className="up-reg">{s.registered_count} registered</div>
                    </motion.div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ CTA ═══ */}
        <section className="cta-section">
          <div className="cta-bg-pattern" />
          <div className="cta-content">
            <RevealSection>
              <motion.span
                className="cta-emoji"
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                🧠
              </motion.span>
            </RevealSection>
            <RevealSection delay={0.1}>
              <h2 className="cta-heading">
                Ready to challenge<br />your limits?
              </h2>
            </RevealSection>
            <RevealSection delay={0.2}>
              <p className="cta-sub">Join thousands competing every day. Your next win is one click away.</p>
            </RevealSection>
            <RevealSection delay={0.3}>
              <div className="cta-btns">
                <motion.button
                  className="btn-primary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/quiz")}
                >
                  ⚡ Start Playing
                </motion.button>
                <motion.button
                  className="btn-outline"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/profile")}
                >
                  👤 View Profile
                </motion.button>
              </div>
            </RevealSection>
          </div>
        </section>

      </div>
    </>
  );
}