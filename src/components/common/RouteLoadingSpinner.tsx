export default function RouteLoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100dvh",
        backgroundColor: "var(--bg-base, #F9FAFB)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid #E5E8EB",
          borderTopColor: "#3182F6",
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
