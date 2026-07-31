import { whatsappHref } from "@/lib/site-config";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20 ring-4 ring-[#25D366]/20 transition-transform hover:scale-105 sm:bottom-7 sm:right-7"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping [animation-duration:2.2s]" />
      <svg
        viewBox="0 0 32 32"
        fill="white"
        className="relative h-7 w-7"
        aria-hidden="true"
      >
        <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.28.63 4.4 1.72 6.22L4 29l7.94-1.66a12.9 12.9 0 0 0 4.08.66C22.6 28 28 22.6 28 15.98 28 9.36 22.64 3 16.02 3Zm0 23.4c-1.34 0-2.66-.34-3.82-.98l-.28-.16-4.7.98 1-4.6-.18-.3a10.35 10.35 0 0 1-1.6-5.34c0-5.7 4.64-10.34 10.6-10.34 5.66 0 10.36 4.62 10.36 10.36 0 5.7-4.7 10.38-11.38 10.38Zm5.86-7.72c-.32-.16-1.9-.94-2.2-1.04-.3-.1-.5-.16-.72.16-.2.32-.84 1.04-1.02 1.24-.2.2-.38.24-.7.08-.32-.16-1.36-.5-2.58-1.6-.96-.86-1.6-1.9-1.8-2.22-.18-.32-.02-.48.14-.64.14-.14.32-.38.48-.56.16-.2.2-.32.32-.54.1-.2.06-.4-.02-.56-.08-.16-.72-1.74-.98-2.38-.26-.62-.52-.54-.72-.56-.18 0-.4-.02-.6-.02-.2 0-.56.08-.86.4-.28.32-1.12 1.1-1.12 2.68 0 1.58 1.16 3.1 1.32 3.32.16.2 2.28 3.48 5.52 4.88.78.34 1.38.54 1.86.68.78.24 1.5.2 2.06.13.62-.1 1.9-.78 2.18-1.53.26-.75.26-1.4.18-1.53-.08-.13-.28-.2-.6-.36Z" />
      </svg>
    </a>
  );
}
