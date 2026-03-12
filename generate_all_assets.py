import os
import random
import math
from PIL import Image, ImageDraw, ImageFilter

OUT_DIR = "assets/images"

def add_noise(draw, x_min, y_min, x_max, y_max, base_color, noise_amount=30, density=0.2, condition=None):
    for y in range(int(y_min), int(y_max)):
        for x in range(int(x_min), int(x_max)):
            if condition and not condition(x, y):
                continue
            if random.random() < density:
                n = random.randint(-noise_amount, noise_amount)
                c = (
                    max(0, min(255, base_color[0] + n)),
                    max(0, min(255, base_color[1] + n)),
                    max(0, min(255, base_color[2] + n))
                )
                draw.point((x, y), fill=c)

def draw_gradient_rect(draw, x_min, y_min, x_max, y_max, color_top, color_bottom):
    h = y_max - y_min
    if h <= 0: return
    for y in range(int(y_min), int(y_max)):
        ratio = (y - y_min) / float(h)
        r = int(color_top[0] * (1 - ratio) + color_bottom[0] * ratio)
        g = int(color_top[1] * (1 - ratio) + color_bottom[1] * ratio)
        b = int(color_top[2] * (1 - ratio) + color_bottom[2] * ratio)
        draw.line([(x_min, y), (x_max, y)], fill=(r, g, b))

def draw_bubble_fountain(draw, size):
    # Dithered background water effect
    for y in range(size):
        for x in range(size):
            r = int(20 + x*0.1)
            g = int(50 + y*0.2)
            b = int(100 + (x+y)*0.3)
            draw.point((x,y), fill=(r,g,b, 100))

    # Grand Fountain Base
    draw.polygon([(size*0.2, size), (size*0.3, size*0.7), (size*0.7, size*0.7), (size*0.8, size)], fill=(60, 70, 80))
    add_noise(draw, size*0.2, size*0.7, size*0.8, size, (60,70,80), noise_amount=20, density=0.3)
    
    # Tier 2
    draw.polygon([(size*0.35, size*0.7), (size*0.4, size*0.45), (size*0.6, size*0.45), (size*0.65, size*0.7)], fill=(80, 90, 100))
    add_noise(draw, size*0.35, size*0.45, size*0.65, size*0.7, (80,90,100), noise_amount=20, density=0.3)

    # Top statue/rock
    draw.ellipse([size*0.4, size*0.25, size*0.6, size*0.45], fill=(100, 110, 120))
    
    # Glowing magical runes on the fountain
    draw.line([(size*0.45, size*0.55), (size*0.55, size*0.55)], fill=(100, 255, 255), width=2)
    draw.line([(size*0.5, size*0.5), (size*0.5, size*0.6)], fill=(100, 255, 255), width=2)

    # Huge array of bubbles
    for i in range(40):
        bx = random.randint(int(size*0.3), int(size*0.7))
        by = random.randint(0, int(size*0.8))
        br = random.randint(2, 6)
        draw.ellipse([bx-br, by-br, bx+br, by+br], fill=(200, 240, 255, 180), outline=(255, 255, 255, 220))

def draw_coral_garden(draw, size):
    # Rich seabed
    draw.ellipse([-size*0.2, size*0.6, size*1.2, size*1.2], fill=(45, 35, 25))
    add_noise(draw, 0, size*0.6, size, size, (50, 40, 30), noise_amount=30, density=0.5)

    # Various Corals
    # Purple branched
    for _ in range(30):
        x = random.randint(int(size*0.1), int(size*0.9))
        y_end = random.randint(int(size*0.2), int(size*0.7))
        y_start = random.randint(int(size*0.7), int(size*0.9))
        w = random.randint(2, 5)
        draw.line([(x, y_start), (x + random.randint(-15, 15), y_end)], fill=(180, 50, 200), width=w)

    # Neon green anemone
    for _ in range(50):
        x = random.randint(int(size*0.2), int(size*0.4))
        y = random.randint(int(size*0.6), int(size*0.8))
        x_end = x + random.randint(-10, 10)
        y_end = y - random.randint(10, 25)
        draw.line([(x,y), (x_end, y_end)], fill=(50, 250, 120), width=2)

    # Orange Brain Coral
    draw.ellipse([size*0.5, size*0.7, size*0.8, size*0.95], fill=(250, 100, 40))
    for _ in range(30):
        cx = random.randint(int(size*0.55), int(size*0.75))
        cy = random.randint(int(size*0.75), int(size*0.9))
        draw.ellipse([cx, cy, cx+8, cy+8], fill=(200, 50, 20))

    # Starfish
    points = [(size*0.8, size*0.85), (size*0.85, size*0.75), (size*0.9, size*0.85), (size*0.95, size*0.9), (size*0.85, size*0.95), (size*0.75, size*0.9)]
    draw.polygon(points, fill=(255, 180, 50), outline=(230, 100, 20))

