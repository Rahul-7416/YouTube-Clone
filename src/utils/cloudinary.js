import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // fs lib comes with node -> used to do operations on fileSystems


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Assuming that file has been uploaded on our local server
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload the file on cloudinary 
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })

    // file has been uploaded successfully 
    // console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath); // used unlinkSync instead of unlink -> because we don't want to do it asynchronously -> i.e running it in the background
    return response;
  }
  catch (error) {
    // remove the locally saved temporary file -> as the upload operation got failed
    fs.unlinkSync(localFilePath); // unlinkSync -> to unlink synchronously -> basically to remove the file on our local server
    return null;
  }
}

export { uploadOnCloudinary };