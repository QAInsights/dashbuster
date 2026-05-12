from PIL import Image

src = Image.open('icons/DashBuster.png').convert('RGBA')

# Resize to standard Chrome extension sizes using LANCZOS for sharpness
for size in [16, 48, 128]:
    resized = src.resize((size, size), Image.LANCZOS)
    resized.save(f'icons/icon{size}.png')

print('Resized: icon16.png, icon48.png, icon128.png')
