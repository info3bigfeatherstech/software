import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../REDUX_FEATURES/REDUX_SLICES/Login_Api/authApi";
import { setCredentials } from "../REDUX_FEATURES/REDUX_SLICES/Login_Api/authSlice";

const getErrorMessage = (error) =>
  error?.data?.message || error?.error || "Unable to login. Please try again.";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();

  const apiErrorMessage = useMemo(() => getErrorMessage(error), [error]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    const cleanedPhone = phone.replace(/[^\d]/g, "");
    if (cleanedPhone.length !== 10) {
      setLocalError("Phone must be exactly 10 digits.");
      return;
    }
    if (!password || password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    try {
      const payload = await login({ phone: cleanedPhone, password }).unwrap();
      dispatch(setCredentials(payload));
      navigate("/dashboard", { replace: true });
    } catch (_err) {
      console.error("Login failed:>", _err);
      // Error is already available via RTK Query state.
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-slate-400">Secure Access</p>
          <h1 className="text-2xl font-semibold text-white mt-2">Login to Vyaapar</h1>
          <p className="text-sm text-slate-400 mt-1">Use your staff phone and password.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="block text-sm text-slate-300 mb-1.5">
              Phone
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
              maxLength={10}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
              placeholder="10-digit phone number"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          {(localError || error) && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {localError || apiErrorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-white font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
