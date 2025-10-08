import config from './config.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const createDirectoryIfNotExists = async (directory) => {
  try {
    await fs.mkdir(directory, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
};

const bootstrap = async () => {
  // Create destination directory if it doesn't exist
  await createDirectoryIfNotExists(path.resolve(config.destination));
};

export default bootstrap;
