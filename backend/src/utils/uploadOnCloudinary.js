import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';          
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(localFilePath,folderPath){
  try {
    if (!localFilePath)   return null;
    const result = await cloudinary.uploader.upload(localFilePath,{resource_type: "image", folder: folderPath});
    fs.unlinkSync(localFilePath); 
    return result.url;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
}

export {uploadOnCloudinary};