import os
from PIL import Image, ImageDraw

OUT_DIR = os.path.join("assets", "images")
BASE_SIZE = (64, 32)
UPSCALE = 4


def lerp(a, b, t):
    return a + (b - a) * t


def make_canvas():
    return Image.new("RGBA", BASE_SIZE, (0, 0, 0, 0))


def draw_planks(draw, top_left, top_right, bottom_left, bottom_right, colors):
    plank_count = 6
    for i in range(plank_count):
        t0 = i / plank_count
        t1 = (i + 1) / plank_count
        left_a = (lerp(top_left[0], bottom_left[0], t0), lerp(top_left[1], bottom_left[1], t0))
        right_a = (lerp(top_right[0], bottom_right[0], t0), lerp(top_right[1], bottom_right[1], t0))
        left_b = (lerp(top_left[0], bottom_left[0], t1), lerp(top_left[1], bottom_left[1], t1))
        right_b = (lerp(top_right[0], bottom_right[0], t1), lerp(top_right[1], bottom_right[1], t1))
        color = colors[i % len(colors)]
        draw.polygon([left_a, right_a, right_b, left_b], fill=color)

        seam_color = (88, 54, 28, 255)
        draw.line([left_a, right_a], fill=seam_color, width=1)


def save_art(img, filename):
    upscaled = img.resize((BASE_SIZE[0] * UPSCALE, BASE_SIZE[1] * UPSCALE), Image.Resampling.NEAREST)
    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, filename)
    upscaled.save(out_path)
    print(f"[saved] {out_path}")


def create_dock():
    img = make_canvas()
    draw = ImageDraw.Draw(img)

    draw.ellipse((6, 24, 58, 31), fill=(8, 18, 28, 110))
    draw.rectangle((10, 10, 14, 26), fill=(80, 48, 24, 255))
    draw.rectangle((48, 8, 52, 25), fill=(74, 44, 22, 255))
    draw.rectangle((18, 13, 22, 28), fill=(96, 58, 30, 255))
    draw.rectangle((42, 12, 46, 27), fill=(88, 52, 26, 255))

    top_left = (6, 12)
    top_right = (56, 8)
    bottom_left = (2, 23)
    bottom_right = (60, 22)
    draw_planks(draw, top_left, top_right, bottom_left, bottom_right, [
        (148, 96, 52, 255),
        (162, 108, 58, 255),
        (176, 122, 70, 255)
    ])
    draw.line([top_left, top_right], fill=(232, 194, 132, 255), width=1)
    draw.line([bottom_left, bottom_right], fill=(90, 58, 34, 255), width=1)

    rope = (202, 170, 110, 255)
    draw.line([(14, 11), (20, 15), (24, 13)], fill=rope, width=1)
    draw.line([(42, 12), (47, 14), (51, 10)], fill=rope, width=1)
    draw.rectangle((27, 14, 31, 19), fill=(104, 68, 38, 255))
    draw.rectangle((33, 13, 36, 19), fill=(104, 68, 38, 255))
    draw.ellipse((29, 15, 31, 17), fill=(230, 216, 162, 255))
    draw.ellipse((34, 14, 36, 16), fill=(230, 216, 162, 255))
    return img


def create_pier():
    img = make_canvas()
    draw = ImageDraw.Draw(img)

    draw.ellipse((5, 24, 59, 31), fill=(10, 22, 36, 120))
    for x, y0, y1, color in [
        (12, 10, 28, (126, 76, 40, 255)),
        (22, 11, 29, (110, 66, 34, 255)),
        (42, 9, 27, (124, 74, 38, 255)),
        (51, 8, 25, (118, 70, 36, 255))
    ]:
        draw.rectangle((x, y0, x + 3, y1), fill=color)

    top_left = (7, 11)
    top_right = (57, 7)
    bottom_left = (3, 22)
    bottom_right = (61, 21)
    draw_planks(draw, top_left, top_right, bottom_left, bottom_right, [
        (188, 136, 78, 255),
        (202, 150, 90, 255),
        (216, 166, 106, 255)
    ])
    draw.line([top_left, top_right], fill=(244, 212, 156, 255), width=1)
    draw.line([bottom_left, bottom_right], fill=(112, 76, 44, 255), width=1)

    rope = (222, 196, 140, 255)
    draw.line([(13, 11), (23, 14), (31, 12)], fill=rope, width=1)
    draw.line([(34, 12), (45, 14), (52, 10)], fill=rope, width=1)
    draw.polygon([(47, 3), (57, 1), (53, 9)], fill=(250, 108, 84, 255))
    draw.rectangle((46, 4, 47, 11), fill=(90, 58, 34, 255))
    return img


def create_boat():
    img = make_canvas()
    draw = ImageDraw.Draw(img)

    draw.ellipse((10, 24, 54, 31), fill=(8, 18, 30, 110))
    hull = [(8, 18), (16, 11), (50, 10), (58, 17), (52, 24), (14, 24)]
    draw.polygon(hull, fill=(114, 72, 42, 255))
    draw.polygon([(11, 18), (18, 13), (48, 12), (55, 17), (50, 21), (15, 21)], fill=(172, 116, 72, 255))
    draw.line([(18, 13), (48, 12)], fill=(228, 196, 146, 255), width=1)
    for rib_x in (22, 30, 38, 46):
        draw.line([(rib_x, 13), (rib_x - 2, 21)], fill=(98, 62, 34, 255), width=1)
    draw.rectangle((31, 6, 33, 17), fill=(104, 68, 40, 255))
    draw.polygon([(33, 6), (45, 11), (33, 14)], fill=(246, 234, 194, 255))
    return img


def create_sandbar():
    img = make_canvas()
    draw = ImageDraw.Draw(img)

    draw.ellipse((8, 23, 56, 31), fill=(6, 18, 30, 95))
    draw.polygon([(8, 18), (16, 12), (48, 11), (57, 17), (52, 23), (14, 24)], fill=(224, 200, 140, 255))
    draw.polygon([(12, 18), (18, 14), (46, 13), (53, 17), (48, 21), (18, 22)], fill=(246, 226, 176, 255))
    for rock in [
        (18, 18, 22, 21, (128, 116, 108, 255)),
        (42, 18, 46, 21, (118, 106, 98, 255)),
        (31, 16, 35, 20, (150, 138, 126, 255))
    ]:
        draw.ellipse(rock[:4], fill=rock[4])
    draw.line([(12, 16), (10, 9)], fill=(90, 138, 82, 255), width=1)
    draw.line([(14, 16), (15, 8)], fill=(116, 162, 92, 255), width=1)
    draw.line([(50, 17), (53, 9)], fill=(96, 144, 88, 255), width=1)
    return img


if __name__ == "__main__":
    save_art(create_dock(), "platform_dock.png")
    save_art(create_pier(), "platform_pier.png")
    save_art(create_boat(), "platform_boat.png")
    save_art(create_sandbar(), "platform_sandbar.png")
