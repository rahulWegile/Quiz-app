import { insertSubject,getAllSubject,getSubjectById,updateSubject,deleteSubject } from "../models/subject.model.js";

export const postSubject = async(req,res)=>{
const name=req.body.name
    try{
        const subject= await insertSubject(name)

        
        return res.status(200).json({
            success:true,
            data:subject
            
        })
        
    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,

        })
        
    }
} 

//get all subjects

export const getAllSubjects = async(req,res)=>{

    try{
        const subject= await getAllSubject()
        return res.status(200).json({
            success:true,
            data:subject
            
        })
        
    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,

        })
        
    }
} 

//subjects by id 

export const getSubById = async(req,res)=>{
const subject_id=req.params.id

    try{
        const subject= await getSubjectById(subject_id)
        return res.status(200).json({
            success:true,
            data:subject
            
        })
        
    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,

        })
        
    }
} 

//update Subject
export const upSubject = async(req,res)=>{
const name=req.body.name
const subject_id=req.params.id
    try{
        const subject= await updateSubject(name,subject_id)
        return res.status(200).json({
            success:true,
            data:subject
            
        })
        
    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,

        })
        
    }
} 

//delete subject
export const delSubject = async(req,res)=>{
const subject_id=req.params.id
    try{
        const subject= await deleteSubject(subject_id)
        if(!subject){
            
            res.json({
                success:false,
                message:"subject not found "})
        }
        return res.status(200).json({
            success:true,
            data:subject,
            message:"subject deleted succesfully"
            
        })
        
    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,

        })
        
    }
} 