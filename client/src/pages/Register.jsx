import {
  useEffect,
  useRef,
  useState,
} from "react";

import { registerUser } from "../services/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Password strength: returns level + label
const getPasswordStrength = (password) => {
  if (!password) {
    return {
      level: "",
      label: "",
    };
  }

  let score = 0;

  if (password.length >= 8) score++;

  if (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password)
  )
    score++;

  if (/\d/.test(password)) score++;

  if (/[^A-Za-z0-9]/.test(password))
    score++;

  if (score <= 1) {
    return {
      level: "weak",
      label: "Weak",
    };
  }

  if (score === 2) {
    return {
      level: "medium",
      label: "Medium",
    };
  }

  return {
    level: "strong",
    label: "Strong",
  };
};

function Register({ onRegister, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const redirectTimerRef = useRef(null);

  // Stop the redirect timer if the page is left early
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(
          redirectTimerRef.current
        );
      }
    };
  }, []);

  // =====================================================
  // VALIDATION
  // =====================================================

  const validate = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.trim().length < 2) {
      errors.name =
        "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (
      !EMAIL_REGEX.test(email.trim())
    ) {
      errors.email =
        "Enter a valid email address";
    }

    if (!password) {
      errors.password =
        "Password is required";
    } else if (password.length < 6) {
      errors.password =
        "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword =
        "Please confirm your password";
    } else if (
      password !== confirmPassword
    ) {
      errors.confirmPassword =
        "Passwords do not match";
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

  const strength =
    getPasswordStrength(password);

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      console.log(
        "Registration successful:",
        data
      );

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setTouched({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
      });
      setSubmitted(false);

      // Go to login after registration
      redirectTimerRef.current =
        setTimeout(() => {
          if (onRegister) {
            onRegister();
          }
        }, 1500);
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Registration failed. Please try again."
        );
      } else if (error.request) {
        setError(
          "Cannot reach the server. Please make sure the backend is running."
        );
      } else {
        setError(
          "Registration failed. Please try again."
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

        {/* Logo */}

        <div className="login-logo">
          ✦
        </div>

        {/* Title */}

        <h1>
          Create your AstraAI account
        </h1>

        <p className="login-subtitle">
          Start using your intelligent AI assistant
        </p>

        {/* Error */}

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="login-success">
            {success}
          </div>
        )}

        {/* Registration Form */}

        <form
          onSubmit={handleRegister}
          noValidate
        >

          {/* Name */}

          <div className="form-group">

            <label htmlFor="register-name">
              Name
            </label>

            <input
              id="register-name"
              type="text"
              placeholder="Enter your name"
              autoComplete="name"
              value={name}
              className={
                fieldError("name")
                  ? "input-error"
                  : ""
              }
              aria-invalid={
                !!fieldError("name")
              }
              disabled={loading}
              onChange={(e) =>
                setName(e.target.value)
              }
              onBlur={() =>
                handleBlur("name")
              }
            />

            {fieldError("name") && (
              <div className="field-error">
                {fieldError("name")}
              </div>
            )}

          </div>

          {/* Email */}

          <div className="form-group">

            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
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
                setEmail(e.target.value)
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

          {/* Password */}

          <div className="form-group">

            <label htmlFor="register-password">
              Password
            </label>

            <div className="password-field">

              <input
                id="register-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                autoComplete="new-password"
                value={password}
                className={
                  fieldError("password")
                    ? "input-error"
                    : ""
                }
                aria-invalid={
                  !!fieldError("password")
                }
                disabled={loading}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                onBlur={() =>
                  handleBlur("password")
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

            {/* Strength meter */}

            {password && (
              <div className="password-strength">

                <div
                  className={`strength-bar ${strength.level}`}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="strength-label">
                  Password strength:{" "}
                  {strength.label}
                </div>

              </div>
            )}

          </div>

          {/* Confirm Password */}

          <div className="form-group">

            <label htmlFor="register-confirm">
              Confirm Password
            </label>

            <div className="password-field">

              <input
                id="register-confirm"
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={confirmPassword}
                className={
                  fieldError(
                    "confirmPassword"
                  )
                    ? "input-error"
                    : ""
                }
                aria-invalid={
                  !!fieldError(
                    "confirmPassword"
                  )
                }
                disabled={loading}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                onBlur={() =>
                  handleBlur(
                    "confirmPassword"
                  )
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirm(
                    (previous) =>
                      !previous
                  )
                }
                tabIndex={-1}
              >
                {showConfirm
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

            {fieldError(
              "confirmPassword"
            ) && (
              <div className="field-error">
                {fieldError(
                  "confirmPassword"
                )}
              </div>
            )}

          </div>

          {/* Register Button */}

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !!success}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        {/* Login Link */}

        <p className="login-footer">
          Already have an account?{" "}

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
            Login
          </span>
        </p>

      </div>

    </div>
  );
}

export default Register;