import assert from "node:assert/strict";
import test from "node:test";

import { auditText } from "../src/audit.js";

test("finds valid URLs and returns their canonical forms", () => {
  const [finding] = auditText(
    "See https://de.pinterest.com/pin/987654321/?utm_source=share for details.",
  );

  assert.deepEqual(finding, {
    status: "valid",
    value: "https://de.pinterest.com/pin/987654321/?utm_source=share",
    line: 1,
    kind: "pin",
    normalizedUrl: "https://www.pinterest.com/pin/987654321/",
  });
});

test("flags lookalike domains and reports line numbers", () => {
  const findings = auditText(
    "Safe text\nhttps://www.pinterest.com.evil.example/pin/123/\nhttp://pinterest.com/pin/123/",
  );

  assert.equal(findings.length, 2);
  assert.equal(findings[0].status, "invalid");
  assert.equal(findings[0].line, 2);
  assert.equal(findings[1].status, "invalid");
  assert.equal(findings[1].line, 3);
});

test("ignores unrelated URLs", () => {
  assert.deepEqual(auditText("https://savepinner.com/pinterest-downloader/"), []);
});
