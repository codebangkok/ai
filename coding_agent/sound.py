#!/usr/bin/env python3
import subprocess
import sys
from pathlib import Path


def play_wav(file_path: Path) -> None:
    """Play a WAV file using the appropriate system audio player."""
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    if sys.platform == "darwin":  # macOS
        subprocess.run(["afplay", str(file_path)], check=True)
    elif sys.platform == "linux":  # Linux
        subprocess.run(["aplay", str(file_path)], check=True)
    elif sys.platform == "win32":  # Windows
        subprocess.run(["powershell", "-c", f"(New-Object Media.SoundPlayer '{file_path}').PlaySync()"], check=True)
    else:
        raise NotImplementedError(f"Unsupported platform: {sys.platform}")


if __name__ == "__main__":
    play_wav(Path(__file__).parent / "sound.mp3")
