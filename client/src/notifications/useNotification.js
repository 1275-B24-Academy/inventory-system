import { createContext, useContext } from "react";

export const NotificationContext = createContext(null);

export function useNotification() {
  const context = useContext(NotificationContext);

  if (context === null) {
    throw new Error(
      "useNotification phải nằm trong NotificationProvider."
    );
  }

  return context;
}