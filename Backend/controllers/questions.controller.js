import { insertQuestion,checkDuplicate, bulkUpload } from "../models/questions.model.js";


export const postQuestion = async (req,res)=>{
  const {question_text,option_a,option_b,option_c,option_d,correct_answer,difficulty,topic_id}=req.body;
  const uploaded_by=req.user.id
    try{

        const duplicate = await checkDuplicate(question_text)
        if(duplicate){
            return res.status(403).json({
            success:false,
            message:"questions already exists"
        })
        }

        const questions= await insertQuestion({question_text,option_a,option_b,option_c,option_d,correct_answer,difficulty,uploaded_by,topic_id})

        if(!questions){
            
            
            return res.status(403).json({
            success:false,
            message:"insertion failed"
        })
        }
        

         return res.status(200).json({
            success:true,
            message:"questions  inserted successfull",
            data:questions
        })
    }catch(err){
        console.error(err);
        return res.status(403).json({
            success:false,
            message:"insertion failed"

        })
    }
}

//bulk upload


export const postQuestions = async (req,res)=>{
 const questions =req.body.questions
    const uploaded_by=req.user.id
    try{

        // const duplicate = await checkDuplicate(question_text)
        // if(duplicate){
        //     return res.status(403).json({
        //     success:false,
        //     message:"questions already exists"
        // })
        // }

        const bulkquestions= await bulkUpload(questions,uploaded_by)

        if(!bulkquestions){
            
            
            return res.status(403).json({
            success:false,
            message:"insertion failed"
        })
        }
        

         return res.status(200).json({
            success:true,
            message:"questions  inserted successfull",
            data:bulkquestions
        })
    }catch(err){
        console.error(err);
        return res.status(403).json({
            success:false,
            message:"insertion failed"

        })
    }
}


