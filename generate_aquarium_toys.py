import os
from PIL import Image, ImageDraw

OUT_DIR = "assets/images"

def draw_bubble_fountain(draw):
    # Plastic Volcano Bubbler
    draw.polygon([(10, 60), (32, 20), (54, 60)], fill=(150, 50, 50))
    draw.polygon([(25, 20), (39, 20), (37, 30), (27, 30)], fill=(200, 100, 50)) # lava/top
    # Bubbles (perfect circles for plastic look)
    draw.ellipse([30, 10, 34, 14], fill=(200, 240, 255))
    draw.ellipse([28, 0, 36, 8], fill=(200, 240, 255))
    draw.ellipse([36, 12, 40, 16], fill=(200, 240, 255))

def draw_coral_garden(draw):
    # Fake Plastic Corals
    # Base
    draw.ellipse([15, 55, 49, 64], fill=(100, 100, 100))
    # Tubular yellow coral
    draw.rectangle([20, 30, 26, 58], fill=(255, 230, 50))
    draw.ellipse([19, 28, 27, 33], fill=(200, 180, 20)) # Hole
    draw.rectangle([38, 40, 44, 58], fill=(255, 230, 50))
    draw.ellipse([37, 38, 45, 43], fill=(200, 180, 20))
    # Pink branch coral
    draw.polygon([(32, 58), (28, 35), (22, 25), (31, 23), (30, 35)], fill=(255, 100, 180))
    draw.polygon([(30, 35), (38, 28), (42, 30)], fill=(255, 100, 180))

def draw_kelp_arch(draw):
    # Plastic Kelp Arch
    # Base rocks
    draw.ellipse([5, 55, 20, 64], fill=(80, 80, 80))
    draw.ellipse([44, 55, 59, 64], fill=(80, 80, 80))
    # Arch (thick, uniform)
    draw.arc([12, 10, 52, 60], start=180, end=360, fill=(50, 200, 50), width=6)
    # Plastic leaves attached
    draw.polygon([(12, 35), (4, 30), (12, 25)], fill=(80, 220, 80))
    draw.polygon([(52, 35), (60, 30), (52, 25)], fill=(80, 220, 80))
    draw.polygon([(32, 10), (35, 2), (38, 10)], fill=(80, 220, 80))

def draw_moon_rocks(draw):
    # Glowing neon aquarium gravel/rocks
    draw.ellipse([10, 45, 35, 60], fill=(50, 255, 255))
    draw.ellipse([15, 48, 30, 56], fill=(200, 255, 255)) # highlight
    
    draw.ellipse([30, 40, 55, 60], fill=(255, 50, 255))
    draw.ellipse([35, 45, 50, 50], fill=(255, 200, 255)) # highlight

    draw.ellipse([25, 30, 45, 48], fill=(50, 50, 255))
    draw.ellipse([30, 35, 38, 40], fill=(150, 150, 255)) # highlight

def draw_shell_bed(draw):
    # Plastic Shell Bubbler/Bed
    draw.polygon([(10, 55), (32, 30), (54, 55)], fill=(255, 180, 200))
    draw.ellipse([5, 50, 59, 60], fill=(255, 150, 180))
    # Scallop lines
    draw.line([(32, 30), (15, 55)], fill=(200, 100, 150), width=2)
    draw.line([(32, 30), (25, 55)], fill=(200, 100, 150), width=2)
    draw.line([(32, 30), (39, 55)], fill=(200, 100, 150), width=2)
    draw.line([(32, 30), (49, 55)], fill=(200, 100, 150), width=2)
    # Bright plastic pearl
    draw.ellipse([27, 45, 37, 55], fill=(255, 255, 255))

def draw_treasure_castle(draw):
    # Toy Aquarium Castle (simple, primary colors)
    draw.rectangle([16, 30, 48, 60], fill=(150, 180, 220)) # Main body
    draw.rectangle([10, 20, 22, 60], fill=(120, 150, 200)) # Left tower
    draw.rectangle([42, 20, 54, 60], fill=(120, 150, 200)) # Right tower
    # Roofs (bright red plastic)
    draw.polygon([(10, 20), (16, 5), (22, 20)], fill=(220, 50, 50))
    draw.polygon([(42, 20), (48, 5), (54, 20)], fill=(220, 50, 50))
    # Door that fish can swim through (black/empty)
    draw.rectangle([26, 45, 38, 60], fill=(20, 20, 20))
    draw.ellipse([26, 40, 38, 50], fill=(20, 20, 20))

