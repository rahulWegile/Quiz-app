"use client"

import { useState,useEffect } from "react"

const API = process.env.NEXT_PUBLIC_API_URL


import { redirect, useParams,useRouter } from "next/navigation"

interface Topic{
    topic_id:string;
    name:string;

}

export  default function QuizSub (){
const{subjectId}=useParams()

    const [topics,setTopics]=useState<Topic[]>([])
    const [error,setError]=useState<string|null>(null)
    const [loading,setLoading ]= useState(true)

    const router=useRouter()


    useEffect(()=>{
        const getToken = ()=>{
            return document.cookie.split(";").find((row)=>row.trim().startsWith("session_token="))?.split("=")[1]
        }


    const fetchTopics = async()=>{
        const token = getToken()
        if(!token){
            redirect ("/Auth/signIn?error=login_required")
        }


    const res = await fetch (`${API}/api/subjects/${subjectId}/topics`,
      {  headers:{Authorization:`Bearer ${token}`}}
    )

    const data=await res.json()

    setTopics(data.data)
    setLoading(false)


    }
fetchTopics()
},[subjectId])
  if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>
    

return (
    <div style={{marginTop:"100px",marginBottom:"600px"}}>
          <div style={{display:"flex",justifyContent:"center",fontSize:"25px"}}>Select Topic</div>
        {topics.map((topic) => (
            <div
             style={{display:"flex",justifyContent:"center"}}
                key={topic.topic_id}
                onClick={() => router.push(`/quiz/${subjectId}/${topic.topic_id}`)}
             
            >
               <div    style={{ marginTop:"8px",padding:"5px",marginBottom:"5px",border:"5px solid grey",width:"500px",textAlign:"center",  cursor:  "pointer"}} >{topic.name}</div> 
            </div>
        ))}
    </div>
)
}
