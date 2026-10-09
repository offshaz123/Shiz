"use client";

export function LogoutButton({ className = "btn btn-white rounded-lg" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      Log out
    </button>
  );
}
