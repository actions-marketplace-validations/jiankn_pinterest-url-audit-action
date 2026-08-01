import { parsePinterestUrl } from "pinterest-url-normalizer";

const URL_PATTERN = /https?:\/\/[^\s<>"'`]+/giu;
const TRAILING_PUNCTUATION = /[),.;:!?\]}]+$/u;

function isPinterestLike(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === "pin.it" || hostname.includes("pinterest");
  } catch {
    return value.toLowerCase().includes("pinterest");
  }
}

function lineNumberAt(text, offset) {
  let line = 1;
  for (let index = 0; index < offset; index += 1) {
    if (text.charCodeAt(index) === 10) line += 1;
  }
  return line;
}

export function auditText(text) {
  const findings = [];

  for (const match of text.matchAll(URL_PATTERN)) {
    const value = match[0].replace(TRAILING_PUNCTUATION, "");
    if (!isPinterestLike(value)) continue;

    const line = lineNumberAt(text, match.index ?? 0);
    try {
      const parsed = parsePinterestUrl(value);
      findings.push({
        status: "valid",
        value,
        line,
        kind: parsed.kind,
        normalizedUrl: parsed.normalizedUrl,
      });
    } catch (error) {
      findings.push({
        status: "invalid",
        value,
        line,
        message: error instanceof Error ? error.message : "Unsupported Pinterest URL",
      });
    }
  }

  return findings;
}
