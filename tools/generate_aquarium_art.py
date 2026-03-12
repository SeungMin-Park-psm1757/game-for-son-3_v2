from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "images"

OUTLINE = (42, 34, 53, 255)
SHADOW = (33, 42, 74, 180)
SAND = (212, 190, 142, 255)
SAND_DARK = (175, 151, 108, 255)
WATER_LIGHT = (162, 216, 239, 255)
WATER_MID = (77, 145, 202, 255)
WATER_DEEP = (28, 64, 140, 255)


def upscaled_canvas(width=64, height=64):
    return Image.new("RGBA", (width, height), (0, 0, 0, 0))


def save_upscaled(img, filename, size=(128, 128)):
    out = img.resize(size, Image.Resampling.NEAREST)
    out.save(ASSET_DIR / filename)
    print(f"[done] {filename}")


def add_shadow(draw, box):
    draw.ellipse(box, fill=SHADOW)


def add_outline(draw, shape, coords, fill):
    shape(coords, fill=OUTLINE)
    inset = 1
    if isinstance(coords[0], tuple):
        inner = []
        for x, y in coords:
            inner.append((x - (1 if x > 32 else -1), y - (1 if y > 32 else -1)))
        shape(inner, fill=fill)
    else:
        x1, y1, x2, y2 = coords
        shape((x1 + inset, y1 + inset, x2 - inset, y2 - inset), fill=fill)


def draw_coral_garden():
    img = upscaled_canvas()
    draw = ImageDraw.Draw(img)
    add_shadow(draw, (8, 49, 56, 58))
    draw.ellipse((13, 45, 51, 55), fill=SAND_DARK)
    draw.ellipse((15, 44, 49, 53), fill=SAND)

    coral_colors = [
        ((233, 131, 98, 255), (198, 92, 67, 255)),
        ((252, 117, 170, 255), (208, 84, 135, 255)),
        ((122, 215, 188, 255), (74, 164, 140, 255)),
    ]
    branches = [
        [(18, 44), (18, 29), (15, 25), (17, 18), (21, 20), (21, 15), (25, 17), (24, 22), (27, 27), (25, 44)],
        [(29, 44), (29, 27), (26, 21), (28, 16), (33, 18), (33, 13), (38, 15), (36, 21), (39, 28), (37, 44)],
        [(42, 44), (42, 28), (39, 22), (42, 18), (46, 20), (48, 15), (52, 18), (50, 25), (51, 31), (49, 44)],
    ]
    for coords, colors in zip(branches, coral_colors):
        draw.polygon(coords, fill=OUTLINE)
        fill, shade = colors
        inner = [(x - 1 if x > 32 else x + 1, y) for x, y in coords]
        draw.polygon(inner, fill=fill)
        draw.line((coords[0][0] + 2, 42, coords[-2][0] - 2, 24), fill=shade, width=2)

    draw.polygon([(10, 46), (14, 35), (19, 46)], fill=(76, 136, 104, 255))
    draw.polygon([(48, 46), (52, 34), (56, 46)], fill=(76, 136, 104, 255))
    for px, py in [(22, 27), (34, 18), (45, 23), (30, 30)]:
        draw.rectangle((px, py, px + 1, py + 1), fill=(255, 235, 196, 255))

    save_upscaled(img, "decor_coral_garden.png")


