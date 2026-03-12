from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "images"

OUTLINE = (37, 32, 48, 255)
SHADOW = (26, 37, 67, 185)
SAND_LIGHT = (232, 210, 164, 255)
SAND_DARK = (198, 168, 120, 255)
STONE_DARK = (86, 95, 125, 255)
STONE_MID = (122, 132, 168, 255)
STONE_LIGHT = (168, 179, 214, 255)
SEAWEED_DARK = (54, 108, 86, 255)
SEAWEED_LIGHT = (104, 182, 136, 255)
BUBBLE = (211, 244, 255, 255)


def canvas(width=64, height=64, fill=(0, 0, 0, 0)):
    return Image.new("RGBA", (width, height), fill)


def save_scaled(img, filename, size=(128, 128), compress_level=0):
    out = img if img.size == size else img.resize(size, Image.Resampling.NEAREST)
    out.save(ASSET_DIR / filename, compress_level=compress_level)
    size_bytes = (ASSET_DIR / filename).stat().st_size
    print(f"[done] {filename} ({size_bytes} bytes)")


def add_shadow(draw, box, color=SHADOW):
    draw.ellipse(box, fill=color)


def add_sand_patch(draw, x1, y1, x2, y2):
    add_shadow(draw, (x1 - 3, y2 - 1, x2 + 3, y2 + 7))
    draw.ellipse((x1, y1 + 2, x2, y2 + 4), fill=SAND_DARK)
    draw.ellipse((x1 + 1, y1, x2 - 1, y2 + 1), fill=SAND_LIGHT)
    for px, py in [(x1 + 6, y1 + 8), (x1 + 14, y1 + 11), (x2 - 12, y1 + 9), (x2 - 6, y1 + 14)]:
        draw.rectangle((px, py, px + 1, py + 1), fill=(255, 240, 200, 255))


def add_outline_polygon(draw, points, fill, outline=OUTLINE):
    draw.polygon(points, fill=outline)
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    cx = sum(xs) / len(xs)
    cy = sum(ys) / len(ys)
    inner = []
    for x, y in points:
        nx = x + (1 if x < cx else -1 if x > cx else 0)
        ny = y + (1 if y < cy else -1 if y > cy else 0)
        inner.append((nx, ny))
    draw.polygon(inner, fill=fill)


def add_outline_ellipse(draw, box, fill, outline=OUTLINE):
    draw.ellipse(box, fill=outline)
    x1, y1, x2, y2 = box
    draw.ellipse((x1 + 1, y1 + 1, x2 - 1, y2 - 1), fill=fill)


def add_outline_rect(draw, box, fill, outline=OUTLINE):
    draw.rectangle(box, fill=outline)
    x1, y1, x2, y2 = box
    draw.rectangle((x1 + 1, y1 + 1, x2 - 1, y2 - 1), fill=fill)


def add_bubbles(draw, centers):
    for x, y, r in centers:
        add_outline_ellipse(draw, (x - r, y - r, x + r, y + r), (220, 247, 255, 130), outline=(244, 252, 255, 220))


def add_sparkle(draw, x, y, main=(255, 245, 196, 255)):
    draw.line((x, y - 2, x, y + 2), fill=main, width=1)
    draw.line((x - 2, y, x + 2, y), fill=main, width=1)
    draw.point((x, y), fill=(255, 255, 255, 255))


def add_pebbles(draw, positions, colors=None):
    palette = colors or [(168, 150, 116, 255), (139, 122, 96, 255), (207, 191, 153, 255)]
    for index, (x, y) in enumerate(positions):
        color = palette[index % len(palette)]
        draw.ellipse((x, y, x + 3, y + 2), fill=color)


def add_seaweed(draw, x, base_y, height, sway, body, shade):
    stalk = [
        (x, base_y),
        (x - 2, base_y - height * 0.35),
        (x + sway, base_y - height * 0.65),
        (x + sway - 1, base_y - height),
        (x + 3, base_y - height * 0.6),
        (x + 2, base_y),
    ]
    add_outline_polygon(draw, [(int(px), int(py)) for px, py in stalk], body)
    draw.line((x + 1, base_y - 1, x + sway - 1, base_y - int(height * 0.82)), fill=shade, width=1)


