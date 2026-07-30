import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    console.log("Login Button Clicked");

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/token/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );
      console.log("Fetch Completed");
console.log(response.status);
      console.log(response.status);
console.log(response);

      const data = await response.json();
      console.log(data);

      if (data.access) {
        // Save Token
       localStorage.setItem("access", data.access);
       localStorage.setItem("refresh", data.refresh);

        // Get Current User
        const userResponse = await fetch(
          "http://127.0.0.1:8000/api/me/",
          {
            headers: {
              Authorization: "Bearer " + data.access,
            },
          }
        );

        const userData = await userResponse.json();

        // Save User in Local Storage
localStorage.setItem("user", JSON.stringify(userData));

        // Save User in Context
        setUser(userData);

        // Redirect

      toast.success("Login Successful 🎉");

// Redirect according to role

if (userData.role === "admin") {

  navigate("/admin-dashboard");

} else if (userData.role === "worker") {

  navigate("/worker-dashboard");

} else {

  navigate("/customer-dashboard");

}
      } else {
        toast.error("Invalid Username or Password");
      }
    } catch (error) {
  console.error("LOGIN ERROR:", error);
  toast.error("Server Error");
}
finally {
  setLoading(false);
}
  };


const pageAnimation = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

  return (

<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-900 flex">

  <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>

<div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

<div className="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

<div className="hidden lg:flex w-1/2 items-center justify-center p-16">

<div className="text-white max-w-lg">

<div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-6xl shadow-2xl mb-8">

🛠️

</div>

<h1 className="text-6xl font-extrabold leading-tight">

Service Marketplace

</h1>

<p className="mt-8 text-xl text-blue-100 leading-9">

Pakistan's next-generation service platform.

Book trusted professionals, manage bookings,
track workers and grow your business with a
modern digital experience.

</p>

<div className="mt-12 space-y-5">

<div className="flex items-center gap-4 text-lg">

✅ Verified Workers

</div>

<div className="flex items-center gap-4 text-lg">

⚡ Instant Booking

</div>

<div className="flex items-center gap-4 text-lg">

🔒 Secure Payments

</div>

<div className="flex items-center gap-4 text-lg">

⭐ Customer Reviews

</div>

</div>

</div>

</div>

<div className="w-full lg:w-1/2 flex items-center justify-center p-8">
    <motion.div
      variants={pageAnimation}
      initial="hidden"
      animate="show"
      className="w-full max-w-lg"
    >

      <div
  className="
  bg-white/80
  backdrop-blur-3xl
  rounded-[36px]
  border
  border-white/50
  shadow-[0_30px_80px_rgba(0,0,0,0.25)]
  p-10
  relative
  overflow-hidden
  transition-all
  duration-500
  hover:scale-[1.02]
  hover:shadow-[0_40px_100px_rgba(37,99,235,0.35)]
"
>

  <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-400/20 rounded-full blur-3xl"></div>

<div className="absolute -bottom-24 -left-24 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="text-center mb-8">

          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto text-5xl shadow-xl">

            👤

          </div>

          <h1 className="text-4xl font-bold text-gray-800 mt-6">

            Welcome Back 👋

          </h1>

          <p className="text-gray-500 mt-3">

            Sign in to access your dashboard and manage your services.

          </p>

        </div>

        <div className="space-y-6">

  {/* Username */}

  <div>

    <label className="block mb-2 font-semibold text-gray-700">
      Username
    </label>

    <div className="relative">

      <User className="absolute left-4 top-3 text-gray-400 w-5 h-5" />

      <Input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleLogin();
        }}
        className="pl-12 h-12 rounded-xl"
      />

    </div>

  </div>

  {/* Password */}

  <div>

    <label className="block mb-2 font-semibold text-gray-700">
      Password
    </label>

    <div className="relative">

      <Lock className="absolute left-4 top-3 text-gray-400 w-5 h-5" />

      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleLogin();
        }}
        className="pl-12 pr-12 h-12 rounded-xl"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-3 text-gray-400 hover:text-blue-600"
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>

    </div>

  </div>

  {/* Remember */}

  <div className="flex justify-between items-center">

    <label className="flex items-center gap-2 text-sm text-gray-600">

      <input
        type="checkbox"
        className="accent-blue-600"
      />

      Remember Me

    </label>

    <button
  type="button"
  onClick={() => navigate("/forgot-password")}
  className="text-blue-600 hover:text-indigo-700 text-sm font-semibold"
>
  Forgot Password?
</button>

  </div>

  {/* Login */}

  <Button
    onClick={handleLogin}
    disabled={loading}
    className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
  >
    {loading ? (
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Signing In...
      </div>
    ) : (
      "🚀 Login"
    )}
  </Button>

  {/* Divider */}

  <div className="flex items-center gap-4">

    <div className="flex-1 h-px bg-gray-300"></div>

    <span className="text-gray-400 text-sm">
      OR
    </span>

    <div className="flex-1 h-px bg-gray-300"></div>

  </div>

  {/* Google */}

  <Button
  variant="outline"
  className="w-full h-12 rounded-xl"
  onClick={() => alert("Google Button Working")}
>
  🌍 Continue with Google
</Button>

  {/* Facebook */}

  <Button
  variant="outline"
  className="w-full h-12 rounded-xl"
  onClick={() => alert("Facebook Button Working")}
>
  📘 Continue with Facebook
</Button>

</div>

<div className="mt-8 text-center">

  <p className="text-gray-500">
    Don't have an account?
  </p>

  <button
  onClick={() => navigate("/register")}
  className="mt-2 text-blue-600 font-bold"
>
  Create New Account
</button>

</div>

<p className="text-center text-gray-400 text-sm mt-8">
  Powered by
  <span className="font-bold text-blue-600">
    {" "}Service Marketplace
  </span>
</p>

</div>

</motion.div>

</div>

</div>

);

}

export default Login;