def draw_shell_bed():
    img = upscaled_canvas()
    draw = ImageDraw.Draw(img)
    add_shadow(draw, (8, 50, 56, 58))
    draw.ellipse((12, 45, 52, 56), fill=SAND_DARK)
    draw.ellipse((13, 44, 51, 54), fill=SAND)

    shell_fill = (243, 225, 195, 255)
    shell_shade = (214, 191, 163, 255)
    draw.pieslice((14, 28, 35, 47), 180, 360, fill=OUTLINE)
    draw.pieslice((16, 30, 33, 45), 180, 360, fill=shell_fill)
    for offset in range(18, 31, 3):
        draw.line((offset, 38, offset, 45), fill=shell_shade)

    draw.pieslice((31, 26, 52, 48), 180, 360, fill=OUTLINE)
    draw.pieslice((33, 28, 50, 46), 180, 360, fill=shell_fill)
    for offset in range(35, 48, 3):
        draw.line((offset, 37, offset, 45), fill=shell_shade)

    draw.ellipse((25, 31, 29, 35), fill=(255, 244, 246, 255))
    draw.ellipse((37, 29, 43, 35), fill=(255, 244, 246, 255))
    draw.polygon([(43, 46), (46, 40), (49, 46), (55, 48), (50, 51), (52, 57), (46, 53), (40, 57), (42, 51), (37, 48)], fill=(255, 176, 119, 255))
    draw.polygon([(45, 47), (46, 43), (47, 47), (51, 48), (48, 50), (49, 54), (46, 51), (43, 54), (44, 50), (41, 48)], fill=(255, 207, 129, 255))

    save_upscaled(img, "decor_shell_bed.png")


def draw_bubble_fountain():
    img = upscaled_canvas()
    draw = ImageDraw.Draw(img)
    add_shadow(draw, (8, 49, 56, 58))
    draw.ellipse((11, 44, 53, 54), fill=(92, 112, 145, 255))

    rock = (110, 125, 158, 255)
    rock_shade = (77, 91, 121, 255)
    draw.polygon([(18, 45), (22, 35), (29, 31), (34, 36), (36, 45)], fill=OUTLINE)
    draw.polygon([(20, 43), (23, 36), (29, 33), (32, 37), (34, 43)], fill=rock)
    draw.polygon([(32, 45), (37, 28), (43, 24), (48, 31), (50, 45)], fill=OUTLINE)
    draw.polygon([(34, 43), (38, 30), (43, 26), (46, 32), (48, 43)], fill=rock)
    draw.rectangle((30, 20, 36, 40), fill=OUTLINE)
    draw.rectangle((31, 21, 35, 39), fill=(83, 161, 177, 255))
    draw.line((32, 24, 32, 38), fill=(177, 236, 242, 255))

    for x, y, r in [(33, 16, 3), (27, 11, 2), (39, 10, 4), (25, 22, 4), (41, 20, 3), (33, 5, 5)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(202, 240, 255, 200), outline=(255, 255, 255, 235))
    draw.line((18, 42, 26, 36), fill=rock_shade)
    draw.line((38, 42, 45, 30), fill=rock_shade)

    save_upscaled(img, "decor_bubble_fountain.png")


def draw_treasure_castle():
    img = upscaled_canvas()
    draw = ImageDraw.Draw(img)
    add_shadow(draw, (7, 49, 57, 58))
    draw.ellipse((9, 44, 55, 54), fill=SAND_DARK)
    draw.ellipse((11, 43, 53, 53), fill=SAND)

    wall = (173, 134, 96, 255)
    wall_shade = (128, 93, 67, 255)
    roof = (205, 122, 80, 255)
    draw.rectangle((16, 27, 28, 45), fill=OUTLINE)
    draw.rectangle((18, 29, 26, 43), fill=wall)
    draw.polygon([(17, 29), (22, 20), (27, 29)], fill=OUTLINE)
    draw.polygon([(19, 29), (22, 23), (25, 29)], fill=roof)

    draw.rectangle((27, 21, 44, 45), fill=OUTLINE)
    draw.rectangle((29, 23, 42, 43), fill=wall)
    draw.polygon([(28, 23), (35, 12), (43, 23)], fill=OUTLINE)
    draw.polygon([(30, 23), (35, 15), (41, 23)], fill=roof)
    draw.rectangle((33, 33, 38, 43), fill=wall_shade)
    draw.rectangle((33, 28, 38, 31), fill=(115, 164, 188, 255))
    draw.rectangle((20, 34, 23, 37), fill=(115, 164, 188, 255))

    draw.rectangle((9, 37, 16, 44), fill=OUTLINE)
    draw.rectangle((10, 38, 15, 43), fill=(142, 94, 43, 255))
    draw.line((12, 39, 14, 39), fill=(232, 186, 93, 255))

    save_upscaled(img, "decor_treasure_castle.png")


