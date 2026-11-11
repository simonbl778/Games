import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);

test('ein fehlender APK-Schlüssel wird bei Updates nicht stillschweigend ersetzt', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'blitz-key-guard-'));
  try {
    const release = readFileSync(new URL('android/blitzblickzahlen/release.json', root));
    const missing = join(temporary, 'missing-signing');
    const result = spawnSync('python3', ['scripts/build-apk.py', '--sdk', join(temporary, 'missing-sdk'), '--signing-dir', missing], { cwd: root, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Existing release: restore the Google Drive backup/);
    assert.equal(existsSync(missing), false);
    assert.deepEqual(readFileSync(new URL('android/blitzblickzahlen/release.json', root)), release);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

test('ein anderes oder beschädigtes Schlüsselbackup wird vor dem Wiederherstellen zurückgewiesen', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'blitz-backup-guard-'));
  try {
    const wrong = join(temporary, 'wrong.zip');
    const target = join(temporary, 'restored-signing');
    writeFileSync(wrong, 'not the recorded private backup');
    const result = spawnSync('python3', ['scripts/restore-apk-signing.py', '--backup-file', wrong, '--signing-dir', target], { cwd: root, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Private backup checksum does not match/);
    assert.equal(existsSync(target), false);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
