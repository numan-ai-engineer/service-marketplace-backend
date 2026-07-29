import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState("customer");

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

  const handleRegister = async () => {

    if (!fullName || !username || !email || !phone || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

try {
  const response = await fetch(
    "http://127.0.0.1:8000/api/register/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  first_name: fullName,
  username,
  email,
  password,
  phone,
  role,
})
    }
  );

  const data = await response.json();

  if (response.ok) {
    toast.success("Account Created Successfully 🎉");

    navigate("/login");
  } else {
    toast.error(data.error || "Registration Failed");
  }
} catch (error) {
  console.error(error);
  toast.error("Server Error");
} finally {
  setLoading(false);
}

    // Backend Registration
    
  };

  return (

    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-900 flex">

  <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl"></div>

  {/* LEFT PANEL */}

  <div className="hidden lg:flex w-1/2 items-center justify-center p-16">

    <div className="max-w-lg text-white">

      <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-6xl mb-8">

        🚀

      </div>

      <h1 className="text-6xl font-extrabold">

        Join Service Marketplace

      </h1>

      <p className="mt-8 text-xl leading-9 text-blue-100">

        Create your account and connect with thousands of customers and skilled workers.

      </p>

      <div className="mt-12 space-y-5">

        <div>✅ Trusted Workers</div>

        <div>⚡ Fast Booking</div>

        <div>💰 Earn More</div>

        <div>🌍 Pakistan & Gulf Countries</div>

      </div>

    </div>

  </div>

  {/* RIGHT PANEL */}

  <div className="w-full lg:w-1/2 flex items-center justify-center p-8">

    <motion.div

      variants={pageAnimation}

      initial="hidden"

      animate="show"

      className="w-full max-w-xl"

    >
        
        <div className="bg-white/90 backdrop-blur-2xl rounded-[36px] shadow-2xl p-10">

        <div className="text-center mb-8">

          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-5xl mx-auto">

            👤

          </div>

          <h2 className="text-4xl font-bold mt-6">

            Create Account

          </h2>

          <p className="text-gray-500 mt-2">

            Start your professional journey today

          </p>

        </div>

        <div className="space-y-5">

          <Input
            placeholder="Full Name"
            value={fullName}
            onChange={(e)=>setFullName(e.target.value)}
          />

          <Input
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
          />

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
          />

          <div className="relative">

            <Input
              type={showPassword ? "text":"password"}
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="pr-12"
            />

            <button
              type="button"
              onClick={()=>setShowPassword(!showPassword)}
              className="absolute right-4 top-3"
            >

              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}

            </button>

          </div>

          <div className="relative">

            <Input
              type={showConfirmPassword ? "text":"password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              className="pr-12"
            />

            <button
              type="button"
              onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-3"
            >

              {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}

            </button>

          </div>

          <div>

            <p className="font-semibold mb-3">

              Select Account Type

            </p>

            <div className="grid grid-cols-2 gap-4">

              <Button
                type="button"
                variant={role==="customer" ? "default":"outline"}
                onClick={()=>setRole("customer")}
              >

                Customer

              </Button>

              <Button
                type="button"
                variant={role==="worker" ? "default":"outline"}
                onClick={()=>setRole("worker")}
              >

                Worker

              </Button>

            </div>

          </div>

          <Button

            onClick={handleRegister}

            disabled={loading}

            className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-105 transition-all duration-300"

          >

            {loading ? (

              <>

                <Loader2 className="w-5 h-5 mr-2 animate-spin"/>

                Creating Account...

              </>

            ) : (

              "Create Account"

            )}

          </Button>

          </div>

          <div className="mt-8 text-center">

  <p className="text-gray-500">

    Already have an account?

  </p>

  <button
    onClick={() => navigate("/login")}
    className="mt-2 text-blue-600 font-bold hover:text-indigo-700 transition"
  >

    Login Here

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

export default Register;