import DOMPurify from 'dompurify';

/**
 * Enhanced function to sanitize text and prevent XSS
 * @param text - The text to sanitize
 * @returns Sanitized text
 */
export function sanitize(text: string | null | undefined): string {
  if (!text) return '';
  
  // For client-side, use DOMPurify with strict settings
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(text, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      FORBID_TAGS: ['script', 'img', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown', 'onkeyup', 'onkeypress']
    });
  }
  
  // For server-side, mirror the client DOMPurify output (strip all HTML tags,
  // keep the text content unchanged). This keeps the server and client HTML
  // identical and prevents hydration mismatches. React escapes text content
  // and attribute values when rendering, so no entity escaping is needed here.
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize HTML content that needs to preserve some formatting
 * @param text - The HTML text to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(text: string | null | undefined): string {
  if (!text) return '';
  
  // For client-side, use DOMPurify with limited allowed tags
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'b', 'i'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      FORBID_TAGS: ['script', 'img', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown', 'onkeyup', 'onkeypress']
    });
  }
  
  // For server-side, strip all HTML tags
  return text.replace(/<[^>]*>/g, '');
}
