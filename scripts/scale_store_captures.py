from pathlib import Path

from PIL import Image

SOURCE_DIR = Path("store-assets/screenshots")
TARGET_SIZE = (1170, 2532)

for source in sorted(SOURCE_DIR.glob("*-raw.png")):
    destination = source.with_name(source.name.replace("-raw", ""))
    with Image.open(source) as image:
        scaled = image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
        scaled.save(destination, "PNG", optimize=True)
        print(f"{source.name} -> {destination.name}: {scaled.size[0]}x{scaled.size[1]}")
