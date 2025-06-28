const https = require('https');
const fs = require('fs');
const path = require('path');

const models = [
  {
    name: 'ssd_mobilenetv1_model-weights_manifest.json',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-weights_manifest.json'
  },
  {
    name: 'ssd_mobilenetv1_model-shard1',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-shard1'
  },
  {
    name: 'ssd_mobilenetv1_model-shard2',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-shard2'
  },
  {
    name: 'face_landmark_68_model-weights_manifest.json',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json'
  },
  {
    name: 'face_landmark_68_model-shard1',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1'
  }
];

const modelsDir = path.join(__dirname, '..', 'public', 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

console.log('📥 Downloading face detection models...\n');

models.forEach((model, index) => {
  const filePath = path.join(modelsDir, model.name);
  
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${model.name} already exists`);
    return;
  }
  
  console.log(`Downloading ${model.name}...`);
  
  const file = fs.createWriteStream(filePath);
  
  https.get(model.url, (response) => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`✓ Downloaded ${model.name}`);
      
      if (index === models.length - 1) {
        console.log('\n✅ All models downloaded successfully!');
      }
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {});
    console.error(`❌ Error downloading ${model.name}:`, err.message);
  });
}); 