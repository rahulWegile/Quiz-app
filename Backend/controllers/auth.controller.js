import {changePass, clearOtp, getUserByOtp, insertOtp, newUser,userByEmail} from '../models/user.model.js'
import bcrypt, { compare } from"bcrypt"
import jwt  from "jsonwebtoken"
import { uploadOnCloudinary } from '../utils/cloudinary.utils.js'

import { senderVerificationCode } from '../utils/verifyEmail.utils.js'
import { verifyCode } from '../utils/sendMail.util.js'

    
//insert user
export const insertUser = async (req, res) => {

    
    try {
        const { name, email, password } = req.body;
        
    // for uploads
     const coverImageLocalPath =req.files?.profile_picture?.[0]?.path;
    if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
     let profile_picture = "";

    if (coverImageLocalPath) {
     const uploaded = await uploadOnCloudinary(coverImageLocalPath);

      profile_picture = uploaded?.secure_url || "";
      }

        const verification_code = Math.floor(100000 + Math.random() * 900000).toString();
        const verification_code_expires = Date.now() + 10 * 60 * 1000;

        const user = await newUser(name, email, password, profile_picture, verification_code, verification_code_expires);

        if (!user) { 
            return res.status(400).json({
                success: false,
                message: "User insertion error"
            });
        }

        const accesToken = jwt.sign( 
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

       

        console.log("Sending verification to:", email);

    await senderVerificationCode(email,verification_code)

 res.status(200).json({
            success: true,
            data: { user, accesToken }
        });

    } catch (err) {
    console.error(err);
    
    if (err.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "Email already registered"
        });
    }
    
    res.status(500).json({ success: false, message: "Server error" });
}
};

//verify email
export const verifyEmail = async (req, res) => {
    const { verification_code } = req.body;
    const { id } = req.user;

    try {
        const user = await getUserByOtp(verification_code);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Verification code not valid"
            });
        }

        await clearOtp(id);
        await verifyCode(user.name, user.email); 

        return res.json({
            success: true,
            message: "Verification successful"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

//user login 
export const userLogin = async ( req,res)=>{
    const {email,password} = req.body
      if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }
    
    try{
        const user = await userByEmail(email);

        if(!user){
            return res.json({
                success:false,
                message:"user not found"
            })
        }

        const userLog =await bcrypt.compare(password,user.password)
        if(!userLog){
            return res.json({
                success:false,
                message:"incorrect password"
            })

        }
        const accesToken = jwt.sign({id:user.id,email:user.email},process.env.JWT_SECRET,
            {expiresIn:"1d"})
        return res.json({
            success:true,
            message:"User logged in succesfully",accesToken
        })



    }catch(err){
        console.error(err);
        
    }
}


//forgot password 

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

     await insertOtp(code, email);

    await senderVerificationCode(user.email, code);

    
    
    res.json( `Reset code sent to ${email} `);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

//reset password
export const resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    const user = await changePass(newPassword, code);

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



