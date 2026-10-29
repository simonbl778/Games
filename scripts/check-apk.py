#!/usr/bin/env python3
"""Check that the downloadable APK contains the current game and matches its release record."""
import hashlib
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
release = json.loads((root / 'android/blitzblickzahlen/release.json').read_text())
apk_path = root / release['apk']
assert hashlib.sha256(apk_path.read_bytes()).hexdigest() == release['sha256'], 'APK checksum differs'
assert apk_path.stat().st_size == release['sizeBytes'], 'APK size differs'
zip_path = root / release['zip']
assert hashlib.sha256(zip_path.read_bytes()).hexdigest() == release['zipSha256'], 'ZIP checksum differs'
with zipfile.ZipFile(zip_path) as package:
    assert set(package.namelist()) == {apk_path.name, apk_path.name + '.sha256', 'INSTALLATION.txt'}
    assert package.read(apk_path.name) == apk_path.read_bytes(), 'ZIP contains a different APK'
    assert package.read('INSTALLATION.txt') == (root / 'android/blitzblickzahlen/INSTALLATION.txt').read_bytes()
with zipfile.ZipFile(apk_path) as apk:
    names = set(apk.namelist())
    assert {'AndroidManifest.xml', 'classes.dex', 'resources.arsc'} <= names
    assert not any(name.endswith(('.p12', '.jks', '.keystore')) for name in names)
    game = root / 'docs/blitzblickzahlen'
    for path in game.rglob('*'):
        if not path.is_file(): continue
        relative = path.relative_to(game).as_posix()
        assert apk.read('assets/web/blitzblickzahlen/' + relative) == path.read_bytes(), f'Stale APK asset: {relative}'
        assert hashlib.sha256(path.read_bytes()).hexdigest() == release['bundledGameFiles'][relative]
print('APK checksum, required files and all bundled game assets verified.')
