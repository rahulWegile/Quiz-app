import { redirect } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Page() {
  async function forgetPass(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;

    if (!email) redirect("/Auth/Invalid-User");

    const res = await fetch(`${API}/api/forgot-pass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      redirect("/Auth/Invalid-User");
    }

    const userName = data.data.name;
    redirect(`/Auth/reset-pass?email=${email}&name=${encodeURIComponent(userName)}`);
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

        /* background blobs */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
        }
        .b1 { width: 450px; height: 450px; background: rgba(124,58,237,0.1); top: -100px; right: -80px; }
        .b2 { width: 350px; height: 350px; background: rgba(236,72,153,0.08); bottom: 0; left: -100px; }

        .card {
          position: relative;
          z-index: 1;
          width: 420px;
          background: white;
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
        }

        .eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7c3aed;
          margin-bottom: 10px;
        }

        .title {
          font-family: 'Fraunces', serif;
          font-size: 30px;
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
          display: block;
        }

        .input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1.5px solid rgba(0,0,0,0.08);
          background: #faf8ff;
          font-size: 15px;
          color: #111827;
          outline: none;
          margin-bottom: 22px;
          transition: 0.2s;
        }

        .input:focus {
          border-color: #7c3aed;
          background: white;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
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
          box-shadow: 0 14px 40px rgba(124,58,237,0.3);
        }

        .back {
          display: block;
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #7c3aed;
          text-decoration: none;
          font-weight: 600;
        }

        .back:hover {
          text-decoration: underline;
        }

      `}</style>

      {/* background */}
      <div className="blob b1" />
      <div className="blob b2" />

      <div className="root">
        <div className="card">
          <div className="eyebrow">Recovery</div>

          <h1 className="title">Forgot Password?</h1>

          <p className="sub">
            Enter your email and we’ll send you a reset code.
          </p>

          <form action={forgetPass}>
            <label className="label">Email Address</label>

            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="input"
            />

            <button type="submit" className="btn">
              ⚡ Send Reset Code
            </button>
          </form>

          <a href="/Auth/signIn" className="back">
            ← Back to Login
          </a>
        </div>
      </div>
    </>
  );
}