def draw_kelp_arch():
    img = upscaled_canvas()
    draw = ImageDraw.Draw(img)
    add_shadow(draw, (8, 49, 56, 58))
    draw.ellipse((10, 44, 54, 54), fill=(90, 110, 124, 255))

    kelp_dark = (65, 116, 89, 255)
    kelp_light = (101, 165, 124, 255)
    left = [(18, 46), (16, 39), (17, 31), (20, 24), (24, 20), (28, 17), (30, 20), (27, 25), (23, 31), (22, 40), (24, 46)]
    right = [(46, 46), (48, 39), (47, 31), (44, 24), (40, 20), (36, 17), (34, 20), (37, 25), (41, 31), (42, 40), (40, 46)]
    center = [(29, 46), (28, 40), (30, 33), (32, 27), (33, 21), (35, 17), (38, 18), (37, 23), (35, 29), (34, 37), (34, 46)]
    for coords in (left, right, center):
        draw.polygon(coords, fill=OUTLINE)
    for coords in (left, right, center):
        inner = [(x + (1 if x < 32 else -1), y) for x, y in coords]
        draw.polygon(inner, fill=kelp_light)
        draw.line((inner[0][0], 43, inner[4][0], 22), fill=kelp_dark, width=2)

    draw.polygon([(40, 47), (43, 41), (46, 47), (52, 49), (47, 52), (49, 57), (43, 54), (37, 57), (39, 52), (34, 49)], fill=(240, 169, 91, 255))
    draw.polygon([(42, 48), (43, 44), (44, 48), (48, 49), (45, 51), (46, 54), (43, 52), (40, 54), (41, 51), (38, 49)], fill=(255, 218, 127, 255))

    save_upscaled(img, "decor_kelp_arch.png")


def draw_moon_rocks():
    img = upscaled_canvas()
    draw = ImageDraw.Draw(img)
    add_shadow(draw, (8, 50, 56, 58))
    rock = (117, 126, 156, 255)
    rock_light = (155, 165, 194, 255)
    rock_dark = (85, 93, 120, 255)
    rock_shapes = [
        ((13, 36, 30, 52), rock),
        ((24, 31, 42, 53), rock_light),
        ((38, 35, 53, 52), rock),
    ]
    for box, fill in rock_shapes:
        draw.ellipse(box, fill=OUTLINE)
        x1, y1, x2, y2 = box
        draw.ellipse((x1 + 1, y1 + 1, x2 - 1, y2 - 1), fill=fill)
    draw.line((19, 40, 25, 49), fill=rock_dark, width=2)
    draw.line((31, 35, 35, 49), fill=rock_dark, width=2)
    draw.line((44, 39, 48, 48), fill=rock_dark, width=2)
    draw.ellipse((30, 19, 39, 28), fill=(196, 235, 255, 230), outline=(245, 252, 255, 255))
    draw.ellipse((24, 24, 45, 40), fill=(175, 227, 255, 70))

    save_upscaled(img, "decor_moon_rocks.png")


