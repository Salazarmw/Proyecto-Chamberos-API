const AWS = require('aws-sdk');

// Configurar el logger de AWS
AWS.config.logger = console;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-2',
  logger: console
});

const uploadToS3 = async (file, folder) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  console.log('Uploading to S3 with params:', {
    bucket: params.Bucket,
    key: params.Key,
    contentType: params.ContentType,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      region: process.env.AWS_REGION
    }
  });

  try {
    const result = await s3.upload(params).promise();
    console.log('Upload successful:', result.Location);
    return result.Location;
  } catch (error) {
    console.error('Error uploading to S3:', {
      error,
      code: error.code,
      message: error.message,
      requestId: error.requestId,
      statusCode: error.statusCode,
      stack: error.stack
    });
    throw error;
  }
};

const deleteFromS3 = async (url) => {
  if (!url) {
    throw new Error('URL is required for deletion');
  }

  // Extraer la clave del objeto de la URL
  const key = url.includes('.com/') ? url.split('.com/')[1] : url;
  
  if (!key) {
    throw new Error('Could not extract key from URL');
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  };

  console.log('Deleting from S3 with params:', {
    bucket: params.Bucket,
    key: params.Key,
    originalUrl: url,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      region: process.env.AWS_REGION
    }
  });

  try {
    await s3.deleteObject(params).promise();
    console.log('Delete successful for key:', key);
  } catch (error) {
    console.error('Error deleting from S3:', {
      error,
      code: error.code,
      message: error.message,
      requestId: error.requestId,
      statusCode: error.statusCode,
      params,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  s3,
  uploadToS3,
  deleteFromS3
}; 