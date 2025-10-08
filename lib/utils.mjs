import fs from 'node:fs/promises';
import path from 'node:path';

export const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const ensureDirectoryExists = async (directoryOrPath) => {
  await fs.mkdir(path.dirname(directoryOrPath), { recursive: true });
};
