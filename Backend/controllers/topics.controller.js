import { insertTopic,getAllTopics,getTopicBySubject,getTopicById,deletTopic,updateTopic } from "../models/topic.model.js" 

export const postTopic = async(req,res)=>{
const name=req.body.name
const subject_id= req.body.subject_id
    try{
        const subject= await insertTopic(name,subject_id)
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

//get all topics

export const getTopics = async(req,res)=>{

    try{
        const subject= await getAllTopics()
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

//topic by id 

export const TopicById = async(req,res)=>{
const topic_id=req.params.id
    try{
        const subject= await getTopicById(topic_id)
        if(!subject){
            res.json("topic  not found")
        }
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

//topic by Subject
export const topicBySubject = async(req,res)=>{
const subject_id=req.params.id
    try{
        const subject= await getTopicBySubject(subject_id)
        if(!subject){
            res.json("topic  not found")
        }
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

//delete topic
export const delTopic = async (req, res) => {
  const topic_id = req.params.id;
  try {
    const topic = await deletTopic(topic_id);
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }
    return res.status(200).json({ success: true, message: "Topic deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};
//update tpic
export const upTopic = async(req,res)=>{
const topic_id=req.params.id
const {name}=req.body
    try{
        const subject= await updateTopic(topic_id,name)
        if(!subject){
            res.json("topic  not found")
        }
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