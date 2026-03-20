import { getQuestionsById,getQuestionsByStatus,updatequestionStatus,getAllQuestions,updatequestionStatusBulk,deleteRejectedQuestions, getquestionss, updateQuestion } from "../models/questions.model.js";

//get question by pending status

export const questionStatus = async(req,res)=>{
    const status="pending"
    try{

        const question = await getQuestionsByStatus(status);

        if(!question || question.lenghth === 0){
            return res.json("No pending questions ")
        }

        return res.status(200).json({
            
            success:"true",
            message :'questions fetched succesfully',
            data:question
        })
    }catch(err){
        return res.status(403).json({
            success:"false",
        })
    }
}
//get question by pending status

export const questionStatusRejected = async(req,res)=>{
    const status="rejected"
    try{

        const question = await getQuestionsByStatus(status);

        if(!question || question.lenghth === 0){
            return res.json("No rejcted questions ")
        }

        return res.status(200).json({
            
            success:"true",
            message :'questions fetched succesfully',
            data:question
        })
    }catch(err){
        return res.status(403).json({
            success:"false",
        })
    }
}


//approve question by id
export const updateStatusApprove = async (req, res) => {
  const question_id = req.params.id;
  const reviewed_by = req.user.id;

  try {
    const question = await getQuestionsById(question_id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const updated = await updatequestionStatus(question_id, "approved", reviewed_by, null);

    return res.status(200).json({
      message: "Question approved successfully",
      data: updated
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

//reject question by id
export const updateStatusReject = async(req,res)=>{
    
    const question_id= req.params.id
    const reviewed_by=req.user.id
    try{
        //get user by id 

        const question = await getQuestionsById(question_id)
        if(!question){
            return res.status(403).json("question not found")
        }

        //now update status
     const { rejection_reason } = req.body
 const updated=await updatequestionStatus(question_id, "rejected", reviewed_by, rejection_reason)
        return res.status(200).json({
            success:true,
            data:updated
        })
    }catch(err){
        return res.status(403).json({
            success:"false",
            message:err.message
        })
    }
}

// get all

export const getQues = async (req,res)=>{
    try{
 const question = await getquestionss();

 return res.json({
    success:true,
    data:question
 })

    }catch(err){
        console.error(err);
        
    }
}

// get questions with filters 
export const getAllQuestionsAdmin = async(req,res)=>{
    const {status,difficulty,topic_id,page=1,limit=10}=req.query

    const filter={status,difficulty,topic_id,page,limit}

    try{
        const questions = await  getAllQuestions(filter);

        if(!questions|| questions.length==0){
            return res.status(403).json("no questions found")
        }


        return res.status(200).json({
            success:"true",
            message:"questions fetched succesfully",
            data:questions
        })
    }catch(err){
        return res.status(403).json({
            success:"false",
        })
    }
}

//approve all questions
export const   updateBulk  = async(req,res)=>{
    const reviewed_by= req.user.id
    try{
        const questions = await updatequestionStatusBulk(reviewed_by);



        return res.status(200).json({
            success:"true",
            message:"questions updated",
            data:questions
        })
    }catch(err){
        return res.status(403).json({
            success:"false",
        })
    }
}
//approve all questions
export const   deleteQuestions  = async(req,res)=>{
    const question_id= req.params.id
    try{
        const questions = await deleteRejectedQuestions(question_id);



        return res.status(200).json({
            success:"true",
            message:"questions updated",
            data:questions
        })
    }catch(err){
        return res.status(403).json({
            success:"false",
        })
    }
}


//update questions
export const editQuestion = async (req, res) => {
  const question_id = req.params.id;
  try {
    const updated = await updateQuestion(question_id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};