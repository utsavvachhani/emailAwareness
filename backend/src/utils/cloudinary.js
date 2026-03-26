import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const deleteFromCloudinary = async (url) => {
  if (!url) return;
  try {
    // Format: https://res.cloudinary.com/[cloud_name]/[resource_type]/upload/v[version]/[public_id].[ext]
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex !== -1) {
      // Everything after 'upload/' except the version (starts with 'v') and the final filename with extension
      let relevantParts = parts.slice(uploadIndex + 1);
      
      // Skip version if present
      if (relevantParts[0].startsWith('v') && !isNaN(relevantParts[0].substring(1))) {
        relevantParts = relevantParts.slice(1);
      }
      
      // The last part has the extension
      const lastPart = relevantParts.pop();
      const publicIdWithExt = lastPart.split('.')[0];
      
      const publicId = [...relevantParts, publicIdWithExt].join('/');
      const resourceType = url.includes('/video/') ? 'video' : 'image';
      
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
  } catch (err) {
    console.error("Cloudinary deletion failed:", err);
  }
};

export default cloudinary;
