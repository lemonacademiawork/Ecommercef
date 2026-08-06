from PIL import Image

def process_logo():
    # Read raw image before previous edits if available or current
    img = Image.open("src/assets/logo.png").convert("RGBA")
    pixels = img.load()
    width, height = img.size

    # Create new RGBA image
    new_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    new_pixels = new_img.load()

    min_x, min_y, max_x, max_y = width, height, 0, 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Detect background light pink / white pixels
            if r > 215 and g > 185 and b > 215:
                # Transparent background
                new_pixels[x, y] = (0, 0, 0, 0)
            elif r > 200 and g > 175 and b > 200:
                # Soft transition for edges
                alpha = int(255 * (1.0 - (r - 200) / 15.0))
                alpha = max(0, min(255, alpha))
                new_pixels[x, y] = (r, g, b, alpha)
                if alpha > 30:
                    if x < min_x: min_x = x
                    if y < min_y: min_y = y
                    if x > max_x: max_x = x
                    if y > max_y: max_y = y
            else:
                new_pixels[x, y] = (r, g, b, a)
                if a > 30:
                    if x < min_x: min_x = x
                    if y < min_y: min_y = y
                    if x > max_x: max_x = x
                    if y > max_y: max_y = y

    # Add 4px padding around cropped logo bounds
    pad = 4
    crop_left = max(0, min_x - pad)
    crop_top = max(0, min_y - pad)
    crop_right = min(width, max_x + 1 + pad)
    crop_bottom = min(height, max_y + 1 + pad)

    cropped = new_img.crop((crop_left, crop_top, crop_right, crop_bottom))
    print(f"Original size: ({width}, {height}) -> Trimmed size: {cropped.size}")

    targets = [
        "src/assets/logo.png",
        "public/logo.png",
        "public/favicon.png",
    ]
    for target in targets:
        cropped.save(target, "PNG")
        print(f"Saved PNG to {target}")

    cropped.save("public/favicon.ico", format="ICO", sizes=[(32, 32), (48, 48), (64, 64)])
    print("Saved ICO to public/favicon.ico")

if __name__ == "__main__":
    process_logo()
