import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log("file uploaded", response)
        return response

    } catch (err) {
        console.error("Cloudinary upload failed:", err)
        throw err  // re-throw so the caller knows it failed

    } finally {
        // always runs — success or failure
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
    }
}

export { uploadOnCloudinary }