import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';          
          
cloudinary.config({ 
  cloud_name: 'dejbo7uw5', 
  api_key: '968851262816395', 
  api_secret: 'Quy5J2BQxn3hlduJ1_esLwGvO64' 
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