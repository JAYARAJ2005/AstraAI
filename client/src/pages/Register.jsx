import { useState } from "react";
import { registerUser } from "../services/api";

function Register({ onRegister, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check all fields
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    // Check password
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Minimum password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        name,
        email,
        password,
      });

      console.log("Registration successful:", data);

      setSuccess(
        "Account created successfully! You can now login."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Go to login after registration
      setTimeout(() => {
        if (onRegister) {
          onRegister();
        }
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
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

        <form onSubmit={handleRegister}>

          {/* Name */}

          <div className="form-group">

            <label>
              Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>

          {/* Email */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          {/* Password */}

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          {/* Confirm Password */}

          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

          </div>

          {/* Register Button */}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
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