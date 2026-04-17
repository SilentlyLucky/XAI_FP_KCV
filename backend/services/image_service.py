import io
import os
from functools import lru_cache

from PIL import Image

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_IMAGES_DIR = os.path.join(BASE_DIR, "backend", "dataset", "images", "val")
PANELS_DIR = os.path.join(BASE_DIR, "backend", "vlm_dataset", "panels")


def get_raw_image_path(image_id: str) -> str | None:
    path = os.path.join(RAW_IMAGES_DIR, f"{image_id}.jpg")
    if os.path.exists(path):
        return path
    path_png = os.path.join(RAW_IMAGES_DIR, f"{image_id}.png")
    if os.path.exists(path_png):
        return path_png
    return None


def get_panel_image_path(image_id: str) -> str | None:
    path = os.path.join(PANELS_DIR, f"{image_id}_3panel.jpg")
    if os.path.exists(path):
        return path
    return None


@lru_cache(maxsize=128)
def crop_heatmap(image_id: str) -> bytes | None:
    panel_path = get_panel_image_path(image_id)
    if not panel_path:
        return None

    try:
        img = Image.open(panel_path)
        w, h = img.size
        panel_w = w // 3

        heatmap = img.crop((panel_w, 0, panel_w * 2, h))

        buf = io.BytesIO()
        heatmap.save(buf, format="JPEG", quality=90)
        buf.seek(0)
        return buf.getvalue()
    except Exception as e:
        print(f"[ImageService] Error cropping heatmap for {image_id}: {e}")
        return None


@lru_cache(maxsize=128)
def crop_original_from_panel(image_id: str) -> bytes | None:
    panel_path = get_panel_image_path(image_id)
    if not panel_path:
        return None

    try:
        img = Image.open(panel_path)
        w, h = img.size
        panel_w = w // 3

        original = img.crop((0, 0, panel_w, h))

        buf = io.BytesIO()
        original.save(buf, format="JPEG", quality=90)
        buf.seek(0)
        return buf.getvalue()
    except Exception as e:
        print(f"[ImageService] Error cropping original for {image_id}: {e}")
        return None