def generate_treasure_background():
    base = Image.new("RGBA", (180, 320), (0, 0, 0, 0))
    draw = ImageDraw.Draw(base)

    horizon_y = 98
    for y in range(320):
        if y < horizon_y:
            ratio = y / max(1, horizon_y - 1)
            r = int(130 + (196 - 130) * ratio)
            g = int(204 + (236 - 204) * ratio)
            b = int(245 + (255 - 245) * ratio)
        else:
            ratio = (y - horizon_y) / max(1, 319 - horizon_y)
            r = int(76 + (18 - 76) * ratio)
            g = int(181 + (79 - 181) * ratio)
            b = int(224 + (132 - 224) * ratio)
        draw.line((0, y, 179, y), fill=(r, g, b, 255))

    # Distant clouds and sun
    draw.ellipse((116, 18, 146, 48), fill=(250, 236, 174, 255))
    for box in [(10, 18, 36, 34), (24, 14, 58, 32), (136, 26, 170, 42), (148, 22, 178, 40)]:
        draw.ellipse(box, fill=(244, 250, 255, 220))
    draw.arc((70, 24, 82, 30), 200, 340, fill=(88, 108, 132, 255), width=1)
    draw.arc((80, 22, 94, 30), 200, 340, fill=(88, 108, 132, 255), width=1)

    # Island silhouette and beach
    draw.polygon([(16, 93), (34, 82), (62, 78), (92, 80), (118, 76), (148, 84), (166, 94), (166, 108), (16, 108)], fill=(211, 184, 119, 255))
    draw.polygon([(22, 94), (46, 86), (72, 84), (98, 86), (124, 82), (148, 88), (160, 96), (160, 104), (22, 104)], fill=(238, 216, 155, 255))
    draw.line((24, 94, 158, 94), fill=(250, 236, 188, 255), width=2)

    # Palm trees
    palms = [(46, 86, 22), (70, 84, 28), (106, 82, 20), (132, 88, 16)]
    for trunk_x, base_y, trunk_h in palms:
        draw.line((trunk_x, base_y, trunk_x - 4, base_y - trunk_h), fill=(115, 73, 45, 255), width=3)
        leaf_y = base_y - trunk_h
        leaves = [
            [(trunk_x - 14, leaf_y + 1), (trunk_x - 2, leaf_y - 7), (trunk_x + 10, leaf_y + 1), (trunk_x - 1, leaf_y + 6)],
            [(trunk_x - 9, leaf_y - 2), (trunk_x + 2, leaf_y - 10), (trunk_x + 15, leaf_y - 1), (trunk_x + 2, leaf_y + 6)],
            [(trunk_x - 4, leaf_y + 2), (trunk_x + 8, leaf_y - 4), (trunk_x + 20, leaf_y + 4), (trunk_x + 6, leaf_y + 8)],
        ]
        for leaf in leaves:
            draw.polygon(leaf, fill=(74, 146, 78, 255))
            draw.line((leaf[0][0] + 3, leaf[0][1] + 1, leaf[2][0] - 2, leaf[2][1] - 1), fill=(112, 186, 112, 255), width=1)

    # Pier and flag
    draw.rectangle((81, 78, 85, 101), fill=(122, 78, 47, 255))
    draw.rectangle((96, 78, 100, 101), fill=(122, 78, 47, 255))
    draw.rectangle((74, 94, 108, 100), fill=(152, 103, 66, 255))
    draw.line((92, 70, 92, 93), fill=(111, 70, 44, 255), width=2)
    draw.polygon([(92, 71), (104, 76), (92, 82)], fill=(210, 74, 64, 255))
    draw.rectangle((87, 85, 95, 91), fill=(153, 100, 59, 255))
    draw.rectangle((88, 86, 94, 90), fill=(219, 183, 90, 255))

    # Water surface with foam
    surface = []
    for x in range(0, 180, 6):
        surface.append((x, horizon_y + (1 if (x // 6) % 2 == 0 else 3)))
    surface.extend([(179, 320), (0, 320)])
    draw.polygon(surface, fill=(72, 182, 224, 255))
    for x in range(0, 180, 12):
        draw.arc((x, horizon_y - 4, x + 10, horizon_y + 6), 180, 360, fill=(243, 252, 255, 255), width=1)
    draw.polygon([(141, 100), (145, 99), (149, 102), (147, 106), (142, 105)], fill=(84, 132, 171, 255))
    draw.rectangle((143, 100, 146, 103), fill=(217, 239, 242, 255))
    draw.line((144, 100, 144, 95), fill=(118, 79, 56, 255), width=1)
    draw.line((142, 105, 149, 104), fill=(236, 250, 255, 255), width=1)

    # Underwater light bands kept opaque so Phaser scaling does not darken them
    for left, right in ((26, 38), (58, 71), (92, 105), (126, 139)):
        draw.polygon(
            [(left, horizon_y + 2), (right, horizon_y + 2), (right - 18, 208), (left - 18, 208)],
            fill=(190, 236, 248, 255)
        )
        draw.line((left + 3, horizon_y + 4, left - 13, 206), fill=(226, 248, 252, 255), width=1)

    # Mid-water wave bands
    for band_y, color in [(144, (134, 218, 239, 255)), (192, (108, 194, 224, 255)), (250, (92, 170, 214, 255))]:
        for x in range(-10, 190, 18):
            draw.arc((x, band_y, x + 14, band_y + 8), 180, 360, fill=color, width=1)

    # Fish silhouettes
    fish_sets = [
        ((28, 154, 48, 166), [(28, 160), (18, 154), (18, 166)]),
        ((58, 170, 78, 182), [(58, 176), (48, 170), (48, 182)]),
        ((118, 150, 142, 164), [(118, 157), (108, 151), (108, 164)]),
        ((136, 205, 162, 221), [(136, 213), (125, 206), (125, 220)]),
    ]
    for body, tail in fish_sets:
        draw.ellipse(body, fill=(48, 103, 145, 255))
        draw.polygon(tail, fill=(48, 103, 145, 255))

    # Rocks, coral and treasure chest in the deep
    draw.ellipse((16, 292, 58, 312), fill=(74, 86, 126, 255))
    draw.ellipse((122, 294, 168, 314), fill=(66, 80, 122, 255))
    draw.ellipse((66, 286, 110, 308), fill=(79, 95, 138, 255))
    for stem_x in (24, 30, 138, 146, 154):
        draw.polygon([(stem_x, 300), (stem_x + 3, 288), (stem_x + 7, 300)], fill=(54, 108, 79, 255))
        draw.polygon([(stem_x + 5, 300), (stem_x + 8, 282), (stem_x + 12, 300)], fill=(87, 150, 108, 255))
    coral = [(82, 298), (80, 287), (76, 281), (79, 275), (85, 279), (86, 270), (92, 272), (90, 281), (94, 286), (93, 298)]
    draw.polygon(coral, fill=(239, 126, 119, 255))
    coral2 = [(94, 298), (95, 288), (100, 282), (98, 276), (103, 276), (106, 268), (112, 272), (109, 281), (111, 287), (110, 298)]
    draw.polygon(coral2, fill=(119, 219, 194, 255))
    draw.rectangle((88, 288, 98, 295), fill=(113, 73, 49, 255))
    draw.rectangle((89, 289, 97, 294), fill=(189, 129, 71, 255))
    draw.rectangle((90, 290, 96, 293), fill=(229, 191, 81, 255))

    # Bubbles and sparkle
    for x, y, r in [(24, 128, 2), (42, 148, 3), (64, 176, 2), (116, 136, 2), (134, 158, 3), (152, 184, 2), (106, 236, 2), (36, 248, 3)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(220, 246, 255, 255), outline=(246, 253, 255, 255))
    for x, y in [(20, 116), (56, 132), (96, 118), (132, 140), (160, 126)]:
        draw.line((x, y - 2, x, y + 3), fill=(255, 250, 228, 255))
        draw.line((x - 2, y + 1, x + 3, y + 1), fill=(255, 250, 228, 255))

    out = base.resize((720, 1280), Image.Resampling.NEAREST)
    out.save(ASSET_DIR / "bg_treasure_island.png")
    print("[done] bg_treasure_island.png")


if __name__ == "__main__":
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    draw_coral_garden()
    draw_shell_bed()
    draw_bubble_fountain()
    draw_treasure_castle()
    draw_kelp_arch()
    draw_moon_rocks()
    generate_treasure_background()
