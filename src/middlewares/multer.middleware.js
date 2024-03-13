import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // it is used to give the file a unique name
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null, file.originalname); // the name which user has given to the file -> but the problem is -> user might have diff files with the same name -> so it can override our temp files -> but as we will store the files on local storage for a very short span of time then it will be uploaded to the cloudinary -> so we are taking this risk for now
    }
})
  
export const upload = multer({ 
    // storage: storage // as we are using ES6 -> we can directly write it as -> storage
    storage,
});