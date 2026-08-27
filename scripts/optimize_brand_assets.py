from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[1] / "assets" / "images"
names = ["icon.png", "splash-icon.png", "favicon.png", "android-icon-foreground.png"]

for name in names:
    path = root / name
    with Image.open(path) as image:
        image = image.convert("RGBA")
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        palette = image.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
        palette.save(path, format="PNG", optimize=True)
