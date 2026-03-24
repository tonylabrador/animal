const fs = require('fs');
const path = require('path');

const animalsDir = path.join(__dirname, '..', 'data', 'animals');
const files = fs.readdirSync(animalsDir).filter(f => f.endsWith('.json'));

let updatedCount = 0;
for (const file of files) {
  const filePath = path.join(animalsDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const animal = JSON.parse(content);

    let changed = false;
    if (animal.taxonomy && animal.taxonomy.order && animal.taxonomy.order.en) {
      const orderEn = animal.taxonomy.order.en.toLowerCase().trim();
      if (orderEn === 'cetacea' || orderEn === 'artiodactyla') {
        animal.taxonomy.order = {
          en: 'Cetartiodactyla',
          zh: '鲸偶蹄目'
        };
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(animal, null, 2), 'utf-8');
      updatedCount++;
      console.log(`Updated ${file}`);
    }
  } catch (e) {
    console.error(`Error processing ${file}:`, e);
  }
}

console.log(`Successfully merged Cetartiodactyla in ${updatedCount} animal files!`);
