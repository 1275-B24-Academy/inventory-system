import { Paper, Stack, Typography } from "@mui/material";

export default function StatCard({ stat }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2.5,
            borderRadius: "8px",
            borderColor: "#E2E8F0",
          }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            bgcolor: stat.background,
            color: stat.color,
          }}
        >
          {stat.icon}
        </Stack>

        <div>
          <Typography variant="body2" color="text.secondary">
            {stat.title}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5 }}>
            {stat.value}
          </Typography>
        </div>
      </Stack>
    </Paper>
  );
}