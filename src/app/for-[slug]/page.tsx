"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ForSlugRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      // Direct redirect to the preview route with matching prefix
      router.push(`/preview/for-${slug}`);
    } else {
      router.push("/");
    }
  }, [slug, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#030303]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
    </div>
  );
}