def draw_kelp_arch(draw, size):
    # Deep water tint
    for y in range(size):
        draw.line([(0,y), (size,y)], fill=(10, random.randint(50, 70), random.randint(50, 70), 80))

    # Kelp drawing function
    def draw_kelp_stalk(x_base, direction):
        x = x_base
        for y in range(size, 10, -5):
            x += math.sin(y * 0.1) * 3 + direction
            draw.ellipse([x-4, y-4, x+4, y+4], fill=(20, 140, 50))
            if y % 15 == 0:
                leaf_x = x + random.randint(5, 15) * random.choice([-1, 1])
                draw.polygon([(x,y), (x, y-10), (leaf_x, y-5)], fill=(40, 180, 80))

    # Draw multiple stalks forming an arch
    for i in range(5):
        draw_kelp_stalk(size*0.1 + i*5, 0.5 + i*0.1)
        draw_kelp_stalk(size*0.9 - i*5, -0.5 - i*0.1)

    # Top bridge/arch of kelp
    for x in range(int(size*0.2), int(size*0.8), 8):
        y = int(20 + math.sin(x*0.1)*10)
        draw.ellipse([x-6, y-6, x+6, y+6], fill=(30, 160, 60))
        draw.polygon([(x,y), (x+10, y-15), (x-5, y-10)], fill=(50, 200, 90))

    # Silhouette fish passing through
    draw.polygon([(size*0.4, size*0.5), (size*0.5, size*0.45), (size*0.5, size*0.55)], fill=(10, 20, 30))
    draw.ellipse([size*0.45, size*0.46, size*0.6, size*0.54], fill=(10, 20, 30))

def draw_moon_rocks(draw, size):
    # Ethereal glow background
    for r in range(size, 0, -2):
        c = int(50 * (r/size))
        draw.ellipse([size//2-r, size//2-r, size//2+r, size//2+r], fill=(c, c, int(c*1.5), 50))

    # Main structure - glowing alien rocks
    rocks = [
        (size*0.2, size*0.4, size*0.5, size*0.9, (100, 110, 150)),
        (size*0.4, size*0.3, size*0.8, size*0.8, (120, 130, 170)),
        (size*0.1, size*0.6, size*0.9, size*0.95, (80, 90, 120))
    ]
    for rx1, ry1, rx2, ry2, col in rocks:
        draw.ellipse([rx1, ry1, rx2, ry2], fill=col)
        # Craters
        for _ in range(5):
            cx = random.randint(int(rx1+10), int(rx2-10))
            cy = random.randint(int(ry1+10), int(ry2-10))
            cr = random.randint(4, 12)
            draw.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], fill=(col[0]-30, col[1]-30, col[2]-30))
            draw.ellipse([cx-cr+1, cy-cr+1, cx+cr, cy+cr], fill=(col[0]-15, col[1]-15, col[2]-15))

    # Glowing moon crystals
    for _ in range(8):
        cx = random.randint(int(size*0.2), int(size*0.8))
        cy = random.randint(int(size*0.3), int(size*0.8))
        draw.polygon([(cx, cy-15), (cx-5, cy), (cx, cy+15), (cx+5, cy)], fill=(180, 255, 255))
        draw.polygon([(cx, cy-10), (cx-2, cy), (cx, cy+10), (cx+2, cy)], fill=(255, 255, 255))

