import Link from "next/link";

export default function Page() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Fraunces:wght@700;800&display=swap');

        body {
          margin: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #faf8ff;
        }

        .root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        /* background blobs */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
        }
        .b1 { width: 450px; height: 450px; background: rgba(124,58,237,0.1); top: -100px; right: -80px; }
        .b2 { width: 350px; height: 350px; background: rgba(16,185,129,0.08); bottom: 0; left: -100px; }

        .card {
          position: relative;
          z-index: 1;
          width: 420px;
          background: white;
          border-radius: 24px;
          padding: 48px 40px;
          text-align: center;
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
        }

        .icon-wrap {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(34,197,94,0.08);
          border: 2px solid rgba(34,197,94,0.3);
          box-shadow: 0 0 0 6px rgba(34,197,94,0.05);
        }

        .title {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          font-weight: 800;
          color: #1a1033;
          margin-bottom: 10px;
        }

        .sub {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 30px;
        }

        .btn {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 16px;
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          color: white;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(124,58,237,0.25);
          transition: 0.2s;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(124,58,237,0.3);
        }

      `}</style>

      {/* background */}
      <div className="blob b1" />
      <div className="blob b2" />

      <div className="root">
        <div className="card">
          
          {/* success icon */}
          <div className="icon-wrap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="title">Password Changed!</h2>

          <p className="sub">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>

          <Link href="/Auth/signIn" className="btn">
            ⚡ Back to Login
          </Link>
        </div>
      </div>
    </>
  );
}