def add_starfish(draw, x, y, body=(249, 183, 94, 255), shade=(218, 144, 72, 255)):
    points = [(x, y - 4), (x + 2, y - 1), (x + 6, y - 1), (x + 3, y + 1), (x + 5, y + 5),
              (x, y + 2), (x - 5, y + 5), (x - 3, y + 1), (x - 6, y - 1), (x - 2, y - 1)]
    add_outline_polygon(draw, points, body)
    draw.line((x - 1, y + 1, x + 2, y - 2), fill=shade, width=1)


def add_shell(draw, x, y, fill=(243, 227, 200, 255), shade=(210, 189, 160, 255)):
    add_outline_polygon(draw, [(x - 6, y + 4), (x, y - 6), (x + 6, y + 4), (x + 4, y + 8), (x - 4, y + 8)], fill)
    for offset in (-3, 0, 3):
        draw.line((x + offset, y - 1, x + offset, y + 7), fill=shade, width=1)


def add_coral_branch(draw, x, y, color, shade):
    branches = [
        [(x - 4, y + 12), (x - 5, y + 6), (x - 8, y + 2), (x - 6, y - 2), (x - 2, y + 1), (x - 2, y - 4), (x + 2, y - 2), (x + 1, y + 3), (x + 4, y + 7), (x + 3, y + 12)],
        [(x + 5, y + 12), (x + 4, y + 5), (x + 7, y + 1), (x + 6, y - 4), (x + 10, y - 1), (x + 10, y - 7), (x + 14, y - 4), (x + 12, y + 3), (x + 14, y + 8), (x + 12, y + 12)],
    ]
    for branch in branches:
        add_outline_polygon(draw, branch, color)
    draw.line((x - 1, y + 8, x + 1, y + 1), fill=shade, width=1)
    draw.line((x + 8, y + 9, x + 10, y + 1), fill=shade, width=1)


def add_fan_coral(draw, x, y, width, height, fill, shade):
    points = [(x, y + height), (x - width, y + 5), (x - width + 5, y - height), (x + width - 3, y - height + 4), (x + width, y + 7)]
    add_outline_polygon(draw, points, fill)
    for dx in range(-width + 6, width - 3, 4):
        draw.line((x, y + height - 1, x + dx, y - height + 6), fill=shade, width=1)


def draw_fish_icon():
    img = canvas()
    draw = ImageDraw.Draw(img)
    add_shadow(draw, (12, 49, 53, 58))
    body = [(18, 34), (24, 25), (38, 22), (49, 27), (54, 34), (48, 41), (37, 44), (24, 42)]
    tail = [(14, 33), (6, 24), (5, 44)]
    fin = [(31, 22), (36, 15), (42, 22)]
    belly = [(28, 41), (35, 48), (41, 40)]
    add_outline_polygon(draw, tail, (73, 133, 194, 255))
    add_outline_polygon(draw, body, (106, 182, 224, 255))
    add_outline_polygon(draw, fin, (90, 152, 214, 255))
    add_outline_polygon(draw, belly, (236, 246, 255, 255))
    draw.line((22, 33, 47, 30), fill=(63, 118, 176, 255), width=1)
    draw.line((20, 37, 45, 38), fill=(61, 114, 170, 255), width=1)
    add_outline_ellipse(draw, (42, 28, 48, 34), (246, 250, 255, 255))
    draw.ellipse((45, 30, 47, 32), fill=OUTLINE)
    add_sparkle(draw, 14, 18)
    add_sparkle(draw, 52, 18)
    save_scaled(img, "fish.png", compress_level=0)


def draw_background_topdown():
    img = canvas()
    draw = ImageDraw.Draw(img)
    for y in range(64):
        ratio = y / 63
        color = (
            int(48 + 24 * ratio),
            int(147 + 42 * ratio),
            int(208 + 22 * ratio),
            255
        )
        draw.line((0, y, 63, y), fill=color)
    for y in range(7, 64, 9):
        for x in range(-4, 72, 12):
            draw.arc((x, y, x + 10, y + 4), 180, 360, fill=(176, 236, 255, 255), width=1)
    for x, y, r in [(12, 12, 7), (45, 20, 9), (18, 39, 6), (50, 47, 5)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(185, 236, 245, 55))
        draw.arc((x - r, y - r, x + r, y + r), 0, 360, fill=(210, 245, 252, 255), width=1)
    lily = [(48, 6), (58, 7), (60, 14), (53, 17), (46, 13)]
    add_outline_polygon(draw, lily, (95, 176, 107, 255))
    draw.line((47, 11, 58, 9), fill=(144, 215, 132, 255), width=1)
    add_outline_ellipse(draw, (21, 22, 28, 29), (255, 203, 122, 255))
    add_starfish(draw, 12, 51, body=(245, 176, 93, 255), shade=(204, 138, 72, 255))
    save_scaled(img, "background_topdown.png", compress_level=0)


