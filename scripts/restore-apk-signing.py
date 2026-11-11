#!/usr/bin/env python3
"""Restore the private Drive backup and verify its identity before allowing APK updates."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--backup-file', required=True)
parser.add_argument('--signing-dir', default=str(Path.home() / '.local/share/blitzblickzahlen-signing'))
args = parser.parse_args()
reference = json.loads((root / 'android/blitzblickzahlen/signing-backup.json').read_text())
archive_path = Path(args.backup_file).expanduser().resolve()
if hashlib.sha256(archive_path.read_bytes()).hexdigest() != reference['backup']['sha256']:
    raise RuntimeError('Private backup checksum does not match the recorded backup.')
target = Path(args.signing_dir).expanduser().resolve()
if (target / 'release.p12').exists() or (target / 'password.txt').exists():
    raise RuntimeError('Signing files already exist; use that identity or restore to a new empty directory.')
with tempfile.TemporaryDirectory(prefix='blitz-signing-') as temporary:
    staging = Path(temporary)
    with zipfile.ZipFile(archive_path) as archive:
        if set(archive.namelist()) != {'release.p12', 'password.txt', 'README-PRIVATE.txt'}:
            raise RuntimeError('Unexpected files in private signing backup.')
        for name in ['release.p12', 'password.txt']:
            data = archive.read(name)
            if len(data) > 65536:
                raise RuntimeError('Unexpected signing file size.')
            (staging / name).write_bytes(data)
            (staging / name).chmod(0o600)
    env = os.environ.copy()
    env['BLITZ_KEYSTORE_PASSWORD'] = (staging / 'password.txt').read_text().strip()
    certificate = subprocess.run(['keytool', '-exportcert', '-keystore', str(staging / 'release.p12'),
                                 '-storepass:env', 'BLITZ_KEYSTORE_PASSWORD', '-alias', 'blitzblickzahlen'],
                                env=env, capture_output=True, check=True).stdout
    fingerprint = hashlib.sha256(certificate).hexdigest()
    if fingerprint != reference['certificateSha256']:
        raise RuntimeError('Restored signing certificate does not match the APK identity.')
    target.mkdir(parents=True, exist_ok=True, mode=0o700)
    target.chmod(0o700)
    for name in ['release.p12', 'password.txt']:
        shutil.copyfile(staging / name, target / name)
        (target / name).chmod(0o600)
    shutil.copyfile(archive_path, target / 'Blitzblickzahlen-Signaturschluessel-PRIVAT.zip')
    (target / 'Blitzblickzahlen-Signaturschluessel-PRIVAT.zip').chmod(0o600)
print(json.dumps({'restored': True, 'signingDirectory': str(target), 'certificateSha256': fingerprint}))
