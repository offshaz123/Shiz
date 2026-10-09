import Image from "next/image";
import { PlatePreview } from "@/components/PlatePreview";
import type { Post } from "@/lib/blog";
import { defaultConfig } from "@/lib/plates";

// The post's photo, or a plate drawn in the post's style until a photo is added.
export function PostImage({ post, priority = false, sizes }: { post: Post; priority?: boolean; sizes: string }) {
  if (post.image)
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-surface">
        <Image src={post.image} alt={post.imageAlt ?? post.title} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    );
  const { text, style = "4d-5mm", badge = "none", type = "legal" } = post.plate;
  return (
    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-3xl bg-[#0d0b07]">
      <div aria-hidden className="gold-bg absolute -bottom-24 left-1/2 h-48 w-[80%] -translate-x-1/2 rounded-full opacity-30 blur-3xl" />
      <PlatePreview
        config={{ ...defaultConfig, type, style, badge, reg: text }}
        side="rear"
        label={text}
        className="relative w-[78%] drop-shadow-2xl"
      />
    </div>
  );
}
