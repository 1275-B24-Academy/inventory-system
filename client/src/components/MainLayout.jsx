import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { Inventory2Outlined, LogoutOutlined } from '@mui/icons-material';

export default function MainLayout({ user, onLogout, disabled, children }) {
  return (
    <Box
      sx={{ height: '100dvh', display: 'flex', bgcolor: 'background.default' }}
    >
      <Box
        component="aside"
        sx={{
          width: 220,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          p: 3,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Inventory2Outlined color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6">Kho Việt</Typography>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1, mb: 4 }}
        >
          QUẢN LÝ KHO
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: '#EFF6FF',
            color: 'primary.main',
          }}
        >
          <Inventory2Outlined fontSize="small" />
          <Typography fontWeight={600}>Sản phẩm</Typography>
        </Stack>
      </Box>

      <Box
        sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Stack
          component="header"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 },
            py: 1.5,
            minHeight: 64,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Typography
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Quản lý kho / Sản phẩm
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', ml: 'auto' }}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
              {user?.name?.trim().charAt(0).toUpperCase() || 'U'}
            </Avatar>

            <Box>
              <Typography variant="body2" fontWeight={600}>
                {user?.name || 'Người dùng'}
              </Typography>
              <Chip
                label={user?.role || 'staff'}
                color="primary"
                size="small"
                variant="outlined"
              />
            </Box>

            <Button
              onClick={onLogout}
              disabled={disabled}
              startIcon={<LogoutOutlined />}
              color="inherit"
              size="small"
            >
              Đăng xuất
            </Button>
          </Stack>
        </Stack>

        <Box
          component="main"
          sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 2, md: 4 } }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