def draw_fish(draw):
    # Wind-up Toy Fish
    # Main Body (Plastic yellow/orange)
    draw.ellipse([15, 22, 55, 42], fill=(255, 150, 0))
    # Tail (Rigid plastic attached with a blocky joint)
    draw.polygon([(15, 32), (5, 20), (5, 44)], fill=(255, 50, 0))
    # Fin
    draw.polygon([(40, 22), (35, 12), (45, 18)], fill=(255, 50, 0))
    # Eye (Painted on)
    draw.ellipse([45, 26, 51, 32], fill=(255, 255, 255))
    draw.rectangle([47, 28, 49, 30], fill=(0, 0, 0))
    # Wind-up Key attached to side!
    draw.rectangle([29, 28, 33, 34], fill=(150, 150, 150)) # peg
    draw.ellipse([25, 22, 33, 38], outline=(200, 200, 200), width=2) # key loop

def draw_background_topdown(draw):
    # Top-down view of an aquarium
    draw.rectangle([0, 0, 64, 64], fill=(30, 120, 200)) # water
    # Aquarium glass edges (corners)
    draw.line([(0,0), (64,0)], fill=(200, 200, 200), width=3)
    draw.line([(0,0), (0,64)], fill=(200, 200, 200), width=3)
    draw.line([(63,0), (63,64)], fill=(200, 200, 200), width=3)
    draw.line([(0,63), (64,63)], fill=(200, 200, 200), width=3)
    
    # Neon gravel at bottom edge
    colors = [(255, 50, 150), (50, 255, 50), (50, 50, 255), (255, 255, 50)]
    for x in range(3, 61, 6):
        for y in range(54, 61, 4):
            c = colors[(x+y)%4]
            draw.rectangle([x, y, x+4, y+4], fill=c)

def draw_bg_treasure_island(draw, base_w, base_h):
    # Aquarium Backdrop Poster (Treasure Island themed)
    # Bright blue water background
    for y in range(base_h):
        r, g, b = 20, 100+int(y/base_h*100), 200+int(y/base_h*55)
        draw.line([(0, y), (base_w, y)], fill=(r, g, b))
    
    # Sand
    sand_y = int(base_h * 0.7)
    draw.rectangle([0, sand_y, base_w, base_h], fill=(240, 220, 150))
    # Fake painted sunken island/chest in the background
    island_x = int(base_w * 0.5)
    island_y = int(base_h * 0.6)
    draw.ellipse([island_x-80, island_y, island_x+80, sand_y+20], fill=(100, 80, 50))
    draw.rectangle([island_x-20, island_y-20, island_x+20, island_y+10], fill=(150, 100, 20)) # chest
    
    # Painted plants on poster
    for x in range(20, base_w, 40):
        h = 50 + (x % 30)
        draw.line([(x, sand_y+10), (x, sand_y-h)], fill=(50, 180, 100), width=6)
        draw.line([(x, sand_y-h), (x+10, sand_y-h-20)], fill=(50, 180, 100), width=6)

def generate_pixel_sprite(filename, draw_func, is_bg=False):
    if is_bg:
        base_w, base_h = 360, 640
        img = Image.new("RGBA", (base_w, base_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img, 'RGBA')
        draw_func(draw, base_w, base_h)
        final_img = img.resize((720, 1280), Image.Resampling.NEAREST)
    else:
        base_size = 64
        img = Image.new("RGBA", (base_size, base_size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img, 'RGBA')
        draw_func(draw)
        final_img = img.resize((128, 128), Image.Resampling.NEAREST)

    os.makedirs(OUT_DIR, exist_ok=True)
    filepath = os.path.join(OUT_DIR, filename)
    final_img.save(filepath)
    print(f"Generated {filename} ({final_img.size[0]}x{final_img.size[1]}) - Size: {os.path.getsize(filepath)/1024:.1f} KB")

if __name__ == "__main__":
    generate_pixel_sprite("decor_bubble_fountain.png", draw_bubble_fountain)
    generate_pixel_sprite("decor_coral_garden.png", draw_coral_garden)
    generate_pixel_sprite("decor_kelp_arch.png", draw_kelp_arch)
    generate_pixel_sprite("decor_moon_rocks.png", draw_moon_rocks)
    generate_pixel_sprite("decor_shell_bed.png", draw_shell_bed)
    generate_pixel_sprite("decor_treasure_castle.png", draw_treasure_castle)
    generate_pixel_sprite("fish.png", draw_fish)
    generate_pixel_sprite("background_topdown.png", draw_background_topdown)
    generate_pixel_sprite("bg_treasure_island.png", draw_bg_treasure_island, is_bg=True)
