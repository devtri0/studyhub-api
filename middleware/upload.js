import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const productPicturesUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "/studenthub-api/certificates"
    },
  }),
});

export const photo = multer({
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "/studenthub-api/profile-pictures"
      },
    }),
  });