def draw_shell_bed(draw, size):
    # Rich sand floor
    draw_gradient_rect(draw, 0, size*0.6, size, size, (210, 180, 120), (160, 130, 80))
    add_noise(draw, 0, size*0.6, size, size, (180, 150, 100), noise_amount=20, density=0.4)

    # Back shell
    draw.polygon([(size*0.2, size*0.6), (size*0.1, size*0.2), (size*0.5, size*0.3), (size*0.9, size*0.2), (size*0.8, size*0.6)], fill=(255, 200, 200), outline=(200, 100, 100))
    # Shell ridges
    for i in range(1, 9):
        x = size*0.1 * i
        draw.line([(size*0.5, size*0.6), (x, size*0.25)], fill=(220, 150, 150), width=2)
        
    # Glow for pearl
    for r in range(20, 0, -2):
        draw.ellipse([size*0.5-r, size*0.55-r, size*0.5+r, size*0.55+r], fill=(255, 255, 255, int(150*(1-r/20))))

    # Huge Pearl
    draw.ellipse([size*0.35, size*0.4, size*0.65, size*0.7], fill=(250, 245, 255))
    draw.ellipse([size*0.4, size*0.45, size*0.5, size*0.55], fill=(255, 255, 255)) # highlight

    # Front shell
    draw.polygon([(size*0.2, size*0.6), (size*0.1, size*0.8), (size*0.5, size*0.9), (size*0.9, size*0.8), (size*0.8, size*0.6)], fill=(255, 220, 220), outline=(200, 100, 100))
    for i in range(1, 9):
        x = size*0.1 * i
        draw.line([(size*0.5, size*0.6), (x, size*0.85)], fill=(220, 180, 180), width=2)

def draw_treasure_castle(draw, size):
    # Background piles of gold
    draw.ellipse([size*0.1, size*0.7, size*0.9, size*0.95], fill=(200, 150, 20))
    add_noise(draw, size*0.1, size*0.7, size*0.9, size*0.95, (255, 215, 0), noise_amount=50, density=0.8)

    # Castle Main Body
    draw.rectangle([size*0.3, size*0.4, size*0.7, size*0.8], fill=(220, 200, 160), outline=(150, 130, 100))
    # Castle Bricks
    for y in range(int(size*0.4), int(size*0.8), 8):
        for x in range(int(size*0.3), int(size*0.7), 12):
            draw.rectangle([x, y, x+12, y+8], outline=(180, 160, 120))
            
    # Castle Towers
    for tx in [size*0.2, size*0.65]:
        draw.rectangle([tx, size*0.2, tx+size*0.15, size*0.8], fill=(210, 190, 150), outline=(150, 130, 100))
        draw.polygon([(tx-size*0.05, size*0.2), (tx+size*0.075, size*0.05), (tx+size*0.2, size*0.2)], fill=(250, 80, 80), outline=(150, 40, 40))
        # Windows
        draw.ellipse([tx+size*0.02, size*0.3, tx+size*0.12, size*0.45], fill=(30, 40, 60))

    # Majestic Door
    draw.ellipse([size*0.4, size*0.6, size*0.6, size*0.8], fill=(80, 50, 30))
    draw.rectangle([size*0.4, size*0.7, size*0.6, size*0.8], fill=(80, 50, 30))
    # Door trim
    draw.ellipse([size*0.38, size*0.58, size*0.62, size*0.8], outline=(255, 215, 0), width=2)
    
    # Sparkles
    for _ in range(15):
        sx = random.randint(int(size*0.1), int(size*0.9))
        sy = random.randint(int(size*0.6), int(size*0.9))
        draw.line([(sx-4, sy), (sx+4, sy)], fill=(255, 255, 255), width=1)
        draw.line([(sx, sy-4), (sx, sy+4)], fill=(255, 255, 255), width=1)

