import query from "../database/db.js"

//insert
export const insertTopic = async (name, subject_id) => {
  try {
    const sql = `INSERT INTO topics (name, subject_id) VALUES ($1, $2) RETURNING *`;
    const { rows } = await query(sql, [name, subject_id]);
    return rows[0];
  } catch (err) {
    console.error(err);
  }
};
    //
export const getAllTopics = async () => {
  try {
    const sql = `SELECT * FROM topics ORDER BY topic_id DESC`;
    const { rows } = await query(sql);
    return rows; // fix: was rows[0]
  } catch (err) {
    console.error(err);
  }
};

export const getTopicBySubject = async (subject_id) => {
  try {
    const sql = `SELECT * FROM topics WHERE subject_id = $1`;
    const { rows } = await query(sql, [subject_id]);
    return rows; // fix: was rows[0]
  } catch (err) {
    console.error(err);
  }
};
    export const getTopicById= async (topic_id)=>{
    try{
        const sql= `SELECT * FROM topics WHERE topic_id = $1`
     const{rows}= await query(sql,[topic_id])

     return rows[0]

    }catch(err){console.error(err);
    
    }}
    //
    export const deletTopic= async (topic_id)=>{
    try{
        const sql= `DELETE FROM topics WHERE topic_id = $1 RETURNING *`
     const{rows}= await query(sql,[topic_id])

     return rows[0]

    }catch(err){console.error(err);
    
    }}
    //
    export const updateTopic= async (topic_id,name)=>{
    try{
        const sql= `UPDATE topics SET name = $1 WHERE topic_id=$2 RETURNING *`
     const{rows}= await query(sql,[name,topic_id])

     return rows[0]

    }catch(err){console.error(err);
    
    }}