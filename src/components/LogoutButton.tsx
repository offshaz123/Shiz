"use client";

export function LogoutButton({ className = "btn btn-white rounded-lg" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        // A full page load clears everything from the logged-in session.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/";
      }}
    >
      Log out
    </button>
  );
}
