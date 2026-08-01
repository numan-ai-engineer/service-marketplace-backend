import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

function ResetPassword() {
const navigate = useNavigate();

const { uid, token } = useParams();

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const [loading, setLoading] = useState(false);

const handleResetPassword = async () => {
  if (!password || !confirmPassword) {
    toast.error("Please fill all fields");
    return;
  }

  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  if (password.length < 8) {
  toast.error("Password must be at least 8 characters");
  return;
}

  setLoading(true);

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/reset-password/${uid}/${token}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } else {
      toast.error(data.error);
    }

  } catch (error) {
    console.error(error);
    toast.error("Server Error");
  } finally {
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

    <div className="w-full flex items-center justify-center p-8">

      <motion.div
        variants={pageAnimation}
        initial="hidden"
        animate="show"
        className="w-full max-w-lg"
      >

        <div className="bg-white/80 backdrop-blur-3xl rounded-[36px] border border-white/50 shadow-[0_30px_80px_rgba(0,0,0,0.25)] p-10">

          <div className="text-center mb-8">

            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto text-5xl shadow-xl">
              🔒
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mt-6">
              Reset Password
            </h1>

            <p className="text-gray-500 mt-3">
              Enter your new password below.
            </p>

          </div>

          <div className="space-y-6">

            <div>

              <label className="block mb-2 font-semibold text-gray-700">
                New Password
              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-3 text-gray-400 w-5 h-5" />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 rounded-xl"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>

              </div>

            </div>

            <div>

              <label className="block mb-2 font-semibold text-gray-700">
                Confirm Password
              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-3 text-gray-400 w-5 h-5" />

                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 rounded-xl"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>

              </div>

            </div>

            <Button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Password...
                </div>
              ) : (
                "🔑 Reset Password"
              )}
            </Button>

          </div>

        </div>

      </motion.div>


    </div>

  </div>
);

}
export default ResetPassword;