import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Mail,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleReset = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      toast.success(
        "Password Reset API will be connected in next step."
      );
    }, 1500);
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

            🔑

          </div>

          <h1 className="text-4xl font-bold text-gray-800 mt-6">

            Forgot Password

          </h1>

          <p className="text-gray-500 mt-3">

            Enter your registered email to receive a password reset link.

          </p>

        </div>

        <div className="space-y-6">

          <div>

            <label className="block mb-2 font-semibold text-gray-700">

              Email Address

            </label>

            <div className="relative">

              <Mail className="absolute left-4 top-3 text-gray-400 w-5 h-5" />

              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 rounded-xl"
              />

            </div>

          </div>

          <Button
            onClick={handleReset}
            disabled={loading}
            className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
          >

            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </div>
            ) : (
              "📩 Send Reset Link"
            )}

          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="w-full h-12 rounded-xl"
          >

            <ArrowLeft className="w-4 h-4 mr-2" />

            Back to Login

          </Button>

        </div>

              </div>

    </motion.div>

  </div>

</div>

  );
}

export default ForgotPassword;