def draw_fish(draw, size):
    # A beautiful, dynamic legendary neon fish
    c_main = (0, 255, 180)
    c_sec = (255, 0, 120)
    
    # Glowing aura
    for r in range(25, 0, -2):
        draw.ellipse([size*0.2-r, size*0.3-r, size*0.8+r, size*0.7+r], fill=(0, 255, 180, int(50*(1-r/25))))

    # Flowing fins (neon pink)
    draw.polygon([(size*0.5, size*0.2), (size*0.3, size*0.05), (size*0.6, size*0.15), (size*0.8, size*0.3)], fill=c_sec)
    draw.polygon([(size*0.4, size*0.7), (size*0.3, size*0.9), (size*0.6, size*0.85), (size*0.8, size*0.6)], fill=c_sec)
    
    # Majestic Tail
    draw.polygon([(size*0.2, size*0.5), (size*0.05, size*0.2), (size*0.1, size*0.5), (size*0.05, size*0.8)], fill=c_sec)
    draw.polygon([(size*0.15, size*0.5), (0, size*0.3), (0, size*0.7)], fill=(255, 150, 200))

    # Body stream-lined
    draw.ellipse([size*0.15, size*0.3, size*0.85, size*0.7], fill=c_main)
    # Scales pattern (overlapping arcs)
    for x in range(int(size*0.3), int(size*0.7), 6):
        for y in range(int(size*0.35), int(size*0.65), 6):
            if (x-size*0.5)**2 / (size*0.35)**2 + (y-size*0.5)**2 / (size*0.2)**2 < 1:
                draw.line([(x,y), (x+5, y+3), (x, y+6)], fill=(0, 200, 150), width=1)

    # Face details
    draw.ellipse([size*0.65, size*0.4, size*0.8, size*0.6], fill=(50, 255, 200))
    # Big anime eye
    draw.ellipse([size*0.7, size*0.42, size*0.78, size*0.52], fill=(255, 255, 255))
    draw.ellipse([size*0.73, size*0.44, size*0.77, size*0.5], fill=(0, 0, 50))
    draw.ellipse([size*0.75, size*0.45, size*0.77, size*0.47], fill=(255, 255, 255)) # catchlight
    
    # Cheek blush
    draw.ellipse([size*0.65, size*0.52, size*0.72, size*0.58], fill=(255, 100, 150, 150))

def draw_background_topdown(draw, size):
    # Deep water to shallow water gradient
    draw_gradient_rect(draw, 0, 0, size, size, (10, 50, 120), (40, 150, 220))
    
    # Caustics / light patterns
    for _ in range(40):
        # Draw wavy network of lines
        cx = random.randint(0, size)
        cy = random.randint(0, size)
        for _ in range(3):
            nx = cx + random.randint(-20, 20)
            ny = cy + random.randint(-20, 20)
            draw.line([(cx, cy), (nx, ny)], fill=(150, 220, 255, 80), width=random.randint(1, 3))
            cx, cy = nx, ny
            
    # Surface ripples
    for _ in range(25):
        wx = random.randint(0, size)
        wy = random.randint(0, size)
        ww = random.randint(10, 40)
        wh = random.randint(5, 15)
        draw.ellipse([wx, wy, wx+ww, wy+wh], outline=(255, 255, 255, 120), width=2)
        
    # Floating leaves/lilypads for topdown scale
    for _ in range(5):
        lx = random.randint(0, size)
        ly = random.randint(0, size)
        draw.ellipse([lx, ly, lx+15, ly+15], fill=(50, 180, 80))
        draw.polygon([(lx+7, ly+7), (lx+15, ly+5), (lx+15, ly+10)], fill=(40, 150, 220)) # cutout

