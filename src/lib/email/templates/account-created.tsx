import * as React from "react";

interface AccountCreatedEmailProps {
  name: string;
  role: string;
  loginUrl: string;
}

export const AccountCreatedEmail: React.FC<AccountCreatedEmailProps> = ({
  name,
  role,
  loginUrl,
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
      }, "Welcome to the Library!"),
      React.createElement("p", {
        style: {
          fontSize: "14px",
          color: "#94a3b8",
          margin: "0",
        },
      }, `Hi ${name}, your ${role.toLowerCase()} account has been created.`)
    ),
    React.createElement("div", {
      style: {
        backgroundColor: "#1e293b",
        borderRadius: "12px",
        padding: "24px",
        textAlign: "center" as const,
        marginBottom: "24px",
        border: "1px solid #334155",
      },
    },
      React.createElement("p", {
        style: {
          fontSize: "14px",
          color: "#e2e8f0",
          margin: "0 0 8px 0",
        },
      }, "Your account role:"),
      React.createElement("div", {
        style: {
          display: "inline-block",
          padding: "6px 16px",
          backgroundColor: "#312e81",
          borderRadius: "20px",
          fontSize: "14px",
          fontWeight: "600",
          color: "#a5b4fc",
          marginBottom: "16px",
        },
      }, role),
      React.createElement("p", {
        style: {
          fontSize: "13px",
          color: "#94a3b8",
          margin: "16px 0 0 0",
        },
      }, "You will receive a verification code shortly. Please verify your email to activate your account.")
    ),
    React.createElement("div", {
      style: { textAlign: "center" as const, marginBottom: "24px" },
    },
      React.createElement("a", {
        href: loginUrl,
        style: {
          display: "inline-block",
          padding: "12px 32px",
          backgroundColor: "#6366f1",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: "600",
          borderRadius: "8px",
          textDecoration: "none",
        },
      }, "Go to Login")
    ),
    React.createElement("p", {
      style: {
        fontSize: "12px",
        color: "#475569",
        textAlign: "center" as const,
        margin: "0",
      },
    }, "This account was created by an administrator. If you believe this is an error, please contact your library admin.")
  );
};
