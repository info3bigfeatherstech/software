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
  const [showPassword, setShowPassword] = useState(false);
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
      console.error("Login failed:", _err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/50 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] bg-white border border-gray-200/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 z-10">
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 flex items-center justify-center mb-4 overflow-hidden rounded-lg bg-slate-900 px-4 py-2 border border-slate-800 shadow-sm">
              <img
                src="/bigfeathers-logo-cropped.png"
                alt="BigFeathers"
                className="max-h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">BizCentro Portal</h1>
            <p className="text-xs text-gray-500 mt-1">Please sign in to access your dashboard</p>
          </div>
        </div>

        <form className="p-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
                maxLength={10}
                className="w-full px-3.5 py-2 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all duration-200 shadow-sm"
                placeholder="10-digit mobile number"
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all duration-200 shadow-sm pr-10"
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {(localError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3.5 py-2.5 rounded-lg text-xs leading-normal">
              {localError || apiErrorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl text-center">
          <p className="text-[10px] text-gray-400 font-medium tracking-wide">
            BizCentro Premium Desktop Client v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
