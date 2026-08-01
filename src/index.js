import { readFile } from "node:fs/promises";

import * as core from "@actions/core";
import * as glob from "@actions/glob";

import { auditText } from "./audit.js";

const DEFAULT_PATTERNS = [
  "**/*.md",
  "**/*.mdx",
  "**/*.txt",
  "**/*.json",
  "**/*.jsonl",
  "**/*.csv",
  "**/*.yaml",
  "**/*.yml",
  "!**/node_modules/**",
  "!**/dist/**",
].join("\n");

async function run() {
  const patterns = core.getMultilineInput("paths").join("\n") || DEFAULT_PATTERNS;
  const failOnInvalid = core.getBooleanInput("fail-on-invalid");
  const matcher = await glob.create(patterns, {
    followSymbolicLinks: false,
    implicitDescendants: false,
  });
  const files = await matcher.glob();

  let validCount = 0;
  let invalidCount = 0;
  const summaryRows = [];

  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const finding of auditText(text)) {
      if (finding.status === "invalid") {
        invalidCount += 1;
        core.warning(`${finding.message}: ${finding.value}`, {
          file,
          startLine: finding.line,
          title: "Invalid Pinterest URL",
        });
        summaryRows.push(["Invalid", file, String(finding.line), finding.value]);
        continue;
      }

      validCount += 1;
      if (finding.value !== finding.normalizedUrl) {
        core.notice(`Canonical URL: ${finding.normalizedUrl}`, {
          file,
          startLine: finding.line,
          title: "Pinterest URL can be normalized",
        });
        summaryRows.push(["Normalize", file, String(finding.line), finding.normalizedUrl]);
      }
    }
  }

  core.setOutput("valid-count", validCount);
  core.setOutput("invalid-count", invalidCount);

  await core.summary
    .addHeading("Pinterest URL Audit")
    .addRaw(`Scanned ${files.length} files. Found ${validCount} valid and ${invalidCount} invalid Pinterest-like URLs.`)
    .addTable([
      [
        { data: "Result", header: true },
        { data: "File", header: true },
        { data: "Line", header: true },
        { data: "URL", header: true },
      ],
      ...summaryRows,
    ])
    .write();

  if (failOnInvalid && invalidCount > 0) {
    core.setFailed(`Found ${invalidCount} invalid Pinterest-like URL(s).`);
  }
}

run().catch((error) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
