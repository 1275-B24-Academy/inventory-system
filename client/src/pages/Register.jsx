import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AuthLayout from "../components/auth/AuthLayout";
import { registerApi } from "../services/authApi";
import { useNotification } from "../notifications/useNotification";

const fields = [
  { name: "name", label: "Họ và tên", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    name: "password",
    label: "Mật khẩu",
    type: "password",
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Xác nhận mật khẩu",
    type: "password",
    autoComplete: "new-password",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const notify = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerApi({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      });

      notify("Đăng ký thành công. Bạn có thể đăng nhập ngay.");
      navigate("/login", { replace: true });
    } catch (error) {
      setError(error.message || "Không thể đăng ký.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Bắt đầu quản lý kho hàng cùng Kho Việt"
    >
      <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}

        {fields.map((field) => (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type || "text"}
            autoComplete={field.autoComplete}
            value={formData[field.name]}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            fullWidth
          />
        ))}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
        </Button>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Đã có tài khoản?{" "}
          <Link component={RouterLink} to="/login" underline="hover">
            Đăng nhập
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
