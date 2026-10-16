import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readCheckpoint, writeCheckpoint, clearCheckpoint } from "./checkpoint.mjs";

test("checkpoint round-trips progress and rejects a different candidate fingerprint", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "afs-checkpoint-"));
  const file = path.join(dir, "checkpoint.json");
  try {
    const completed = [{ candidate: { fullName: "a/b" }, accepted: null }];
    await writeCheckpoint(file, "fingerprint-a", completed);
    assert.deepEqual((await readCheckpoint(file, "fingerprint-a")).completed, completed);
    assert.deepEqual((await readCheckpoint(file, "fingerprint-b")).completed, []);
    await clearCheckpoint(file);
    assert.deepEqual((await readCheckpoint(file, "fingerprint-a")).completed, []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