def draw_coral_garden():
    img = canvas()
    draw = ImageDraw.Draw(img)
    add_sand_patch(draw, 7, 44, 57, 53)
    add_fan_coral(draw, 24, 31, 10, 12, (229, 135, 120, 255), (190, 96, 87, 255))
    add_coral_branch(draw, 26, 25, (255, 141, 165, 255), (220, 98, 131, 255))
    add_coral_branch(draw, 35, 23, (119, 227, 206, 255), (79, 175, 153, 255))
    add_coral_branch(draw, 18, 26, (247, 189, 102, 255), (216, 146, 72, 255))
    add_seaweed(draw, 12, 50, 12, -2, SEAWEED_LIGHT, SEAWEED_DARK)
    add_seaweed(draw, 49, 50, 14, 2, SEAWEED_LIGHT, SEAWEED_DARK)
    add_bubbles(draw, [(44, 16, 2), (47, 11, 3), (52, 7, 2)])
    add_pebbles(draw, [(16, 50), (20, 48), (39, 49), (46, 51)])
    add_sparkle(draw, 35, 18)
    add_sparkle(draw, 19, 14, main=(255, 215, 168, 255))
    save_scaled(img, "decor_coral_garden.png", compress_level=0)


def draw_bubble_fountain():
    img = canvas()
    draw = ImageDraw.Draw(img)
    add_shadow(draw, (10, 50, 55, 59))
    add_outline_ellipse(draw, (12, 45, 53, 55), (108, 122, 154, 255))
    add_outline_polygon(draw, [(18, 45), (24, 33), (31, 29), (36, 34), (38, 45)], STONE_MID)
    add_outline_polygon(draw, [(30, 45), (36, 25), (44, 21), (50, 28), (52, 45)], STONE_LIGHT)
    add_outline_rect(draw, (27, 19, 37, 42), (83, 164, 176, 255))
    add_outline_ellipse(draw, (23, 16, 41, 23), (191, 225, 217, 255))
    add_outline_ellipse(draw, (28, 11, 36, 18), (215, 242, 252, 255))
    add_bubbles(draw, [(31, 12, 3), (26, 7, 2), (39, 7, 4), (28, 2, 2), (36, 1, 3)])
    add_seaweed(draw, 15, 49, 10, -1, SEAWEED_LIGHT, SEAWEED_DARK)
    add_seaweed(draw, 46, 49, 12, 1, SEAWEED_LIGHT, SEAWEED_DARK)
    add_pebbles(draw, [(18, 50), (22, 48), (44, 49), (49, 51)], colors=[(145, 145, 167, 255), (180, 189, 210, 255)])
    add_sparkle(draw, 42, 15)
    save_scaled(img, "decor_bubble_fountain.png", compress_level=0)


def draw_kelp_arch():
    img = canvas()
    draw = ImageDraw.Draw(img)
    add_sand_patch(draw, 8, 44, 56, 53)
    add_seaweed(draw, 17, 49, 24, 7, (109, 184, 138, 255), (65, 119, 92, 255))
    add_seaweed(draw, 24, 49, 28, 10, (95, 170, 129, 255), (59, 106, 83, 255))
    add_seaweed(draw, 33, 49, 27, 8, (116, 191, 141, 255), (72, 123, 95, 255))
    add_seaweed(draw, 42, 49, 22, -5, (102, 176, 133, 255), (64, 112, 86, 255))
    add_outline_ellipse(draw, (8, 44, 20, 53), STONE_DARK)
    add_outline_ellipse(draw, (39, 44, 54, 54), STONE_MID)
    add_starfish(draw, 50, 47)
    add_shell(draw, 13, 47, fill=(244, 224, 196, 255), shade=(205, 183, 154, 255))
    add_bubbles(draw, [(31, 14, 2), (36, 11, 3), (38, 6, 2)])
    save_scaled(img, "decor_kelp_arch.png", compress_level=0)


