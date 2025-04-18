const fs = require('fs');
const path = require('path');
const https = require('https');

const uploadDir = path.join(__dirname, '../uploads/profile-photos');

// Crear el directorio si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}

// URL de una imagen de perfil por defecto (un avatar genérico)
const defaultImageUrl = 'https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/avatars/01.png';
const defaultImagePath = path.join(uploadDir, 'DefaultImage.jpeg');

// Descargar la imagen por defecto si no existe
if (!fs.existsSync(defaultImagePath)) {
  console.log('Downloading default profile image...');
  
  https.get(defaultImageUrl, (response) => {
    if (response.statusCode === 200) {
      const fileStream = fs.createWriteStream(defaultImagePath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Default profile image downloaded successfully');
      });
    } else {
      console.error('Failed to download default image:', response.statusCode);
    }
  }).on('error', (err) => {
    console.error('Error downloading default image:', err.message);
  });
} else {
  console.log('Default profile image already exists');
} 