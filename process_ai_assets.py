import os
from PIL import Image

def remove_green_screen(img, tolerance=30):
    img = img.convert("RGBA")
    datas = img.getdata()
    newData = []
    
    for item in datas:
        r, g, b, a = item
        greenness = int(g) - max(int(r), int(b))
        if greenness > tolerance:
            alpha = max(0, 255 - (greenness - tolerance) * 5)
            # Desaturate the green part so the fringe isn't green
            new_g = min(g, max(r, b))
            newData.append((r, new_g, b, alpha))
        else:
            newData.append(item)
    img.putdata(newData)
    return img

def process_and_save(src_path, dest_name, size=None, remove_green=True):
    img = Image.open(src_path).convert("RGBA")
    
    if remove_green:
        img = remove_green_screen(img, tolerance=30)
        
    if size:
        img = img.resize(size, Image.Resampling.LANCZOS)
        
    # Quantize to 256 colors for RGBA to save space but keep quality
    img_quant = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
    
    dest_path = os.path.join("assets/images", dest_name)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    img_quant.save(dest_path, optimize=True)
    
    fs = os.path.getsize(dest_path) / 1024
    if fs < 10 or fs > 70:
        if fs < 10:
            # if too small, save without palette reduction
            img.save(dest_path, optimize=False)
        else:
            # if too large, quantize to 128 colors
            img_quant = img.quantize(colors=128, method=Image.Quantize.FASTOCTREE)
            img_quant.save(dest_path, optimize=True)
            fs_new = os.path.getsize(dest_path) / 1024
            if fs_new > 70:
                img_quant = img.quantize(colors=64, method=Image.Quantize.FASTOCTREE)
                img_quant.save(dest_path, optimize=True)
                
    final_fs = os.path.getsize(dest_path) / 1024
    print(f"Saved {dest_name} ({img.size[0]}x{img.size[1]}) - Final Size: {final_fs:.1f} KB")

files = {
    "bg_treasure_island.png": (r"C:\Users\QuIC\.gemini\antigravity\brain\624e53ac-2324-4bb3-9fe6-5dace2071ac6\bg_treasure_island_1773316174380.png", (720, 1280), False),
    "background_topdown.png": (r"C:\Users\QuIC\.gemini\antigravity\brain\624e53ac-2324-4bb3-9fe6-5dace2071ac6\bg_topdown_1773316189875.png", (512, 512), False),
    "decor_bubble_fountain.png": (r"C:\Users\QuIC\.gemini\antigravity\brain\624e53ac-2324-4bb3-9fe6-5dace2071ac6\decor_bubble_1773316205966.png", (512, 512), True),
    "decor_coral_garden.png": (r"C:\Users\QuIC\.gemini\antigravity\brain\624e53ac-2324-4bb3-9fe6-5dace2071ac6\decor_coral_1773316225641.png", (512, 512), True),
    "decor_kelp_arch.png": (r"C:\Users\QuIC\.gemini\antigravity\brain\624e53ac-2324-4bb3-9fe6-5dace2071ac6\decor_kelp_1773316244421.png", (512, 512), True),
    "decor_moon_rocks.png": (r"C:\Users\QuIC\.gemini\antigravity\brain\624e53ac-2324-4bb3-9fe6-5dace2071ac6\decor_moon_1773316265235.png", (512, 512), True),
    "decor_shell_bed.png": (r"C:\Users\QuIC\.gemini\antigravity\brain\624e53ac-2324-4bb3-9fe6-5dace2071ac6\decor_shell_1773316282655.png", (512, 512), True),
    "decor_treasure_castle.png": (r"C:\Users\QuIC\.gemini\antigravity\brain\624e53ac-2324-4bb3-9fe6-5dace2071ac6\decor_castle_1773316299757.png", (512, 512), True),
    "fish.png": (r"C:\Users\QuIC\.gemini\antigravity\brain\624e53ac-2324-4bb3-9fe6-5dace2071ac6\toy_fish_1773316315123.png", (512, 512), True),
}

for dest, (src, size, rm_green) in files.items():
    if os.path.exists(src):
        process_and_save(src, dest, size, rm_green)
    else:
        print(f"Missing {src}")
