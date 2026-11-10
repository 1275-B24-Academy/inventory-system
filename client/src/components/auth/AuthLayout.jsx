import { Box, Paper, Stack, Typography } from "@mui/material";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        component="header"
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ px: { xs: 3, sm: 5 }, py: 2 }}
      >
        <Inventory2Outlined color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h6">Kho Việt</Typography>
      </Stack>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          px: 2,
          py: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
            <Inventory2Outlined color="primary" sx={{ fontSize: 48 }} />
            <Typography component="h1" variant="h5" textAlign="center">
              {title}
            </Typography>
            <Typography
              color="text.secondary"
              textAlign="center"
              variant="body2"
            >
              {subtitle}
            </Typography>
          </Stack>

          {children}
        </Paper>
      </Box>

      <Typography
        component="footer"
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center", p: 2 }}
      >
        Hệ thống quản lý kho
      </Typography>
    </Box>
  );
}
