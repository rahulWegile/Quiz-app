"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL;

export const Navigation = ({ children }: { children: React.ReactNode }) => {
  const pathName = usePathname();
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
    return (parts[0][0] || "").toUpperCase() + (parts[parts.length - 1][0] || "").toUpperCase();
  };

  const handleLogout = () => {
    document.cookie = "session_token=; expires=Thu, 01 Jan 1970 UTC; path=/;";
    window.location.href = "/Auth/signIn";
  };

  const hideSidebar = pathName.startsWith("/quiz/play") || pathName.startsWith("/Auth");
  if (hideSidebar) return <>{children}</>;

  const navLinks = [
    { href: "/quiz", label: "Quizzes", icon: "📚" },
    { href: "/leaderBoard", label: "Leaderboard", icon: "🏆" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <>
      <style>{`
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
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 10px;
          margin-bottom: 8px;
          transition: background 0.2s;
        }
        .nav-logo:hover { background: #f9f9f9; }

        .nav-logo-icon {
          width: 34px; height: 34px;
          background: #111;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .nav-logo-text {
          font-size: 16px;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.3px;
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
          letter-spacing: 0.1em;
          text-transform: uppercase;
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
          font-weight: 500;
          color: #666;
          transition: all 0.15s;
          position: relative;
        }

        .nav-link:hover {
          background: #f5f5f5;
          color: #111;
        }

        .nav-link.active {
          background: #f3f4f6;
          color: #111;
          font-weight: 600;
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 18px;
          background: #6366f1;
          border-radius: 0 3px 3px 0;
        }

        .nav-link-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .nav-bottom { border-top: 1px solid #f3f3f3; padding-top: 16px; }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          margin-bottom: 8px;
        }

        .nav-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
          overflow: hidden;
        }

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
          color: #aaa;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-logout {
          width: 100%;
          padding: 9px;
          background: transparent;
          border: 1px solid #fee2e2;
          border-radius: 8px;
          cursor: pointer;
          color: #ef4444;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .nav-logout:hover { background: #fee2e2; }

        .nav-signin {
          width: 100%;
          padding: 11px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.01em;
        }
        .nav-signin:hover { background: #333; }

        .nav-skeleton {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
        }
        .sk-circle {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          flex-shrink: 0;
        }
        .sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .sk-line {
          height: 10px; border-radius: 5px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .sk-line.short { width: 60%; }
        @keyframes shimmer { to { background-position: -200% 0; } }

        .nav-content {
          margin-left: 240px;
          width: calc(100% - 240px);
          min-height: 100vh;
        }
      `}</style>

      <div style={{ display: "flex" }}>
        <nav className="nav-sidebar">

          {/* Logo */}
          <div>
            <Link href="/" className="nav-logo">
              <div className="nav-logo-icon">⚡</div>
              <span className="nav-logo-text">BrainBolt</span>
            </Link>

            <div className="nav-divider" />

            <div className="nav-section-label">Menu</div>

            <div className="nav-links">
              {navLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link${pathName === href ? " active" : ""}`}
                >
                  <span className="nav-link-icon">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="nav-bottom">
            {userLoading ? (
              <div className="nav-skeleton">
                <div className="sk-circle" />
                <div className="sk-lines">
                  <div className="sk-line" />
                  <div className="sk-line short" />
                </div>
              </div>
            ) : user ? (
              <>
                <div className="nav-user">
                  <div className="nav-avatar">
                    {user.profile_url ? (
                      <Image
                        src={user.profile_url}
                        alt={user.name ?? "Profile"}
                        width={34}
                        height={34}
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div className="nav-user-name">{user.name}</div>
                    <div className="nav-user-email">{user.email}</div>
                  </div>
                </div>
                <button className="nav-logout" onClick={handleLogout}>
                  <span>↩</span> Sign out
                </button>
              </>
            ) : (
              <Link href="/Auth/signIn" style={{ display: "block" }}>
                <button className="nav-signin">Sign In →</button>
              </Link>
            )}
          </div>
        </nav>

        {/* Page content */}
        <div className="nav-content">
          {children}
        </div>
      </div>
    </>
  );
};