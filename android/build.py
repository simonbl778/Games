#!/usr/bin/env python3
"""Build and sign the offline Android app using official Android SDK tools.

No Gradle, Android Studio, external Android libraries or network access are
needed during the build. Supply android.jar, Android Build Tools and ECJ.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ANDROID = ROOT / "android"


def run(*command: str | Path, env: dict[str, str] | None = None) -> None:
    subprocess.run([str(arg) for arg in command], check=True, env=env)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--android-jar", type=Path, required=True)
    parser.add_argument("--build-tools", type=Path, required=True)
    parser.add_argument("--compiler", type=Path, required=True, help="Eclipse ECJ jar")
    parser.add_argument("--signing-dir", type=Path, default=ANDROID / "signing")
    args = parser.parse_args()
    android_jar = args.android_jar.resolve()
    tools = args.build_tools.resolve()
    compiler = args.compiler.resolve()
    for item in (android_jar, compiler, tools / "aapt2", tools / "d8", tools / "zipalign", tools / "apksigner"):
        if not item.is_file():
            parser.error(f"Missing build dependency: {item}")

    ns = "{http://schemas.android.com/apk/res/android}"
    manifest = ET.parse(ANDROID / "AndroidManifest.xml").getroot()
    version = manifest.attrib[ns + "versionName"]
    if manifest.findall("uses-permission"):
        raise ValueError("The offline app must not request Android permissions.")

    build = ANDROID / "build"
    if build.exists():
        shutil.rmtree(build)
    for directory in ("assets", "classes", "dex", "res"):
        (build / directory).mkdir(parents=True)
    shutil.copytree(ANDROID / "res", build / "res", dirs_exist_ok=True)
    (build / "res" / "drawable").mkdir()
    shutil.copy2(ROOT / "docs/silbengenerator/icons/icon-192.png", build / "res/drawable/app_icon.png")
    assets = build / "assets" / "silbengenerator"
    shutil.copytree(ROOT / "docs/silbengenerator", assets)

    # The APK already contains every file. Keep the web game unchanged and
    # replace only PWA registration/install UI in the packaged copy.
    app = assets / "app.js"
    source = app.read_text()
    marker = "void registerOffline();"
    if source.count(marker) != 1:
        raise ValueError("Cannot identify the web-only service worker startup.")
    app.write_text(source.replace(marker,
        "$('offline-status').textContent = 'Offline bereit';\n"
        "$('install-button').hidden = true;"))
    (assets / "service-worker.js").unlink()

    run(tools / "aapt2", "compile", "--dir", build / "res", "-o", build / "resources.zip")
    run(tools / "aapt2", "link", "-o", build / "unsigned.apk", "-I", android_jar,
        "--manifest", ANDROID / "AndroidManifest.xml", "-A", build / "assets", build / "resources.zip")
    sources = sorted((ANDROID / "src").rglob("*.java"))
    run("java", "-jar", compiler, "-1.8", "-nowarn", "-proc:none", "-bootclasspath", android_jar,
        "-d", build / "classes", *sources)
    run(tools / "d8", "--release", "--min-api", "26", "--lib", android_jar,
        "--output", build / "dex", *sorted((build / "classes").rglob("*.class")))
    with zipfile.ZipFile(build / "unsigned.apk", "a", compression=zipfile.ZIP_DEFLATED) as apk:
        for dex in sorted((build / "dex").glob("*.dex")):
            apk.write(dex, dex.name)
    run(tools / "zipalign", "-f", "4", build / "unsigned.apk", build / "aligned.apk")

    signing = args.signing_dir.resolve()
    signing.mkdir(parents=True, exist_ok=True, mode=0o700)
    secret_file = signing / "signing.json"
    key = signing / "silbengenerator-release.jks"
    if secret_file.exists() != key.exists():
        raise ValueError("Signing key or password missing: restore both from the private backup.")
    if secret_file.exists():
        secret = json.loads(secret_file.read_text())
    else:
        secret = {"alias": "silbengenerator", "password": secrets.token_urlsafe(36)}
    environment = os.environ.copy()
    environment["SYLLABLE_ANDROID_SIGNING_PASSWORD"] = secret["password"]
    if not key.exists():
        run("keytool", "-genkeypair", "-keystore", key, "-storetype", "PKCS12",
            "-alias", secret["alias"], "-keyalg", "RSA", "-keysize", "3072",
            "-validity", "10000", "-dname", "CN=Silbengenerator",
            "-storepass:env", "SYLLABLE_ANDROID_SIGNING_PASSWORD",
            "-keypass:env", "SYLLABLE_ANDROID_SIGNING_PASSWORD", env=environment)
        key.chmod(0o600)
        secret_file.write_text(json.dumps(secret, indent=2) + "\n")
        secret_file.chmod(0o600)

    downloads = ROOT / "downloads"
    downloads.mkdir(exist_ok=True)
    result = downloads / f"Silbengenerator-{version}.apk"
    run(tools / "apksigner", "sign", "--ks", key, "--ks-key-alias", secret["alias"],
        "--ks-pass", "env:SYLLABLE_ANDROID_SIGNING_PASSWORD", "--key-pass", "env:SYLLABLE_ANDROID_SIGNING_PASSWORD",
        "--v4-signing-enabled", "false", "--out", result, build / "aligned.apk", env=environment)
    result.chmod(0o644)
    run(tools / "apksigner", "verify", "--verbose", "--print-certs", result)
    run(tools / "zipalign", "-c", "4", result)
    with zipfile.ZipFile(result) as apk:
        for name in ("AndroidManifest.xml", "classes.dex", "assets/silbengenerator/index.html",
                     "assets/silbengenerator/app.js", "assets/silbengenerator/generator.js"):
            if name not in apk.namelist():
                raise ValueError(f"APK missing required file: {name}")
        for original in (ROOT / "docs/silbengenerator").rglob("*"):
            if original.is_file() and original.name not in ("app.js", "service-worker.js"):
                packed = "assets/silbengenerator/" + original.relative_to(ROOT / "docs/silbengenerator").as_posix()
                if apk.read(packed) != original.read_bytes():
                    raise ValueError(f"Packaged asset differs: {original.name}")

    digest = hashlib.sha256(result.read_bytes()).hexdigest()
    (downloads / (result.name + ".sha256")).write_text(f"{digest}  {result.name}\n")
    # Never publish this archive; it is needed to sign compatible future updates.
    with zipfile.ZipFile(signing / "Silbengenerator-privates-Schluesselbackup.zip", "w", compression=zipfile.ZIP_DEFLATED) as backup:
        backup.write(key, key.name)
        backup.write(secret_file, secret_file.name)
        backup.writestr("BITTE-LESEN.txt", "Privates Signierschluessel-Backup fuer den Silbengenerator.\n"
            "Nicht mit der APK verteilen und nicht oeffentlich hochladen.\n"
            "Fuer kuenftige kompatible Updates beide Dateien im Ordner android/signing wiederherstellen.\n")
    print(f"Created and verified {result.name} ({result.stat().st_size} bytes).")


if __name__ == "__main__":
    main()
