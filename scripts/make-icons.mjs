// Renders the PNG and ICO icons from src/app/icon.svg. Run: node scripts/make-icons.mjs
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile(new URL("../src/app/icon.svg", import.meta.url), "utf8");
// Home-screen icons get their corners rounded by the device, so they are drawn full-bleed.
const square = Buffer.from(svg.replace(' rx="12"', ""));
const rounded = Buffer.from(svg);

const png = (source, size, opaque) => {
  const image = sharp(source, { density: 72 * (size / 64) * 2 }).resize(size, size);
  return (opaque ? image.flatten({ background: "#12141a" }) : image).png().toBuffer();
};

await writeFile(new URL("../src/app/apple-icon.png", import.meta.url), await png(square, 180, true));
await writeFile(new URL("../public/icon-192.png", import.meta.url), await png(square, 192, true));
await writeFile(new URL("../public/icon-512.png", import.meta.url), await png(square, 512, true));

const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => png(rounded, size, false)));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + i * 16;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
await writeFile(new URL("../src/app/favicon.ico", import.meta.url), Buffer.concat([header, ...images]));

console.log("Icons written.");
