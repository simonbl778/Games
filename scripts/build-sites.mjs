import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Games remains the source of truth; Sites publishes the same /docs files.
const output = fileURLToPath(new URL('../dist/', import.meta.url));
const source = fileURLToPath(new URL('../docs/', import.meta.url));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
console.log('Sites-Dateien aus docs/ in dist/ vorbereitet.');