def draw_bg_treasure_island(draw, w, h):
    # Spectacular Sunset Gradient
    draw_gradient_rect(draw, 0, 0, w, h*0.5, (40, 20, 80), (250, 100, 50))
    draw_gradient_rect(draw, 0, h*0.5, w, h, (250, 100, 50), (255, 220, 100))
    
    # Huge Sun
    draw.ellipse([w*0.3, h*0.2, w*0.7, h*0.6], fill=(255, 240, 150))
    for r in range(0, int(w*0.3), 10):
        draw.ellipse([w*0.5-r, h*0.4-r, w*0.5+r, h*0.4+r], outline=(255, 255, 255, max(0, 100-r)), width=2)

    # Majestic Mountains in back
    draw.polygon([(0, h*0.7), (w*0.2, h*0.4), (w*0.5, h*0.7)], fill=(80, 40, 60))
    draw.polygon([(w*0.3, h*0.7), (w*0.6, h*0.3), (w, h*0.7)], fill=(60, 30, 50))
    
    # Beautiful Ocean
    water_horizon = h*0.65
    draw_gradient_rect(draw, 0, water_horizon, w, h*0.85, (20, 80, 150), (40, 180, 200))
    # Sun reflection on water
    for y in range(int(water_horizon), int(h*0.85), 5):
        rw = random.randint(50, 150)
        draw.line([(w*0.5 - rw, y), (w*0.5 + rw, y)], fill=(255, 220, 100, 200), width=3)
        
    # Rich Sandy Beach foreground
    beach_start = h*0.8
    draw.polygon([(0, beach_start), (w, h*0.75), (w, h), (0, h)], fill=(240, 210, 150))
    draw.polygon([(0, beach_start+20), (w, h*0.8), (w, h), (0, h)], fill=(220, 190, 130))
    add_noise(draw, 0, beach_start, w, h, (200, 170, 110), noise_amount=30, density=0.5)

    # Detailed Palm Trees Silhouette
    def draw_palm(px, py, scale):
        # Trunk
        draw.polygon([(px-5*scale, py), (px-2*scale, py-80*scale), (px+2*scale, py-80*scale), (px+5*scale, py)], fill=(20, 10, 15))
        # Leaves
        for ang in range(0, 360, 45):
            rad = math.radians(ang)
            ex = px + math.cos(rad)*60*scale
            ey = py-80*scale + math.sin(rad)*40*scale
            draw.polygon([(px, py-80*scale), (ex, ey), (px+math.cos(rad+0.2)*40*scale, py-80*scale+math.sin(rad+0.2)*30*scale)], fill=(15, 25, 20))

    draw_palm(w*0.15, h*0.9, 1.5)
    draw_palm(w*0.85, h*0.95, 2.0)
    draw_palm(w*0.05, h*0.85, 1.0)
    
    # Treasure Chest on the beach
    cx, cy = w*0.35, h*0.9
    draw.rectangle([cx, cy, cx+80, cy+50], fill=(120, 60, 20))
    draw.ellipse([cx, cy-20, cx+80, cy+20], fill=(130, 70, 30))
    # Gold spillage
    draw.ellipse([cx-20, cy+40, cx+100, cy+70], fill=(255, 215, 0))
    add_noise(draw, cx-20, cy+40, cx+100, cy+70, (255,255,0), noise_amount=50, density=0.7)
    
    # Pirate Ship Silhouette far away
    draw.polygon([(w*0.7, h*0.62), (w*0.75, h*0.65), (w*0.8, h*0.62)], fill=(20, 20, 30))
    draw.rectangle([w*0.74, h*0.55, w*0.76, h*0.62], fill=(20, 20, 30))
    draw.polygon([(w*0.75, h*0.55), (w*0.78, h*0.58), (w*0.75, h*0.62)], fill=(10, 10, 15))

def generate_sprite(filename, draw_func, is_bg=False):
    if is_bg:
        # We draw at 720x1280 directly with high quality procedural generation
        final_w, final_h = 720, 1280
        img = Image.new("RGBA", (final_w, final_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img, 'RGBA')
        draw_func(draw, final_w, final_h)
        # Apply a tiny bit of sharpen filter to make the pixels pop
        img = img.filter(ImageFilter.SHARPEN)
        final_img = img
    else:
        # Draw natively at 128x128 for these
        base_size = 128
        img = Image.new("RGBA", (base_size, base_size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img, 'RGBA')
        draw_func(draw, base_size)
        final_img = img

    filepath = os.path.join(OUT_DIR, filename)
    # Convert to indexed color with 32 colors to save massive amount of space and adhere to pixel art style
    final_img = final_img.convert('P', palette=Image.ADAPTIVE, colors=32)
    final_img.save(filepath, optimize=True)
    print(f"Generated {filename} ({final_img.size[0]}x{final_img.size[1]}) - Size: {os.path.getsize(filepath)/1024:.1f} KB")

if __name__ == "__main__":
    generate_sprite("decor_bubble_fountain.png", draw_bubble_fountain)
    generate_sprite("decor_coral_garden.png", draw_coral_garden)
    generate_sprite("decor_kelp_arch.png", draw_kelp_arch)
    generate_sprite("decor_moon_rocks.png", draw_moon_rocks)
    generate_sprite("decor_shell_bed.png", draw_shell_bed)
    generate_sprite("decor_treasure_castle.png", draw_treasure_castle)
    generate_sprite("fish.png", draw_fish)
    generate_sprite("background_topdown.png", draw_background_topdown)
    generate_sprite("bg_treasure_island.png", draw_bg_treasure_island, is_bg=True)
