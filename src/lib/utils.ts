import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple HTML sanitizer wrapper to be used before injecting HTML
// Uses a deferred import to avoid bundling cost when unused
export async function sanitizeHtml(html: string): Promise<string> {
  try {
    const DOMPurify = await import('dompurify');
    // In browsers, DOMPurify exports as default with .sanitize
    const purify: any = (DOMPurify as any).default ?? DOMPurify;
    return purify.sanitize(html);
  } catch {
    // If DOMPurify is not available, return original HTML (caller should consider risks)
    return html;
  }
}