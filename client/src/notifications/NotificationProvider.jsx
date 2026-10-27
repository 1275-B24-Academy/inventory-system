import { useCallback, useRef, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { NotificationContext } from "./useNotification";

export default function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const nextId = useRef(0);

  const notify = useCallback((message, severity = "success") => {
    nextId.current += 1;

    setNotification({
      id: nextId.current,
      message,
      severity,
    });
  }, []);

  function handleClose(event, reason) {
    if (reason === "clickaway") return;
    setNotification(null);
  }

  return (
    <NotificationContext.Provider value={notify}>
      {children}

      {notification && (
        <Snackbar
          key={notification.id}
          open
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity={notification.severity}
            variant="filled"
            onClose={handleClose}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
}