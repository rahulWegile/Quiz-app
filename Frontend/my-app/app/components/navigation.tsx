"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL;

export const Navigation = ({ children }: { children: React.ReactNode }) => {
  const pathName = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    profile_url?: string;
  } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const getToken = () => {
    if (typeof document === "undefined") return undefined;
    const cookie = document.cookie
      .split(";")
      .find((r) => r.trim().startsWith("session_token="));
    return cookie?.split("=").slice(1).join("=");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        if (!token) return setUserLoading(false);
        const res = await fetch(`${API}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUser(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, [pathName]);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0]?.toUpperCase();
    return (
      (parts[0][0] || "").toUpperCase() +
      (parts[parts.length - 1][0] || "").toUpperCase()
    );
  };

  const handleLogout = () => {
    document.cookie =
      "session_token=; expires=Thu, 01 Jan 1970 UTC; path=/;";
    setUser(null);
    setMenuOpen(false);
    window.location.href = "/Auth/signIn";
  };

  const hideSidebar =
    pathName.startsWith("/quiz/play") || pathName.startsWith("/Auth");
  if (hideSidebar) return <>{children}</>;

  const navLinks = [
    { href: "/quiz", label: "Quizzes", icon: "📚" },
    { href: "/leaderBoard", label: "Leaderboard", icon: "🏆" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .mobile-topbar {
          display: none;
        }

        .hamburger {
          width: 36px; height: 36px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .hamburger:hover { background: #e5e7eb; }

        .nav-sidebar {
          width: 240px;
          height: 100vh;
          position: fixed;
          left: 0; top: 0;
          background: #ffffff;
          border-right: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 16px;
          z-index: 50;
          box-shadow: 2px 0 12px rgba(0,0,0,0.04);
          transition: transform 0.28s cubic-bezier(.4,0,.2,1);
        }

        .nav-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(2px);
          z-index: 49;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .nav-logo-icon {
          width: 34px; height: 34px;
          background: #111;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }

        .nav-logo-text {
          font-size: 16px;
          font-weight: 700;
          color: #111;
        }

        .nav-divider {
          height: 1px;
          background: #f3f3f3;
          margin: 12px 4px;
        }

        .nav-section-label {
          font-size: 10px;
          font-weight: 600;
          color: #bbb;
          padding: 0 12px;
          margin-bottom: 6px;
        }

        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 9px;
          text-decoration: none;
          font-size: 13.5px;
          color: #666;
          transition: background 0.15s, color 0.15s;
        }
        .nav-link:hover { background: #f9fafb; color: #111; }

        .nav-link.active {
          background: #f3f4f6;
          color: #111;
          font-weight: 600;
        }

        .nav-bottom {
          border-top: 1px solid #f3f3f3;
          padding-top: 16px;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .nav-user-text { min-width: 0; flex: 1; }
        .nav-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nav-user-email {
          font-size: 11px;
          color: #999;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #6366f1;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          overflow: hidden;
          flex-shrink: 0;
        }

        .nav-logout {
          width: 100%;
          padding: 9px;
          border-radius: 8px;
          cursor: pointer;
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #fecdd3;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          transition: background 0.15s;
        }
        .nav-logout:hover { background: #ffe4e6; }

        .nav-signin {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          background: #111;
          color: #fff;
          border: none;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          transition: background 0.15s;
        }
        .nav-signin:hover { background: #333; }

        .nav-content {
          margin-left: 240px;
          width: calc(100% - 240px);
          min-height: 100vh;
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .mobile-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 16px;
            background: #fff;
            border-bottom: 1px solid #eee;
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 100;
            height: 54px;
          }

          .mobile-topbar-title {
            font-size: 15px;
            font-weight: 700;
            color: #111;
          }

          .nav-sidebar {
            transform: translateX(-100%);
            width: 260px;
            padding-top: 16px;
            z-index: 200;
          }

          .nav-sidebar.open {
            transform: translateX(0);
            box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          }

          .nav-overlay {
            display: block;
            pointer-events: ${menuOpen ? "auto" : "none"};
            opacity: ${menuOpen ? 1 : 0};
            transition: opacity 0.28s ease;
          }

          .nav-content {
            margin-left: 0;
            width: 100%;
            padding-top: 54px;
          }
        }
      `}</style>

      {/* TOP BAR (MOBILE ONLY) */}
      {/* TOP BAR (MOBILE ONLY) */}
<div className="mobile-topbar">
  <button
    className="hamburger"
    onClick={() => setMenuOpen(!menuOpen)}
    aria-label="Toggle menu"
  >
    {menuOpen ? "✕" : "☰"}
  </button>
  <span className="mobile-topbar-title">BrainBolt</span>
  <div style={{ width: 36 }} />
</div>

      {/* OVERLAY — closes sidebar on backdrop tap */}
      {menuOpen && (
        <div
          className="nav-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div style={{ display: "flex" }}>
        <nav className={`nav-sidebar ${menuOpen ? "open" : ""}`}>

          <div>
            <Link href="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
              <div className="nav-logo-icon">⚡</div>
              <span className="nav-logo-text">BrainBolt</span>
            </Link>

            <div className="nav-divider" />

            <div className="nav-links">
              {navLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`nav-link${pathName === href ? " active" : ""}`}
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="nav-bottom">
            {!userLoading && (
              user ? (
                <>
                  <div className="nav-user">
                    <div className="nav-avatar">
                      {user.profile_url ? (
                        <Image
                          src={user.profile_url}
                          alt=""
                          width={34}
                          height={34}
                        />
                      ) : (
                        getInitials(user.name)
                      )}
                    </div>
                    <div className="nav-user-text">
                      <div className="nav-user-name">{user.name}</div>
                      <div className="nav-user-email">{user.email}</div>
                    </div>
                  </div>
                  <button className="nav-logout" onClick={handleLogout}>
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/Auth/signIn" onClick={() => setMenuOpen(false)}>
                  <button className="nav-signin">Sign In</button>
                </Link>
              )
            )}
          </div>
        </nav>

        <div className="nav-content">{children}</div>
      </div>
    </>
  );
};