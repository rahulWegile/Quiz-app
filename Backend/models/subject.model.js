import query from "../database/db.js";


export const insertSubject= async (name)=>{
    try{
        const sql= `INSERT INTO subjects (name) VALUES ($1) RETURNING *  `
     const{rows}= await query(sql,[name])

     return rows[0]

    }catch(err){
        console.error(err);
        
    }
}
//
export const getAllSubject= async ()=>{
    try{
        const sql= `SELECT * FROM subjects ORDER BY subject_id DESC`
     const{rows}= await query(sql)

     return rows

    }catch(err){
console.error(err);

    }
}
//
export const getSubjectById= async (subject_id)=>{
    try{
        const sql= `SELECT * FROM subjects WHERE subject_id = $1 `
     const{rows}= await query(sql,[subject_id])

     return rows[0]

    }catch(err){
     console.log(err);
     
    }
}
//
export const updateSubject= async (name,subject_id)=>{
    try{
        const sql= `UPDATE subjects SET name = $1 WHERE subject_id=$2 RETURNING *`
     const{rows}= await query(sql,[name,subject_id])

     return rows[0]

    }catch(err){
        console.error(err);
        
    }
}
//
export const deleteSubject= async (subject_id)=>{
    try{
        const sql= `DELETE FROM subjects WHERE subject_id =$1 RETURNING*`
     const{rows}= await query(sql,[subject_id])

     return rows[0]

    }catch(err){
       console.error(err);
       
    }
}


