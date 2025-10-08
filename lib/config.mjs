import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const filename = fileURLToPath(import.meta.url);
const directory = dirname(filename);

const configPath = join(directory, '../config.json');
const configFile = readFileSync(configPath, 'utf-8');
const config = JSON.parse(configFile);

export default config;
