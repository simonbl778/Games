#!/usr/bin/env python3
"""Build the offline APK with Android SDK 35; no network services or Gradle required."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--sdk', default=os.environ.get('ANDROID_SDK_ROOT'))
parser.add_argument('--ecj', default=os.environ.get('ECJ_JAR'), help='Optional Eclipse compiler jar when javac is not installed')
parser.add_argument('--signing-dir', default=str(Path.home() / '.local/share/blitzblickzahlen-signing'))
parser.add_argument('--allow-new-signing-key', action='store_true', help='Explicitly allow a new signing identity; old installations must then be removed')
args = parser.parse_args()
if not args.sdk:
    parser.error('Set ANDROID_SDK_ROOT or pass --sdk (platforms/android-35 and build-tools/35.0.0).')
sdk = Path(args.sdk).resolve()
tools = sdk / 'build-tools/35.0.0'
android = sdk / 'platforms/android-35/android.jar'
config = json.loads((ROOT / 'android/blitzblickzahlen/app.json').read_text())
version = config['versionName']
release_path = ROOT / 'android/blitzblickzahlen/release.json'
previous_release = json.loads(release_path.read_text()) if release_path.exists() else None
signing = Path(args.signing_dir).expanduser().resolve()
if signing == ROOT or ROOT in signing.parents:
    raise RuntimeError('Private signing files must be stored outside the Git repository.')
keystore = signing / 'release.p12'
password_file = signing / 'password.txt'
if keystore.exists() != password_file.exists():
    raise RuntimeError('The signing key and password must both exist; restore the private backup.')
if previous_release and not keystore.exists() and not args.allow_new_signing_key:
    raise RuntimeError('Existing release: restore the Google Drive backup described in android/blitzblickzahlen/signing-backup.json. Do not create a replacement key for an ordinary update.')
if previous_release and config['versionCode'] < previous_release['versionCode']:
    raise RuntimeError('Android versionCode must not decrease.')
build = ROOT / '.android-build/blitzblickzahlen'
if build.exists():
    shutil.rmtree(build)
for directory in ['res/drawable', 'assets/web', 'classes', 'dex']:
    (build / directory).mkdir(parents=True, exist_ok=True)
game = ROOT / 'docs/blitzblickzahlen'
shutil.copytree(game, build / 'assets/web/blitzblickzahlen')
shutil.copyfile(game / 'icons/icon-512.png', build / 'res/drawable/app_icon.png')

def run(command, env=None):
    result = subprocess.run([str(part) for part in command], cwd=ROOT, env=env, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(f'{Path(str(command[0])).name} failed:\n{result.stdout}{result.stderr}')
    return result

java = shutil.which('java')
sources = sorted((ROOT / 'android/blitzblickzahlen/src').rglob('*.java'))
if args.ecj:
    compiler = [java, '-jar', Path(args.ecj).resolve(), '-8', '-warn:none']
else:
    compiler = [shutil.which('javac') or 'javac', '-source', '8', '-target', '8']
run(compiler + ['-encoding', 'UTF-8', '-classpath', android, '-d', build / 'classes'] + sources)
classes = sorted((build / 'classes').rglob('*.class'))
run([java, '-cp', tools / 'lib/d8.jar', 'com.android.tools.r8.D8', '--lib', android,
     '--min-api', str(config['minSdk']), '--output', build / 'dex'] + classes)
run([tools / 'aapt2', 'compile', '--dir', build / 'res', '-o', build / 'resources.zip'])
run([tools / 'aapt2', 'link', '-o', build / 'unsigned.apk', '-I', android,
     '--manifest', ROOT / 'android/blitzblickzahlen/AndroidManifest.xml',
     '--min-sdk-version', str(config['minSdk']), '--target-sdk-version', str(config['targetSdk']),
     '--version-code', str(config['versionCode']), '--version-name', version,
     '-A', build / 'assets', build / 'resources.zip'])
with zipfile.ZipFile(build / 'unsigned.apk', 'a', zipfile.ZIP_DEFLATED) as archive:
    for dex in (build / 'dex').glob('*.dex'):
        archive.write(dex, dex.name)
run([tools / 'zipalign', '-P', '16', '-f', '4', build / 'unsigned.apk', build / 'aligned.apk'])

# Keep the release identity outside the repository. Reuse these files for updates.
signing.mkdir(parents=True, exist_ok=True, mode=0o700)
signing.chmod(0o700)
if not password_file.exists():
    password_file.write_text(secrets.token_urlsafe(32))
    password_file.chmod(0o600)
env = os.environ.copy()
env['BLITZ_KEYSTORE_PASSWORD'] = password_file.read_text().strip()
if not keystore.exists():
    run(['keytool', '-genkeypair', '-keystore', keystore, '-storetype', 'PKCS12',
         '-storepass:env', 'BLITZ_KEYSTORE_PASSWORD', '-keypass:env', 'BLITZ_KEYSTORE_PASSWORD',
         '-alias', 'blitzblickzahlen', '-keyalg', 'RSA', '-keysize', '3072', '-validity', '10000',
         '-dname', 'CN=Blitzblickzahlen, O=Games, C=DE'], env=env)
    keystore.chmod(0o600)
output = ROOT / 'docs/downloads' / f'blitzblickzahlen-{version}.apk'
signed_apk = build / 'signed.apk'
run([tools / 'apksigner', 'sign', '--ks', keystore, '--ks-key-alias', 'blitzblickzahlen',
     '--ks-pass', 'env:BLITZ_KEYSTORE_PASSWORD', '--key-pass', 'env:BLITZ_KEYSTORE_PASSWORD',
     '--v4-signing-enabled', 'false', '--out', signed_apk, build / 'aligned.apk'], env=env)
verification = run([tools / 'apksigner', 'verify', '--verbose', '--print-certs', signed_apk]).stdout
run([tools / 'zipalign', '-c', '-P', '16', '4', signed_apk])
certificate = next(line.split(': ', 1)[1] for line in verification.splitlines()
                   if line.startswith('Signer #1 certificate SHA-256 digest:'))
changed_key = bool(previous_release and certificate != previous_release['certificateSha256'])
if changed_key and not args.allow_new_signing_key:
    raise RuntimeError('The signing certificate differs from the published APK. Restore the original backup; no download has been replaced.')

# This private archive is never copied to docs/, dist/, Git, or the public ZIP.
private_backup = signing / 'Blitzblickzahlen-Signaturschluessel-PRIVAT.zip'
if private_backup.exists():
    with zipfile.ZipFile(private_backup) as archive:
        if archive.read('release.p12') != keystore.read_bytes() or archive.read('password.txt') != password_file.read_bytes():
            raise RuntimeError('Private backup does not match this signing identity.')
else:
    with zipfile.ZipFile(private_backup, 'w', zipfile.ZIP_DEFLATED) as archive:
        archive.write(keystore, 'release.p12')
        archive.write(password_file, 'password.txt')
        archive.writestr('README-PRIVATE.txt', 'PRIVATE SIGNING BACKUP - do not share or publish.\n'
                         'Restore release.p12 and password.txt together with scripts/restore-apk-signing.py.\n'
                         f'Application: {config["applicationId"]}\nCertificate SHA-256: {certificate}\n')
    private_backup.chmod(0o600)
output.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(signed_apk, output)
digest = hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.apk.sha256').write_text(f'{digest}  {output.name}\n')
zip_output = output.parent / f'Blitzblickzahlen-Android-{version}.zip'
with zipfile.ZipFile(zip_output, 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.write(output, output.name)
    archive.write(output.with_suffix('.apk.sha256'), output.name + '.sha256')
    archive.write(ROOT / 'android/blitzblickzahlen/INSTALLATION.txt', 'INSTALLATION.txt')
record = {**config, 'apk': output.relative_to(ROOT).as_posix(), 'sha256': digest,
          'signingKeyChanged': changed_key or bool(previous_release and previous_release.get('versionName') == version and previous_release.get('signingKeyChanged')),
          'compatibleSigningSince': version if changed_key else (previous_release or {}).get('compatibleSigningSince', version),
          'zip': zip_output.relative_to(ROOT).as_posix(), 'zipSha256': hashlib.sha256(zip_output.read_bytes()).hexdigest(),
          'certificateSha256': certificate, 'sizeBytes': output.stat().st_size,
          'bundledGameFiles': {path.relative_to(game).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
                               for path in sorted(game.rglob('*')) if path.is_file()}}
release_path.write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps({'apk': str(output), 'zip': str(zip_output), 'bytes': output.stat().st_size, 'sha256': digest,
                  'certificateSha256': certificate, 'signingDirectory': str(signing), 'privateBackup': str(private_backup)}, indent=2))
