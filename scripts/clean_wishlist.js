const fs = require('fs');

const wishlistPath = 'c:\\tony\\animal\\ANIMAL_WISHLIST.md';
const animalsListPath = 'c:\\tony\\animal\\ANIMALS_LIST.md';

const wishlist = fs.readFileSync(wishlistPath, 'utf8');
const animalsList = fs.readFileSync(animalsListPath, 'utf8');

const lines = wishlist.split('\n');
const newLines = [];
let idx = 1;

for (const line of lines) {
  const match = line.match(/^\|\s*\d+\s*\|/);
  if (match) {
    const parts = line.split('|');
    const sciName = parts[4].trim();
    // Check if the scientific name is in ANIMALS_LIST.md
    if (animalsList.includes(sciName)) {
      console.log('Skipping ' + parts[2].trim() + ' as it already exists.');
      continue;
    }
    // Update index
    parts[1] = ` ${idx} `;
    newLines.push(parts.join('|'));
    idx++;
  } else {
    newLines.push(line);
  }
}

fs.writeFileSync(wishlistPath, newLines.join('\n'));
console.log('Wishlist updated.');
