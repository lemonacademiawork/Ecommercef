from PIL import Image, ImageChops

def trim_white_space(image_path, output_paths):
    img = Image.open(image_path).convert("RGBA")
    
    # Create mask of non-white pixels
    datas = img.getdata()
    new_data = []
    
    for item in datas:
        # Check if pixel is white or near white
        if item[0] > 235 and item[1] > 235 and item[2] > 235:
            new_data.append((255, 255, 255, 0)) # Make transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Get bounding box of transparent image
    bbox = img.getbbox()
    if bbox:
        # Add slight 6px padding around crop so it looks nice
        padding = 6
        left = max(0, bbox[0] - padding)
        top = max(0, bbox[1] - padding)
        right = min(img.width, bbox[2] + padding)
        bottom = min(img.height, bbox[3] + padding)
        img_cropped = img.crop((left, top, right, bottom))
    else:
        img_cropped = img

    print(f"Original size: {img.size}, Cropped size: {img_cropped.size}")

    for out_path in output_paths:
        if out_path.endswith(".ico"):
            img_cropped.save(out_path, format="ICO", sizes=[(32, 32), (48, 48), (64, 64)])
        else:
            img_cropped.save(out_path, format="PNG")
        print(f"Saved: {out_path}")

if __name__ == "__main__":
    paths = [
        "src/assets/logo.png",
        "public/logo.png",
        "public/favicon.png",
        "public/favicon.ico"
    ]
    trim_white_space("src/assets/logo.png", paths)
