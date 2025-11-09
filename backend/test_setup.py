import subprocess
import sys
import importlib

def install_package(package):
    """Install a package using pip"""
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def verify_import(package_name):
    """Verify that a package can be imported successfully"""
    try:
        if package_name == "argon2-cffi":
            importlib.import_module("argon2")
        elif package_name == "python-multipart":
            importlib.import_module("multipart")
        else:
            # Extract package name without version specifiers for import
            clean_name = package_name.split('>=')[0].split('==')[0].split('<=')[0]
            importlib.import_module(clean_name)
        return True
    except ImportError as e:
        print(f"    Import error: {e}")
        return False

# Packages with versions compatible with Python 3.13
packages = [
    "fastapi==0.104.1",
    "uvicorn==0.24.0", 
    "sqlalchemy>=2.0.28",  # Critical: Version that supports Python 3.13
    "argon2-cffi==23.1.0",
    "passlib==1.7.4",
    "python-multipart==0.0.6",
    "psycopg2-binary==2.9.11"  # Added PostgreSQL support
]

print("=" * 50)
print("Installing Required Packages for Python 3.13")
print("=" * 50)

# First, upgrade pip to ensure best compatibility
print("\n1. Upgrading pip...")
try:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
    print("✓ pip upgraded successfully")
except Exception as e:
    print(f"⚠ pip upgrade failed: {e} (continuing anyway)")

# Install each package
print("\n2. Installing packages...")
for package in packages:
    try:
        print(f"   Installing {package}...")
        install_package(package)
        print(f"   ✓ {package} installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"   ✗ Failed to install {package}: pip error")
    except Exception as e:
        print(f"   ✗ Failed to install {package}: {e}")

# Verify all installations
print("\n3. Verifying installations...")
verification_failures = []

for package in packages:
    # Extract clean package name for display
    clean_name = package.split('>=')[0].split('==')[0].split('<=')[0]
    
    print(f"   Verifying {clean_name}...")
    if verify_import(package):
        print(f"   ✓ {clean_name} verified")
    else:
        print(f"   ✗ {clean_name} verification failed")
        verification_failures.append(clean_name)

# Final summary
print("\n" + "=" * 50)
print("INSTALLATION SUMMARY")
print("=" * 50)

if not verification_failures:
    print("🎉 SUCCESS: All packages installed and verified!")
    print("\nYou can now run your FastAPI application with:")
    print("  uvicorn main:app --reload")
else:
    print(f"⚠ {len(verification_failures)} package(s) failed verification:")
    for failed_pkg in verification_failures:
        print(f"   - {failed_pkg}")
    
    print("\nTroubleshooting steps:")
    print("1. Try installing failed packages individually")
    print("2. Check Python 3.13 compatibility for specific packages")
    print("3. Consider using a virtual environment")

# Additional check for common FastAPI dependencies
print("\n" + "=" * 50)
print("ADDITIONAL CHECKS")
print("=" * 50)

# Check if we can import key components
key_imports = [
    ("FastAPI", "fastapi"),
    ("SQLAlchemy", "sqlalchemy"),
    ("Argon2", "argon2"),
    ("UVicorn", "uvicorn")
]

for import_name, module_name in key_imports:
    try:
        importlib.import_module(module_name)
        print(f"✓ {import_name} available")
    except ImportError as e:
        print(f"✗ {import_name} not available: {e}")

print("\n" + "=" * 50)
print("Setup completed!")
print("=" * 50)

"""import subprocess
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
        """