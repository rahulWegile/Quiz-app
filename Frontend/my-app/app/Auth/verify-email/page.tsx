import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL

export default function Page() {
  async function insert(formData: FormData) {
    "use server";

    

   const cookieStore = cookies();
    const token = cookieStore.get("session_token")?.value;

    const otp = formData.get("otp");


  

    const res = await fetch(`${API}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
       },
       body: JSON.stringify({ otp }), 
     
    });
const data = await res.json();

if (!data.success) { 
  redirect("/Auth/Invalid-otp");
}



redirect("/");}
 

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        backgroundColor: "#f5f5f5",
        padding: "20px",
        borderRadius: "8px"
      }}
    >
      <form
        action={insert}   
        style={{
          backgroundColor: "white",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "6px"
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "20px", color:"black" }}>
          verify Email
        </h3>
        <h6 style={{ textAlign: "center", marginBottom: "20px", color:"black" }}>
          Please Enter the otp sent to your Email Address
        </h6>
        <label >Otp</label>
        <input
          name="otp"
          type="number"
          placeholder="Enter your code"
          
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "16px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            color: "black"
          }}
        />
       

        <button
          type="submit"
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            width: "100%",
            padding: "10px",
            border: "none",
            borderRadius: "4px"
          }}
        >
          Login
        </button>
       

      </form>
    </div>
  );
}
   