import os
from PIL import Image

# Determine directories relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
out_dir = os.path.join(script_dir, "frontend", "src", "assets", "vicky")
os.makedirs(out_dir, exist_ok=True)

# Use the saved master sheet in assets
src_path = os.path.join(out_dir, "vicky_master_sheet.jpg")

if not os.path.exists(src_path):
    raise FileNotFoundError(f"Master sheet not found at: {src_path}")

img = Image.open(src_path)

crops = {
    # Logos & Avatars
    "logo": (870, 58, 1008, 148),
    "avatar_circle": (20, 15, 192, 172),
    "avatar_square_wink": (202, 15, 363, 172),
    "resting_paws": (700, 15, 860, 172),

    # Full Body Poses (Row 2, y=175 to 385)
    "full_sitting": (16, 175, 168, 385),
    "full_wink": (190, 175, 335, 385),
    "full_waving": (355, 175, 500, 385),
    "full_profile": (520, 175, 642, 385),
    "full_walking": (660, 175, 805, 385),
    "full_sleeping": (800, 230, 1014, 385),

    # Row 3 Emotions (headshot crops without the text label)
    "emotion_happy": (15, 388, 130, 508),
    "emotion_wink": (138, 388, 252, 508),
    "emotion_curious": (260, 388, 365, 508),
    "emotion_excited": (380, 388, 498, 508),
    "emotion_thinking": (510, 388, 626, 508),
    "emotion_sad": (642, 388, 762, 508),
    "emotion_laugh": (770, 388, 882, 508),
    "emotion_confused": (885, 388, 1006, 508),

    # Row 3 Emotions with badge label
    "badge_happy": (15, 388, 130, 528),
    "badge_wink": (138, 388, 252, 528),
    "badge_curious": (260, 388, 365, 528),
    "badge_excited": (380, 388, 498, 528),
    "badge_thinking": (510, 388, 626, 528),
    "badge_sad": (642, 388, 762, 528),
    "badge_laugh": (770, 388, 882, 528),
    "badge_confused": (885, 388, 1006, 528),

    # Row 4 Activity Scenes
    "scene_laptop_chat": (10, 532, 209, 668),
    "scene_waving_hi": (217, 532, 377, 668),
    "scene_coding": (384, 532, 542, 668),
    "scene_idea": (549, 532, 676, 668),
    "scene_reading": (684, 532, 817, 668),
    "scene_sleeping": (824, 532, 1014, 668),
}

for name, box in crops.items():
    cropped = img.crop(box)
    cropped.save(os.path.join(out_dir, f"vicky_{name}.png"), format="PNG")
    print(f"Saved {name}: {box} -> size {cropped.size}")

print("Cropping completed successfully!")
