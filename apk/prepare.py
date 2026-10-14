"""SNK AI Academy — Android app (APK) প্রজেক্ট তৈরি করে।
ব্যবহার: python3 apk/prepare.py  (repo root থেকে)  →  ./android-build/ ফোল্ডারে Android প্রজেক্ট তৈরি হয়।
অ্যাপ লাইভ সাইট (SITE_URL) খোলে, তাই সাইটে বদল করলেই অ্যাপেও বদল দেখা যায় — নতুন APK লাগে না।"""
import json, os, shutil, subprocess, sys
from PIL import Image

SITE_URL = os.environ.get("SITE_URL", "https://exam.snkitinstitute.com/student-dashboard.html")
APP_NAME = os.environ.get("APP_NAME", "SNK AI Academy")
APP_ID = os.environ.get("APP_ID", "com.snkacademy.app")
ROOT = os.getcwd()
OUT = os.path.join(ROOT, "android-build")

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(os.path.join(OUT, "www"))

with open(os.path.join(OUT, "package.json"), "w") as f:
    json.dump({"name": "snk-academy-app", "version": "1.0.0", "private": True}, f)

# ছোট অফলাইন পেজ (ইন্টারনেট না থাকলে এটা দেখাবে)
shutil.copy(os.path.join(ROOT, "offline.html"), os.path.join(OUT, "www", "index.html"))

with open(os.path.join(OUT, "capacitor.config.json"), "w") as f:
    json.dump({
        "appId": APP_ID,
        "appName": APP_NAME,
        "webDir": "www",
        "server": {"url": SITE_URL, "cleartext": False, "androidScheme": "https", "errorPath": "index.html"},
        "android": {"allowMixedContent": False}
    }, f, indent=2)

def run(*cmd):
    print("+", " ".join(cmd), flush=True)
    subprocess.check_call(cmd, cwd=OUT)

run("npm", "install", "--no-audit", "--no-fund", "@capacitor/core@6", "@capacitor/cli@6", "@capacitor/android@6")
run("npx", "cap", "add", "android")
run("npx", "cap", "sync", "android")

# লঞ্চার আইকন বদলানো
res = os.path.join(OUT, "android", "app", "src", "main", "res")
src = Image.open(os.path.join(ROOT, "icons", "icon-512.png")).convert("RGBA")
sizes = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
for d, px in sizes.items():
    folder = os.path.join(res, "mipmap-" + d)
    os.makedirs(folder, exist_ok=True)
    for name in ("ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"):
        src.resize((px, px), Image.LANCZOS).save(os.path.join(folder, name))
shutil.rmtree(os.path.join(res, "mipmap-anydpi-v26"), ignore_errors=True)  # adaptive আইকন বাদ, PNG আইকনই চলবে
print("OK: Android প্রজেক্ট তৈরি —", OUT)
