import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

function LoginPage() {
  const [currentState, setCurrentState] = useState("Sign up"); // "Login" | "Sign Up" | "Forgot Password"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const {login} = useContext(AuthContext)

  const handleSubmit = (event) => {
  event.preventDefault();

  // Step 1: First click → show Full Name field
  if (currentState === "Sign up" && !isDataSubmitted) {
    setIsDataSubmitted(true);
    return;
  }

  // Step 2: Validation before sending data
  if (currentState === "Sign up" && !fullName) {
    alert("Please enter your full name");
    return;
  }
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  // Step 3: Send data
  console.log("📦 Sending credentials:", { fullName, email, password });
  login(currentState === "Sign up" ? "signup" : "login", {
    fullName,
    email,
    password,
  });
};


  return (
    <div className="min-h-screen flex items-center justify-center sm:justify-evenly max-sm:flex-col gap-10 px-6 bg-gradient-to-br from-[#090913] via-[#161636] to-[#0f0f22] text-white transition-all">
      {/* --- Left Section (Logo) --- */}
      <div className="flex flex-col items-center gap-3 text-center">
        <img
          src={assets.logo_big}
          alt="App Logo"
          className="w-[min(30vw,220px)] drop-shadow-[0_0_25px_rgba(167,139,250,0.5)]"
        />
        <h1 className="text-2xl font-semibold text-emerald-300 tracking-wide"></h1>
      </div>

      {/* --- Right Section (Form) --- */}
      <form
        onSubmit={handleSubmit}
        className="border border-gray-700 bg-[#111122]/80 p-8 flex flex-col gap-5 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.5)] w-[90%] max-w-sm backdrop-blur-2xl transition-all"
      >
        {/* --- Header --- */}
        <h2 className="font-semibold text-2xl flex justify-between items-center">
          {currentState}
          {isDataSubmitted && <img
            onClick={()=>setIsDataSubmitted(false)}
            src={assets.arrow_icon}
            alt="arrow"
            className="w-5 cursor-pointer rotate-90 opacity-70 hover:opacity-100 transition"
            title="Switch Form"
          />}
          
        </h2>

        {/* --- Input Fields --- */}
        {currentState === "Sign up" && isDataSubmitted &&(
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            placeholder="Full Name"
            required
            className="bg-[#1c1c3b] border border-gray-700 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="Email"
          required
          className="bg-[#1c1c3b] border border-gray-700 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
         />

          <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="password"
          required
          className="bg-[#1c1c3b] border border-gray-700 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
         />
          </>
        )}
        
        <button type="submit" className="py-3 bg-gradient-to-r from-gray-500 to-black text-white rounded-md cursor-pointer">
          {currentState === "Sign up" ? "Create Account" :"Login Now"}
        </button>

        <div className="flex flex-col gap-2">
          {currentState ==="Sign up" ?(
            <p className="text-sm text-gray-600">Already have an account?<span onClick={()=>{setCurrentState("Login"); setIsDataSubmitted(false)}} className="font-medium text-emerald-500 cursor-pointer">Login Here</span></p>
          ):(
            <p className="text-sm text-gray-600">Create an account <span onClick={()=>{setCurrentState("Sign up")}} className="font-medium text-emerald-500 cursor-pointer">Click Here</span></p>
          )}
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
