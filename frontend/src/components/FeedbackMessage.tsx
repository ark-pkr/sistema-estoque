type FeedbackType = "success" | "error" | "warning" | "info";

type FeedbackMessageProps = {
  type: FeedbackType;
  message: string;
};

export default function FeedbackMessage({
  type,
  message,
}: FeedbackMessageProps) {
  if (!message) return null;

  const styleMap: Record<FeedbackType, React.CSSProperties> = {
    success: {
      background: "#ecfdf5",
      color: "#166534",
      border: "1px solid #86efac",
    },
    error: {
      background: "#fef2f2",
      color: "#991b1b",
      border: "1px solid #fca5a5",
    },
    warning: {
      background: "#fff7ed",
      color: "#9a3412",
      border: "1px solid #fdba74",
    },
    info: {
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #93c5fd",
    },
  };

  return (
    <div
      style={{
        ...baseStyle,
        ...styleMap[type],
      }}
    >
      {message}
    </div>
  );
}

const baseStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "12px 14px",
  borderRadius: "10px",
  fontWeight: 600,
};