def draw_moon_rocks():
    img = canvas()
    draw = ImageDraw.Draw(img)
    add_shadow(draw, (8, 50, 56, 59))
    add_outline_ellipse(draw, (11, 37, 27, 53), STONE_DARK)
    add_outline_ellipse(draw, (23, 32, 42, 54), STONE_LIGHT)
    add_outline_ellipse(draw, (39, 36, 55, 53), STONE_MID)
    for box in [(14, 41, 18, 45), (27, 38, 31, 42), (33, 45, 37, 49), (44, 40, 48, 44)]:
        draw.ellipse(box, fill=(134, 145, 177, 255))
    add_outline_ellipse(draw, (28, 17, 40, 29), (208, 234, 255, 255))
    draw.ellipse((31, 20, 37, 26), fill=(246, 250, 255, 255))
    draw.ellipse((24, 22, 45, 40), fill=(172, 224, 255, 76))
    add_seaweed(draw, 15, 51, 10, -1, SEAWEED_LIGHT, SEAWEED_DARK)
    add_seaweed(draw, 48, 51, 11, 2, SEAWEED_LIGHT, SEAWEED_DARK)
    add_pebbles(draw, [(18, 50), (23, 49), (42, 50), (47, 52)], colors=[(136, 149, 174, 255), (181, 194, 221, 255)])
    add_sparkle(draw, 43, 21)
    save_scaled(img, "decor_moon_rocks.png", compress_level=0)


def draw_shell_bed():
    img = canvas()
    draw = ImageDraw.Draw(img)
    add_sand_patch(draw, 8, 44, 56, 53)
    add_outline_polygon(draw, [(14, 46), (22, 31), (31, 46), (27, 51), (17, 51)], (243, 227, 203, 255))
    add_outline_polygon(draw, [(32, 46), (42, 27), (54, 46), (48, 52), (36, 52)], (251, 240, 226, 255))
    for x in (18, 21, 24, 36, 40, 44, 48):
        draw.line((x, 38, x, 50), fill=(210, 189, 162, 255), width=1)
    add_outline_ellipse(draw, (24, 36, 30, 42), (251, 239, 248, 255))
    add_outline_ellipse(draw, (42, 33, 48, 39), (255, 242, 250, 255))
    add_starfish(draw, 51, 48, body=(255, 170, 118, 255), shade=(215, 132, 88, 255))
    add_shell(draw, 12, 49, fill=(236, 210, 182, 255), shade=(197, 171, 145, 255))
    add_pebbles(draw, [(17, 50), (29, 50), (39, 49), (47, 50)])
    add_sparkle(draw, 34, 24)
    save_scaled(img, "decor_shell_bed.png", compress_level=0)


def draw_treasure_castle():
    img = canvas()
    draw = ImageDraw.Draw(img)
    add_sand_patch(draw, 7, 43, 57, 52)
    wall = (174, 136, 101, 255)
    roof = (208, 112, 81, 255)
    add_outline_rect(draw, (14, 27, 26, 46), wall)
    add_outline_polygon(draw, [(14, 28), (20, 18), (26, 28)], roof)
    add_outline_rect(draw, (24, 21, 44, 46), wall)
    add_outline_polygon(draw, [(24, 22), (34, 10), (44, 22)], roof)
    add_outline_rect(draw, (42, 29, 53, 46), wall)
    add_outline_polygon(draw, [(42, 30), (47, 21), (53, 30)], roof)
    add_outline_rect(draw, (30, 31, 37, 46), (123, 88, 62, 255))
    add_outline_rect(draw, (31, 26, 36, 31), (123, 174, 199, 255))
    add_outline_rect(draw, (18, 34, 22, 39), (123, 174, 199, 255))
    add_outline_rect(draw, (46, 34, 50, 39), (123, 174, 199, 255))
    draw.line((17, 46, 20, 50), fill=(92, 150, 111, 255), width=1)
    draw.line((49, 46, 52, 50), fill=(92, 150, 111, 255), width=1)
    add_outline_rect(draw, (8, 38, 16, 45), (151, 102, 58, 255))
    add_outline_rect(draw, (9, 39, 15, 44), (204, 146, 84, 255))
    draw.rectangle((10, 40, 14, 41), fill=(239, 200, 94, 255))
    draw.rectangle((12, 42, 14, 43), fill=(255, 226, 129, 255))
    add_pebbles(draw, [(13, 50), (23, 49), (42, 49), (50, 50)])
    add_sparkle(draw, 12, 37)
    add_sparkle(draw, 48, 24)
    save_scaled(img, "decor_treasure_castle.png", compress_level=0)


