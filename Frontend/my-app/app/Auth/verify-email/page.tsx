import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Page() {
  async function insert(formData: FormData) {
    "use server";

    const cookieStore = cookies();
    const token = cookieStore.get("session_token")?.value;

    const otp = formData.get("otp");

    const res = await fetch(`${API}/api/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ otp }),
    });

    const data = await res.json();

    if (!data.success) {
      redirect("/Auth/Invalid-otp");
    }

    redirect("/");
  }

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

        /* background */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
        }
        .b1 { width: 400px; height: 400px; background: rgba(124,58,237,0.1); top: -80px; right: -80px; }
        .b2 { width: 300px; height: 300px; background: rgba(236,72,153,0.08); bottom: 0; left: -80px; }

        .card {
          position: relative;
          z-index: 1;
          width: 420px;
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .title {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          color: #1a1033;
        }

        .sub {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 28px;
        }

        .label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 8px;
          color: #6b7280;
        }

        .otp-input {
          width: 100%;
          padding: 16px;
          font-size: 28px;
          text-align: center;
          letter-spacing: 0.3em;
          border-radius: 14px;
          border: 1.5px solid rgba(0,0,0,0.08);
          background: #faf8ff;
          outline: none;
          margin-bottom: 24px;
          font-family: 'Fraunces', serif;
        }

        .otp-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
          background: white;
        }

        .btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          color: white;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(124,58,237,0.25);
          transition: 0.2s;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

      `}</style>

      {/* background */}
      <div className="blob b1" />
      <div className="blob b2" />

      <div className="root">
        <form className="card" action={insert}>
          <h1 className="title">Verify your email</h1>
          <p className="sub">
            Enter the 6-digit code sent to your email address.
          </p>

          <label className="label">Verification Code</label>

          <input
            name="otp"
            type="text"
            maxLength={6}
            placeholder="000000"
            className="otp-input"
          />

          <button type="submit" className="btn">
            ⚡ Verify
          </button>
        </form>
      </div>
    </>
  );
}