import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const Auth = () => {
  const { loginWithGoogle, isFirebaseEnabled } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const toastId = toast.loading("Logging you in...");
    try {
      await loginWithGoogle();
      toast.success("Welcome back!", { id: toastId });
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to authenticate. Please check your credentials.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-slate-50">
      {/* Left Column: Premium Marketing Pane */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-email-brand p-12 text-white lg:flex">
        {/* Decorative background gradients */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-indigo-700 to-violet-800 opacity-95" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-email-brand shadow-md">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight font-heading">EmailAI</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight font-heading">
            Write professional, high-impact emails in seconds.
          </h2>
          <p className="mt-4 text-sm text-indigo-100 leading-relaxed">
            Harness the power of enterprise-grade LLMs tailored for sales outreach, follow-ups, and business proposals. Double your reply rate today.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-indigo-200">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Secured with enterprise SSL encryption & Firebase Auth</span>
        </div>
      </div>

      {/* Right Column: Active Log-in Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 bg-white">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo on Mobile */}
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-email-brand text-white">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-lg font-bold text-slate-800 font-heading">EmailAI</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 font-heading">
            Welcome to EmailAI
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to start creating enterprise-quality emails.
          </p>

          <div className="mt-8 space-y-4">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Sandbox Notice if Firebase config is missing */}
            {!isFirebaseEnabled && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                <div className="flex gap-2">
                  <span className="text-amber-600 text-xs font-bold font-heading">Development Sandbox Mode</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-amber-600">
                  Firebase API keys are omitted. Clicking "Continue with Google" will authenticate you automatically using local developer simulation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
