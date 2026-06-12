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
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm app-card shadow-app-md">
        <div className="app-card-header">
          <div className="text-center w-full">
            <h1 className="text-base font-semibold text-app-text">Vyapar Login</h1>
            <p className="text-xs text-app-text-muted mt-0.5">Enter your staff credentials</p>
          </div>
        </div>

        <form className="app-card-body space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="app-label">Phone Number</label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
              maxLength={10}
              className="app-input"
              placeholder="10-digit mobile number"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="app-label">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-input pr-10"
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
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
            <div className="app-alert-danger text-xs">
              {localError || apiErrorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="app-btn-primary w-full py-2"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
