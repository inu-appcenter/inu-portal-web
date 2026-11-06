export default function RouteLoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100dvh",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid rgba(0, 0, 0, 0.08)",
          borderTopColor: "var(--brand-primary, #3182F6)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
