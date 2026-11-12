import { Paper, Stack, Typography } from "@mui/material";

export default function StatCard({ stat, onClick, selected = false }) {
  const clickable = typeof onClick === "function";

  return (
    <Paper
      component={clickable ? "button" : "div"}
      type={clickable ? "button" : undefined}
      onClick={onClick}
      aria-pressed={clickable ? selected : undefined}
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: "8px",
        borderColor: selected ? stat.color : "#E2E8F0",
        bgcolor: selected ? stat.background : "background.paper",
        width: "100%",
        minWidth: 0,
        textAlign: "left",
        font: "inherit",
        color: "inherit",
        cursor: clickable ? "pointer" : "default",
        "&:focus-visible": {
          outline: `2px solid ${stat.color}`,
          outlineOffset: 3,
        },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            flexShrink: 0,
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
