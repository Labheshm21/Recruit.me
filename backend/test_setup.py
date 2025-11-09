import subprocess
import sys
from typing import Iterable


def install_package(package: str) -> None:
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])


def verify_package(module: str) -> None:
    __import__(module)


packages: Iterable[str] = [
    "fastapi",
    "uvicorn[standard]",
    "pydantic",
    "pydantic-settings",
    "python-jose[cryptography]",
    "boto3",
    "requests",
]

verify_targets: Iterable[str] = [
    "fastapi",
    "uvicorn",
    "pydantic",
    "pydantic_settings",
    "jose",
    "boto3",
    "requests",
]

print("Installing required packages...")
for package in packages:
    try:
        install_package(package)
        print(f"[ok] {package} installed")
    except Exception as exc:
        print(f"[error] Failed to install {package}: {exc}")

print("\nVerifying installations...")
for module in verify_targets:
    try:
        verify_package(module)
        print(f"[ok] {module} verified")
    except ImportError as exc:
        print(f"[missing] {module} not available: {exc}")
