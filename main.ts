// lost-sock-update entrypoint
// Writes the single-line status update to /output/entry.txt.
// Gate: UTF-8, 1-120 code points, exactly one line, not blank.

import { chmodSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";

const LINE = "Day 3 stuck to a stranger's hoodie. He keeps apologizing to his wife. I am not his sock.";
const OUT_PATH = "/output/entry.txt";
const TMP_PATH = "/output/.entry.txt.tmp";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

// --- gate checks -----------------------------------------------------------
if (typeof LINE !== "string") fail("entry must be a string");

const codePointCount = [...LINE].length;
if (codePointCount < 1 || codePointCount > 120) {
  fail(`entry length ${codePointCount} outside 1..120`);
}
if (LINE.trim().length === 0) fail("entry is blank");
if (LINE !== LINE.trim()) fail("entry has leading or trailing whitespace");
if (LINE.includes("\n") || LINE.includes("\r")) fail("entry must be a single line");

// --- write atomically ------------------------------------------------------
mkdirSync("/output", { recursive: true });

const payload = Buffer.from(LINE, "utf8");
writeFileSync(TMP_PATH, payload);
chmodSync(TMP_PATH, 0o644);
renameSync(TMP_PATH, OUT_PATH);
chmodSync(OUT_PATH, 0o644);

// --- read-back verify ------------------------------------------------------
const written = readFileSync(OUT_PATH);
if (!written.equals(payload)) {
  fail("read-back mismatch: bytes on disk differ from entry");
}
if (written.toString("utf8") !== LINE) {
  fail("read-back mismatch: decoded text differs from entry");
}
if (written.length !== payload.length) {
  fail(`byte length mismatch: ${written.length} !== ${payload.length}`);
}
const mode = statSync(OUT_PATH).mode & 0o777;
if (mode !== 0o644) {
  fail(`mode mismatch: got 0${mode.toString(8)}, want 0644`);
}

console.log("ok");
