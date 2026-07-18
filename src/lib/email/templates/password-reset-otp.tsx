import * as React from "react";

interface PasswordResetOTPEmailProps {
  name: string;
  otp: string;
}

export const PasswordResetOTPEmail: React.FC<PasswordResetOTPEmailProps> = ({
  name,
  otp,
}) => {
  return React.createElement("div", {
    style: {
      fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
      maxWidth: "480px",
      margin: "0 auto",
      padding: "40px 24px",
      backgroundColor: "#0f172a",
      borderRadius: "12px",
    },
  },
    React.createElement("div", {
      style: {
        textAlign: "center" as const,
        marginBottom: "32px",
      },
    },
      React.createElement("div", {
        style: {
          display: "inline-block",
          padding: "12px 20px",
          backgroundColor: "#1e293b",
          borderRadius: "8px",
          marginBottom: "24px",
        },
      },
        React.createElement("span", {
          style: {
            fontSize: "20px",
            fontWeight: "700",
            color: "#818cf8",
            letterSpacing: "-0.5px",
          },
        }, "📚 LibraryMS")
      ),
      React.createElement("h1", {
        style: {
          fontSize: "24px",
          fontWeight: "700",
          color: "#f8fafc",
          margin: "0 0 8px 0",
        },
      }, "Reset Your Password"),
      React.createElement("p", {
        style: {
          fontSize: "14px",
          color: "#94a3b8",
          margin: "0",
        },
      }, `Hi ${name}, we received a request to reset your password.`)
    ),
    React.createElement("div", {
      style: {
        backgroundColor: "#1e293b",
        borderRadius: "12px",
        padding: "32px",
        textAlign: "center" as const,
        marginBottom: "24px",
        border: "1px solid #334155",
      },
    },
      React.createElement("p", {
        style: {
          fontSize: "12px",
          textTransform: "uppercase" as const,
          letterSpacing: "2px",
          color: "#64748b",
          margin: "0 0 16px 0",
        },
      }, "Your Reset Code"),
      React.createElement("div", {
        style: {
          fontSize: "36px",
          fontWeight: "800",
          letterSpacing: "12px",
          color: "#f59e0b",
          fontFamily: "'Courier New', monospace",
          padding: "12px 0",
        },
      }, otp),
      React.createElement("p", {
        style: {
          fontSize: "13px",
          color: "#94a3b8",
          margin: "16px 0 0 0",
        },
      }, "This code expires in 10 minutes")
    ),
    React.createElement("div", {
      style: {
        backgroundColor: "#1c1917",
        borderRadius: "8px",
        padding: "16px",
        border: "1px solid #78350f",
        marginBottom: "24px",
      },
    },
      React.createElement("p", {
        style: {
          fontSize: "13px",
          color: "#fbbf24",
          margin: "0",
          textAlign: "center" as const,
        },
      }, "⚠️ If you did not request a password reset, please secure your account immediately.")
    ),
    React.createElement("p", {
      style: {
        fontSize: "12px",
        color: "#475569",
        textAlign: "center" as const,
        margin: "0",
      },
    }, "All existing sessions will be invalidated after the password is changed.")
  );
};
