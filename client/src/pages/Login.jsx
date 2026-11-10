import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Link,
  Typography,
} from '@mui/material';
import { VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';

import { useAuth } from '../auth/useAuth';
import AuthLayout from '../components/auth/AuthLayout';
import { useNotification } from '../notifications/useNotification';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const notify = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      notify('Đăng nhập thành công.');
      navigate('/products', { replace: true });
    } catch (error) {
      setError(error.message || 'Không thể đăng nhập.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để quản lý kho hàng của bạn"
    >
      <Stack component="form" onSubmit={handleSubmit} spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="ban@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
          fullWidth
        />

        <TextField
          label="Mật khẩu"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          required
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    edge="end"
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlined />
                    ) : (
                      <VisibilityOutlined />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Chưa có tài khoản?{' '}
          <Link component={RouterLink} to="/register" underline="hover">
            Đăng ký
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
