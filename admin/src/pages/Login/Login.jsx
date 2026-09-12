import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

import { api } from "../../api/axios";
import { setCredentials } from "../../features/auth/authSlice";
import { selectIsAuth } from "../../features/auth/authSelectors";

/** অ্যাডমিন লগইন — ক্লায়েন্ট সাইটের ডার্ক + গোল্ড চেহারায় */
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuth = useSelector(selectIsAuth);
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuth) {
      navigate(from, { replace: true });
    }
  }, [isAuth, navigate, from]);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setSubmitting(true);

      const { data } = await api.post("/api/admin/login", {
        email: form.email.trim(),
        password: form.password,
      });

      const token = data?.data?.token;
      const admin = data?.data?.admin;

      if (!token || !admin?.email) {
        toast.error("Login response invalid");
        return;
      }

      dispatch(setCredentials({ admin, token }));
      toast.success("Login successful");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--neutral1000)] px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(46% 55% at 12% 18%, rgba(249,185,1,0.14), transparent 70%), radial-gradient(42% 50% at 88% 82%, rgba(227,134,20,0.10), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-7 text-center">
          <img
            src="/assets/brand/header-logo.png"
            alt="BET CHOKKOR"
            className="mx-auto h-10 w-auto object-contain"
            draggable="false"
          />

          <h1 className="mt-5 text-[26px] font-extrabold text-[var(--neutral100)]">
            Admin Panel
          </h1>

          <p className="mt-2 text-[14px] text-[var(--text-muted)]">
            Sign in to manage BET CHOKKOR
          </p>
        </div>

        <div className="ad-card !p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="ad-label" htmlFor="admin-email">
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-[12px] bg-[var(--neutral800)] px-4 focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary500),transparent_60%)]">
                <Mail size={17} className="shrink-0 text-[var(--primary500)]" />

                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="admin@betchokkor.com"
                  className="h-[46px] w-full bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
                />
              </div>
            </div>

            <div>
              <label className="ad-label" htmlFor="admin-password">
                Password
              </label>

              <div className="flex items-center gap-3 rounded-[12px] bg-[var(--neutral800)] px-4 focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary500),transparent_60%)]">
                <Lock size={17} className="shrink-0 text-[var(--primary500)]" />

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Enter password"
                  className="h-[46px] w-full bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="shrink-0 cursor-pointer text-[var(--text-disabled)] transition-colors hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="ad-btn ad-btn--primary w-full"
            >
              {submitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  Login to Admin Panel
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[12px] text-[var(--text-disabled)]">
          Authorised personnel only. All activity is logged.
        </p>
      </div>
    </div>
  );
};

export default Login;
