import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const publicDir = path.join(process.cwd(), 'client', 'public');
  
  // 1. Verify and fix og-image.jpg dimensions
  const ogImagePath = path.join(publicDir, 'og-image.jpg');
  if (fs.existsSync(ogImagePath)) {
    const metadata = await sharp(ogImagePath).metadata();
    console.log(`Current og-image.jpg dimensions: ${metadata.width}x${metadata.height}`);
    if (metadata.width !== 1200 || metadata.height !== 630) {
      console.log('Resizing og-image.jpg to exactly 1200x630...');
      const inputBuffer = fs.readFileSync(ogImagePath);
      const outputBuffer = await sharp(inputBuffer)
        .resize(1200, 630, { fit: 'cover' })
        .toBuffer();
      fs.writeFileSync(ogImagePath, outputBuffer);
      console.log('og-image.jpg resized.');
    } else {
      console.log('og-image.jpg is already exactly 1200x630. No changes needed.');
    }
  }

  // 2. Generate 192x192 icon for PWA if it doesn't exist
  const icon192Path = path.join(publicDir, 'icon-192x192.png');
  const sourceIcon = path.join(publicDir, 'favicon.svg'); // or whichever source was used
  if (fs.existsSync(sourceIcon)) {
    console.log('Generating icon-192x192.png...');
    await sharp(sourceIcon)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(icon192Path);
    console.log('icon-192x192.png generated.');
  }
}

main().catch(console.error);
