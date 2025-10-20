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
    const purify: any = (DOMPurify as any).default ?? DOMPurify;
    return purify.sanitize(html);
  } catch (err) {
    // If DOMPurify is not available or throws, fail closed to avoid blank/crash from unsafe HTML
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[sanitizeHtml] Failed to sanitize HTML, returning empty string', err);
    }
    return '';
  }
}