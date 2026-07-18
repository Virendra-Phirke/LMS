import * as React from "react";

interface VerificationOTPEmailProps {
  name: string;
  otp: string;
}

export const VerificationOTPEmail: React.FC<VerificationOTPEmailProps> = ({
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
      }, "Verify Your Email"),
      React.createElement("p", {
        style: {
          fontSize: "14px",
          color: "#94a3b8",
          margin: "0",
        },
      }, `Hi ${name}, please use the code below to verify your email address.`)
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
      }, "Your Verification Code"),
      React.createElement("div", {
        style: {
          fontSize: "36px",
          fontWeight: "800",
          letterSpacing: "12px",
          color: "#818cf8",
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
    React.createElement("p", {
      style: {
        fontSize: "12px",
        color: "#475569",
        textAlign: "center" as const,
        margin: "0",
      },
    }, "If you did not request this code, please ignore this email.")
  );
};
