import query from '../database/db.js';
import bcrypt from 'bcrypt'
import { getUsers, getUserById, updateUser, insertOtp } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.utils.js';
import { senderVerificationCode } from '../utils/verifyEmail.utils.js'

//get users
export const getUserss = async (req, res) => {
  try {
    const user = await getUsers()

    if (!user) {
      return res.json({
        success: false,
      })
    }

    res.status(200).json({
      success: true,
      data: { user }
    })

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}

//user by id
export const userById = async (req, res) => {
  try {
    const id = req.user.id

    const user = await getUserById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    res.status(200).json({
      success: true,
      data: user
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}

//update user
export const upUser = async (req, res) => {
  const id = req.user.id
  const { name, email, password, currentPassword, gender, profile_url } = req.body

  try {
    const existingUser = await getUserById(id)

    // PASSWORD CHANGE VALIDATION
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required"
        })
      }

      const match = await bcrypt.compare(currentPassword, existingUser.password)

      if (!match) {
        return res.status(400).json({
          success: false,
          message: "Incorrect current password"
        })
      }
    }

    // EMAIL CHANGE — send OTP but still save other fields
    if (email && email !== existingUser.email) {
      const code = Math.floor(10000 + Math.random() * 90000).toString()

      // 1. Save all fields INCLUDING new email first
      const updatedUser = await updateUser(id, name, email, password, gender, profile_url) // ✅ gender included

      // 2. Now insert OTP on the new email row (it exists now)
      await insertOtp(email, code)

      // 3. Send code to new email
      await senderVerificationCode(email, code)

      return res.status(200).json({
        success: true,
        emailVerificationRequired: true,
        message: "Please verify your new email",
        email,
        user: updatedUser
      })
    }

    // NORMAL UPDATE
    const user = await updateUser(id, name, email, password, gender, profile_url) // ✅ gender included

    if (!user) {
      return res.json({ success: false })
    }

    res.status(200).json({
      success: true,
      data: { user }
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}

// update profile picture
export const updateProfilePic = async (req, res) => {
  try {
    const id = req.user.id

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    const result = await uploadOnCloudinary(req.file.path)

    if (!result) {
      return res.status(500).json({ success: false, message: "Cloudinary upload failed" })
    }

    // ✅ Correct argument order: (id, name, email, password, gender, profile_url)
    const user = await updateUser(id, undefined, undefined, undefined, undefined, result.secure_url)

    res.status(200).json({ success: true, profile_url: result.secure_url })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}