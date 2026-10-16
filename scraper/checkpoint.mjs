import { promises as fs } from "node:fs";

export async function readCheckpoint(file, fingerprint) {
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8"));
    if (parsed.version !== 1 || parsed.fingerprint !== fingerprint || !Array.isArray(parsed.completed)) return { completed: [] };
    return parsed;
  } catch {
    return { completed: [] };
  }
}

export async function writeCheckpoint(file, fingerprint, completed) {
  const temporary = file + ".tmp";
  await fs.writeFile(temporary, JSON.stringify({
    version: 1,
    fingerprint,
    updatedAt: new Date().toISOString(),
    completed,
  }, null, 2) + "\n", "utf8");
  await fs.rename(temporary, file);
}

export async function clearCheckpoint(file) {
  await fs.rm(file, { force: true });
}
