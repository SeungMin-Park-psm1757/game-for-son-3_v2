from pathlib import Path

from PIL import Image, ImageDraw


BASE_SIZE = 64
FINAL_SIZE = 128
OUT_DIR = Path("assets/images")


def canvas():
    return Image.new("RGBA", (BASE_SIZE, BASE_SIZE), (0, 0, 0, 0))


def upscale(img: Image.Image, name: str) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    img.resize((FINAL_SIZE, FINAL_SIZE), Image.Resampling.NEAREST).save(OUT_DIR / name)


def rect(draw, box, fill, outline=(32, 25, 20, 255)):
    draw.rectangle(box, fill=fill, outline=outline)


def ellipse(draw, box, fill, outline=(32, 25, 20, 255)):
    draw.ellipse(box, fill=fill, outline=outline)


def coral_garden():
    img = canvas()
    d = ImageDraw.Draw(img)
    ellipse(d, (8, 44, 58, 61), (70, 88, 108, 235))
    for x, h, color in [(18, 24, (241, 120, 138, 255)), (28, 30, (255, 160, 96, 255)), (39, 20, (255, 104, 160, 255))]:
        rect(d, (x, 58 - h, x + 4, 58), color)
        rect(d, (x - 3, 58 - h + 7, x + 7, 58 - h + 11), color)
        rect(d, (x - 5, 58 - h + 14, x + 9, 58 - h + 18), color)
    ellipse(d, (12, 50, 24, 60), (242, 198, 146, 255))
    ellipse(d, (40, 49, 52, 59), (249, 220, 168, 255))
    upscale(img, "decor_coral_garden.png")


def shell_bed():
    img = canvas()
    d = ImageDraw.Draw(img)
    ellipse(d, (8, 46, 58, 61), (76, 93, 112, 235))
    d.polygon([(16, 56), (24, 46), (33, 56)], fill=(255, 230, 186, 255), outline=(32, 25, 20, 255))
    d.polygon([(28, 56), (37, 43), (48, 56)], fill=(255, 211, 165, 255), outline=(32, 25, 20, 255))
    ellipse(d, (35, 33, 43, 41), (248, 248, 255, 255))
    ellipse(d, (11, 50, 20, 58), (108, 124, 140, 255))
    ellipse(d, (46, 51, 56, 59), (98, 114, 130, 255))
    upscale(img, "decor_shell_bed.png")


def bubble_fountain():
    img = canvas()
    d = ImageDraw.Draw(img)
    rect(d, (24, 49, 40, 58), (72, 88, 112, 255))
    rect(d, (29, 37, 35, 49), (104, 166, 214, 255))
    for offset, size in [(-10, 9), (-2, 7), (7, 11), (13, 6)]:
        ellipse(d, (28 + offset, 18, 28 + offset + size, 18 + size), (214, 246, 255, 170), outline=(124, 210, 255, 220))
    for offset, size in [(-8, 15), (0, 11), (10, 14)]:
        ellipse(d, (30 + offset, 27, 30 + offset + size, 27 + size), (214, 246, 255, 140), outline=(124, 210, 255, 200))
    ellipse(d, (12, 48, 52, 61), (70, 88, 108, 200))
    upscale(img, "decor_bubble_fountain.png")


def treasure_castle():
    img = canvas()
    d = ImageDraw.Draw(img)
    ellipse(d, (7, 45, 59, 61), (66, 82, 102, 230))
    rect(d, (19, 31, 31, 55), (140, 110, 83, 255))
    rect(d, (31, 27, 45, 55), (155, 121, 90, 255))
    d.polygon([(19, 31), (25, 22), (31, 31)], fill=(194, 105, 58, 255), outline=(32, 25, 20, 255))
    d.polygon([(31, 27), (38, 16), (45, 27)], fill=(186, 95, 51, 255), outline=(32, 25, 20, 255))
    rect(d, (10, 43, 20, 52), (115, 72, 38, 255))
    rect(d, (11, 39, 21, 44), (152, 102, 58, 255))
    ellipse(d, (14, 39, 18, 43), (255, 220, 102, 255))
    upscale(img, "decor_treasure_castle.png")


def kelp_arch():
    img = canvas()
    d = ImageDraw.Draw(img)
    ellipse(d, (8, 46, 58, 61), (70, 88, 108, 235))
    for points in [
        [(18, 58), (16, 48), (20, 39), (18, 28), (22, 18), (28, 13)],
        [(30, 58), (27, 46), (31, 34), (29, 24), (33, 15)],
        [(42, 58), (39, 48), (43, 37), (41, 25), (45, 16), (50, 12)]
    ]:
        d.line(points, fill=(72, 132, 96, 255), width=4)
    ellipse(d, (32, 44, 40, 52), (248, 183, 94, 255))
    d.polygon([(36, 44), (38, 48), (42, 49), (39, 52), (40, 57), (36, 54), (32, 57), (33, 52), (30, 49), (34, 48)],
              fill=(248, 183, 94, 255), outline=(32, 25, 20, 255))
    upscale(img, "decor_kelp_arch.png")


def moon_rocks():
    img = canvas()
    d = ImageDraw.Draw(img)
    ellipse(d, (8, 45, 58, 61), (63, 79, 101, 235))
    ellipse(d, (12, 38, 34, 56), (104, 118, 142, 255))
    ellipse(d, (26, 31, 46, 54), (123, 138, 165, 255))
    ellipse(d, (39, 41, 56, 57), (84, 99, 124, 255))
    ellipse(d, (30, 23, 38, 31), (241, 248, 255, 255))
    ellipse(d, (29, 22, 39, 32), (153, 229, 255, 130), outline=(153, 229, 255, 180))
    upscale(img, "decor_moon_rocks.png")


if __name__ == "__main__":
    coral_garden()
    shell_bed()
    bubble_fountain()
    treasure_castle()
    kelp_arch()
    moon_rocks()
