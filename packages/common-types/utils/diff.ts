import { createPatch, applyPatch } from "diff";

/**
 * Deterministic, dependency-free content hash that behaves identically in the
 * browser and in Node/Bun (no `crypto` import, so it is safe to bundle for the
 * web client). Implemented as FNV-1a (32-bit) with a length suffix to make
 * accidental collisions on real source files effectively impossible for our
 * "did the base content drift?" check.
 */
export const hashContent = (content: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${(hash >>> 0).toString(16).padStart(8, "0")}:${content.length.toString(16)}`;
};

/**
 * Build a unified-diff patch describing how to turn `oldContent` into
 * `newContent`. The `path` is only used as the file label inside the patch.
 */
export const createContentPatch = (
  path: string,
  oldContent: string,
  newContent: string
): string => {
  return createPatch(path, oldContent, newContent, "", "", { context: 3 });
};

/**
 * Apply a unified-diff patch to `oldContent`. Returns the patched string, or
 * `null` when the patch does not apply cleanly (caller should fall back to a
 * full resync).
 */
export const applyContentPatch = (
  oldContent: string,
  patch: string
): string | null => {
  const result = applyPatch(oldContent, patch);
  return result === false ? null : result;
};
