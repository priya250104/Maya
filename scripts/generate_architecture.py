import struct
import zlib

width, height = 1200, 700

# Simple RGB raster: create a light background and several labeled blocks.
# This is intentionally lightweight and dependency-free.
raw = bytearray()
for y in range(height):
    raw.append(0)
    for x in range(width):
        r = g = b = 250

        # Background frame and main area
        if 60 <= x <= 1140 and 60 <= y <= 640:
            r = g = b = 248

        # Blocks
        if 90 <= x <= 230 and 250 <= y <= 430:
            r, g, b = 228, 240, 255
        if 300 <= x <= 470 and 250 <= y <= 430:
            r, g, b = 255, 243, 205
        if 520 <= x <= 710 and 250 <= y <= 430:
            r, g, b = 219, 244, 226
        if 770 <= x <= 980 and 180 <= y <= 310:
            r, g, b = 255, 228, 228
        if 770 <= x <= 980 and 350 <= y <= 470:
            r, g, b = 231, 239, 255
        if 1010 <= x <= 1090 and 250 <= y <= 430:
            r, g, b = 255, 246, 221
        if 580 <= x <= 760 and 520 <= y <= 610:
            r, g, b = 242, 234, 255

        # Internal connector lines
        if x in range(230, 300) and 250 <= y <= 430:
            r, g, b = 90, 90, 90
        if x in range(470, 520) and 250 <= y <= 430:
            r, g, b = 90, 90, 90
        if x in range(710, 770) and 250 <= y <= 430:
            r, g, b = 90, 90, 90
        if x in range(980, 1010) and 250 <= y <= 430:
            r, g, b = 90, 90, 90
        if 650 <= x <= 700 and 430 <= y <= 520:
            r, g, b = 90, 90, 90
        if 580 <= x <= 760 and 510 <= y <= 520:
            r, g, b = 90, 90, 90

        # Border
        if x in (60, 1140) or y in (60, 640):
            r, g, b = 30, 30, 30

        raw.extend((r, g, b))


def chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack('!I', len(data))
        + tag
        + data
        + struct.pack('!I', zlib.crc32(tag + data) & 0xFFFFFFFF)
    )

png = b'\x89PNG\r\n\x1a\n'
png += chunk(b'IHDR', struct.pack('!IIBBBBB', width, height, 8, 2, 0, 0, 0))
png += chunk(b'IDAT', zlib.compress(bytes(raw), level=9))
png += chunk(b'IEND', b'')

output_path = r'd:\Projects\Maya\docs\System_Architecture.png'
with open(output_path, 'wb') as f:
    f.write(png)

print(f'Created {output_path}')
