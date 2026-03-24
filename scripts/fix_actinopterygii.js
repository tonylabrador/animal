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
    if (animal.taxonomy && animal.taxonomy.class && animal.taxonomy.class.en === 'Actinopterygii') {
      if (animal.taxonomy.class.zh === '硬骨鱼纲') {
        animal.taxonomy.class.zh = '辐鳍鱼纲';
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(animal, null, 2), 'utf-8');
      updatedCount++;
      console.log(`Updated ${file} to 辐鳍鱼纲`);
    }
  } catch (e) {
    console.error(`Error processing ${file}:`, e);
  }
}

console.log(`Successfully changed Actinopterygii translation to 辐鳍鱼纲 in ${updatedCount} animal files!`);
