import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const sourceDir = resolve(projectRoot, 'drizzle');
const targetDir = resolve(projectRoot, 'dist/drizzle');

if (!existsSync(sourceDir)) {
  console.warn(`No drizzle migrations directory found at ${sourceDir}`);
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });
console.log(`Copied drizzle migrations to ${targetDir}`);
