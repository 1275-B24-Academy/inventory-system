import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate("/products", { replace: true });
    } catch (error) {
      setError(error.message || "Không thể đăng nhập.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Đăng nhập</h2>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}