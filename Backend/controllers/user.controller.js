import query from '../database/db.js';
import {getUsers,getUserById,updateUser } from '../models/user.model.js'

//get user 

export const getUserss = async ( req,res)=>{
    try{
        const user = await getUsers()

         if(!user){
            return res.json({
                success:false,
            })
        }
        res.status(200).json({
            success:true,
            data:{user}

        })   

        

    }catch(err){
        console.error();
        
    }
}
//user by id
export const userById= async ( req,res)=>{
    const {id} = req.params
    try{
        const user = await getUserById(id)

         if(!user){
            return res.json({
                success:false
            })
        }
        res.status(200).json({
            success:true,
            data:{user}

        })   
    }catch(err){
        console.error();
        
    }
}

//update user
export const upUser= async (req,res)=>{
    const id = req.user.id
    const  {name,email,password,profile_url} = req.body
    try{

        const user = await updateUser(id,name,email,password,profile_url)

         if(!user){
            return res.json({
                success:false
            })
        }
        res.status(200).json({
            success:true,
            data:{user}

        })   
        


    }catch(err){
        console.error(err);
        
    }
}