def draw_treasure_background():
    base = canvas(180, 320)
    draw = ImageDraw.Draw(base)

    sky_colors = [(159, 216, 249, 255), (178, 227, 248, 255), (201, 237, 250, 255)]
    for y in range(120):
        band = y // 40
        draw.line((0, y, 179, y), fill=sky_colors[min(band, len(sky_colors) - 1)])
    for y in range(120, 320):
        ratio = (y - 120) / 199
        color = (
            int(76 - 32 * ratio),
            int(188 - 86 * ratio),
            int(232 - 104 * ratio),
            255
        )
        draw.line((0, y, 179, y), fill=color)

    draw.ellipse((118, 18, 152, 52), fill=(253, 235, 164, 255))
    for box in [(8, 18, 36, 34), (22, 15, 56, 32), (138, 28, 166, 42), (150, 24, 178, 40)]:
        draw.ellipse(box, fill=(246, 250, 255, 235))
    draw.arc((70, 24, 84, 30), 200, 340, fill=(93, 109, 131, 255), width=1)
    draw.arc((80, 22, 96, 30), 200, 340, fill=(93, 109, 131, 255), width=1)

    island_back = [(10, 95), (28, 84), (54, 78), (90, 80), (120, 76), (148, 84), (170, 97), (170, 111), (10, 111)]
    island_front = [(18, 97), (42, 88), (76, 86), (103, 88), (126, 84), (150, 90), (162, 98), (162, 106), (18, 106)]
    draw.polygon(island_back, fill=(214, 186, 124, 255))
    draw.polygon(island_front, fill=(239, 216, 160, 255))
    for x in range(12, 170, 10):
        draw.arc((x, 98, x + 10, 110), 180, 360, fill=(249, 244, 218, 255), width=1)

    palms = [(45, 87, 22), (68, 84, 27), (102, 82, 18), (131, 88, 15)]
    for trunk_x, base_y, trunk_h in palms:
        draw.line((trunk_x, base_y, trunk_x - 4, base_y - trunk_h), fill=(124, 84, 51, 255), width=3)
        tip_y = base_y - trunk_h
        leaves = [
            [(trunk_x - 14, tip_y + 1), (trunk_x - 1, tip_y - 8), (trunk_x + 12, tip_y + 2), (trunk_x, tip_y + 7)],
            [(trunk_x - 8, tip_y - 2), (trunk_x + 2, tip_y - 10), (trunk_x + 15, tip_y - 1), (trunk_x + 2, tip_y + 6)],
            [(trunk_x - 3, tip_y + 2), (trunk_x + 9, tip_y - 4), (trunk_x + 20, tip_y + 4), (trunk_x + 6, tip_y + 9)],
        ]
        for leaf in leaves:
            add_outline_polygon(draw, leaf, (79, 152, 84, 255), outline=(62, 112, 71, 255))
            draw.line((leaf[0][0] + 3, leaf[0][1] + 1, leaf[2][0] - 2, leaf[2][1] - 1), fill=(120, 192, 120, 255), width=1)

    add_outline_rect(draw, (80, 78, 84, 101), (129, 88, 55, 255))
    add_outline_rect(draw, (95, 78, 99, 101), (129, 88, 55, 255))
    add_outline_rect(draw, (73, 94, 107, 100), (159, 108, 69, 255))
    draw.line((91, 70, 91, 94), fill=(116, 78, 46, 255), width=2)
    draw.polygon([(91, 71), (104, 76), (91, 82)], fill=(214, 78, 64, 255))
    add_outline_rect(draw, (86, 84, 95, 91), (224, 189, 102, 255))

    surface = []
    for x in range(0, 180, 6):
        surface.append((x, 120 + (1 if (x // 6) % 2 == 0 else 3)))
    surface.extend([(179, 320), (0, 320)])
    draw.polygon(surface, fill=(72, 187, 231, 255))
    for x in range(0, 180, 12):
        draw.arc((x, 116, x + 10, 126), 180, 360, fill=(241, 252, 255, 255), width=1)

    for left, right in ((22, 36), (58, 72), (93, 107), (128, 142)):
        draw.polygon([(left, 121), (right, 121), (right - 18, 208), (left - 18, 208)], fill=(188, 236, 249, 255))
        draw.line((left + 3, 123, left - 13, 206), fill=(227, 248, 253, 255), width=1)

    bottle = [(142, 101), (145, 99), (149, 102), (149, 106), (143, 107), (140, 105)]
    add_outline_polygon(draw, bottle, (113, 174, 182, 255), outline=(83, 132, 142, 255))
    draw.line((144, 101, 144, 95), fill=(126, 89, 62, 255), width=1)
    draw.line((140, 106, 149, 104), fill=(237, 250, 255, 255), width=1)

    for band_y, color in [(145, (140, 221, 243, 255)), (193, (109, 196, 226, 255)), (248, (87, 169, 213, 255))]:
        for x in range(-10, 190, 18):
            draw.arc((x, band_y, x + 14, band_y + 8), 180, 360, fill=color, width=1)

    for body, tail in [
        ((24, 151, 46, 165), [(24, 158), (14, 152), (14, 165)]),
        ((53, 169, 76, 181), [(53, 175), (44, 170), (44, 181)]),
        ((118, 148, 142, 162), [(118, 155), (108, 149), (108, 162)]),
        ((136, 203, 164, 220), [(136, 211), (126, 204), (126, 220)]),
    ]:
        draw.ellipse(body, fill=(50, 106, 148, 255))
        draw.polygon(tail, fill=(50, 106, 148, 255))

    for x, y, r in [(24, 128, 2), (42, 147, 3), (64, 177, 2), (116, 136, 2), (134, 158, 3), (152, 184, 2), (106, 238, 2), (36, 248, 3)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(224, 246, 255, 255))
        draw.arc((x - r, y - r, x + r, y + r), 0, 360, fill=(247, 252, 255, 255), width=1)
    for x, y in [(20, 116), (56, 132), (96, 118), (132, 140), (160, 126)]:
        add_sparkle(draw, x, y)

    draw.ellipse((16, 291, 58, 312), fill=(72, 86, 127, 255))
    draw.ellipse((66, 286, 110, 308), fill=(82, 97, 139, 255))
    draw.ellipse((122, 294, 168, 314), fill=(67, 81, 122, 255))
    for stem_x in (24, 31, 138, 146, 154):
        add_seaweed(draw, stem_x, 307, 17, 3, SEAWEED_LIGHT, SEAWEED_DARK)
    add_coral_branch(draw, 83, 273, (242, 126, 118, 255), (213, 94, 90, 255))
    add_coral_branch(draw, 97, 271, (125, 221, 201, 255), (86, 176, 159, 255))
    add_outline_rect(draw, (88, 288, 98, 295), (194, 130, 71, 255))
    draw.rectangle((89, 289, 97, 294), fill=(227, 191, 87, 255))
    draw.rectangle((91, 290, 96, 293), fill=(248, 221, 124, 255))
    add_sparkle(draw, 101, 286)

    save_scaled(base, "bg_treasure_island.png", size=(720, 1280), compress_level=3)


def ensure_size_range(filenames):
    for filename in filenames:
        size = (ASSET_DIR / filename).stat().st_size
        if size < 10_000 or size > 150_000:
            raise RuntimeError(f"{filename} size out of range: {size}")


if __name__ == "__main__":
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    draw_fish_icon()
    draw_background_topdown()
    draw_coral_garden()
    draw_bubble_fountain()
    draw_kelp_arch()
    draw_moon_rocks()
    draw_shell_bed()
    draw_treasure_castle()
    draw_treasure_background()
    ensure_size_range([
        "fish.png",
        "background_topdown.png",
        "decor_coral_garden.png",
        "decor_bubble_fountain.png",
        "decor_kelp_arch.png",
        "decor_moon_rocks.png",
        "decor_shell_bed.png",
        "decor_treasure_castle.png",
        "bg_treasure_island.png",
    ])
