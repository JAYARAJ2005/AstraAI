import { useState } from "react";
import { loginUser } from "../services/api";
import AstraLogo from "../components/AstraLogo";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Login({
  onLogin,
  onRegister,
  onBack,
}) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [touched, setTouched] =
    useState({
      email: false,
      password: false,
    });

  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // VALIDATION
  // =====================================================

  const validate = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email =
        "Email is required";
    } else if (
      !EMAIL_REGEX.test(email.trim())
    ) {
      errors.email =
        "Enter a valid email address";
    }

    if (!password) {
      errors.password =
        "Password is required";
    }

    return errors;
  };

  const errors = validate();

  const fieldError = (field) =>
    (touched[field] || submitted) &&
    errors[field]
      ? errors[field]
      : "";

  const handleBlur = (field) => {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    setSubmitted(true);

    if (
      Object.keys(errors).length > 0
    ) {
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: email.trim(),
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

      if (error.response) {
        setError(
          error.response.data
            ?.message ||
            "Login failed. Please try again."
        );
      } else if (error.request) {
        setError(
          "Cannot reach the server. Please make sure the backend is running."
        );
      } else {
        setError(
          "Login failed. Please try again."
        );
      }
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

        <div className="login-logo"><AstraLogo /></div>

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
          noValidate
        >

          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              className={
                fieldError("email")
                  ? "input-error"
                  : ""
              }
              aria-invalid={
                !!fieldError("email")
              }
              disabled={loading}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              onBlur={() =>
                handleBlur("email")
              }
            />

            {fieldError("email") && (
              <div className="field-error">
                {fieldError("email")}
              </div>
            )}

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label htmlFor="login-password">
              Password
            </label>

            <div className="password-field">

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                className={
                  fieldError("password")
                    ? "input-error"
                    : ""
                }
                aria-invalid={
                  !!fieldError(
                    "password"
                  )
                }
                disabled={loading}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                onBlur={() =>
                  handleBlur(
                    "password"
                  )
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                tabIndex={-1}
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

            {fieldError("password") && (
              <div className="field-error">
                {fieldError("password")}
              </div>
            )}

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