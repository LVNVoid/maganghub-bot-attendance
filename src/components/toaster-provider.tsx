"use client";

import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1e1e1e",
          color: "#ededed",
          border: "1px solid #2e2e2e",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "10px 14px",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
        },
        success: {
          iconTheme: {
            primary: "#3ecf8e",
            secondary: "#171717",
          },
        },
        error: {
          iconTheme: {
            primary: "#f87171",
            secondary: "#171717",
          },
        },
      }}
    />
  );
}
