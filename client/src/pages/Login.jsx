import { useState } from "react";
import { loginUser } from "../services/api";

function Login({
  onLogin,
  onRegister,
  onBack,
}) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        "Please enter email and password"
      );

      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email,
        password,
      });

      console.log(
        "Login successful:",
        data
      );

      if (onLogin) {
        onLogin(data.user);
      }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* BACK BUTTON */}

        <button
          type="button"
          className="auth-back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        {/* LOGO */}

        <div className="login-logo">
          ✦
        </div>

        {/* TITLE */}

        <h1>
          Welcome to AstraAI
        </h1>

        <p className="login-subtitle">
          Sign in to your intelligent AI assistant
        </p>

        {/* ERROR */}

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}

        <form
          onSubmit={handleLogin}
        >

          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Login"}
          </button>

        </form>

        {/* REGISTER */}

        <p className="login-footer">

          Don't have an account?{" "}

          <span
            onClick={() => {
              if (onRegister) {
                onRegister();
              }
            }}
            style={{
              cursor: "pointer",
            }}
          >
            Register
          </span>

        </p>

      </div>

    </div>
  );
}

export default Login;