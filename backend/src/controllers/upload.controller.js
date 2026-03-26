import cloudinary from '../utils/cloudinary.js';

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided for upload" });
    }

    if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY) {
      console.error("Cloudinary Configuration Missing!");
      return res.status(500).json({ success: false, message: "Backend Cloudinary configuration error" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "course-content",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Stream Error:", error);
          return res.status(500).json({ success: false, message: error.message || "Cloudinary upload failed" });
        }
        return res.status(200).json({
          success: true,
          secure_url: result.secure_url,
          duration: result.duration ? Math.round(result.duration) : null,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error("Upload controller error:", err);
    return res.status(500).json({ success: false, message: "Media process failed" });
  }
};

