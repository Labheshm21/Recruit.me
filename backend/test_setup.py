import subprocess
import sys

def install_package(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

packages = [
    "fastapi",
    "uvicorn", 
    "sqlalchemy",
    "argon2-cffi",
    "passlib",
    "python-multipart"
]

print("Installing required packages...")
for package in packages:
    try:
        install_package(package)
        print(f"✓ {package} installed")
    except Exception as e:
        print(f"✗ Failed to install {package}: {e}")

print("\nVerifying installations...")
for package in packages:
    try:
        if package == "argon2-cffi":
            __import__("argon2")
        elif package == "python-multipart":
            __import__("multipart")
        else:
            __import__(package)
        print(f"✓ {package} verified")
    except ImportError as e:
        print(f"✗ {package} not available: {e}")