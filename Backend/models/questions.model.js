import query from "../database/db.js";

//insert question
export const insertQuestion= async (questions )=>{
   const { question_text, option_a, option_b, option_c, option_d, correct_answer, topic_id, difficulty, uploaded_by } = questions;
    try{
        const sql = ` INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, topic_id, difficulty, uploaded_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`

        const {rows}=await query(sql,[ question_text, option_a, option_b, option_c, option_d, correct_answer, topic_id, difficulty, uploaded_by])
    
        return rows[0]
    }
    catch(err){
       console.log(err);
       
    }
}
// question by stattus
export const getQuestionsByStatus= async (status)=>{
    try{
        const sql= `SELECT * FROM questions  WHERE status = $1 ORDER BY created_at DESC`
        
        const {rows}= await query(sql,[status])
        return rows

    }catch(err){
         console.log(err);
    }
}
// get uqestion by id
export const getQuestionsById= async (question_id)=>{
    try{
        const sql= `SELECT * FROM questions  WHERE question_id= $1 ORDER BY created_at DESC`

        const {rows}= await query(sql,[question_id])
        return rows[0]
    }catch(err){

          console.log(err);
    }
}
//get all question 
export const getquestionss= async()=>{
  const {rows}= await query("SELECT * FROM questions ORDER BY created_at DESC ")
  return rows
}

// get  questions with filter
export const getAllQuestions = async (filter) => {
  try {
    const { status, difficulty, topic_id, page = 1, limit = 10 } = filter;

    const conditions = [];
    const values = [];
    let i = 1;

    if (status) {
      conditions.push(`status = $${i++}`);
      values.push(status);
    }

    if (difficulty) {
      conditions.push(`difficulty = $${i++}`);
      values.push(difficulty);
    }

    if (topic_id) {
      conditions.push(`topic_id = $${i++}`);
      values.push(topic_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const offset = (page - 1) * limit;

    const sql = `
      SELECT * FROM questions 
      ${where}
      ORDER BY created_at DESC
      LIMIT $${i++} OFFSET $${i++}
    `;

    values.push(limit, offset);

    const { rows } = await query(sql, values);
    return rows;

  } catch (err) {
    console.log(err);
  }
};
// update bulk status
export const updatequestionStatus= async (question_id, status, reviewed_by, rejection_reason = null)=>{
    try{
        const sql= `UPDATE questions SET status = $1, reviewed_by = $2, reviewed_at = NOW(), rejection_reason = $3
     WHERE question_id = $4 RETURNING *`
     const{rows}= await query(sql,[status, reviewed_by, rejection_reason, question_id])

     return rows[0]

    }catch(err){
         console.log(err);
    }
}
// check duplicate
export const checkDuplicate= async (question_text)=>{
    try{
        const sql = `SELECT question_id FROM questions WHERE LOWER(question_text) = LOWER($1)`

        const {rows} = await query(sql,[question_text])

        return rows[0]

    }catch(err){  console.log(err);
    }
}
//bulk insert bulk
export const bulkUpload = async (questions, uploaded_by) => {
  const question_texts  = questions.map(q => q.question_text);
  const option_as       = questions.map(q => q.option_a);
  const option_bs       = questions.map(q => q.option_b);
  const option_cs       = questions.map(q => q.option_c);
  const option_ds       = questions.map(q => q.option_d);
  const correct_answers = questions.map(q => q.correct_answer);
  const difficultys     = questions.map(q => q.difficulty);
  const topic_ids       = questions.map(q => q.topic_id);
  const uploaded_bys    = questions.map(() => uploaded_by);

  const sql = `
    INSERT INTO questions 
      (question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, topic_id, uploaded_by)
    SELECT * FROM UNNEST(
      $1::text[],
      $2::text[],
      $3::text[],
      $4::text[],
      $5::text[],
      $6::text[],
      $7::difficulty_level[],
      $8::uuid[],
      $9::uuid[]
    )
    ON CONFLICT (question_text) DO NOTHING
    RETURNING *
  `;

  const { rows } = await query(sql, [
    question_texts,
    option_as,
    option_bs,
    option_cs,
    option_ds,
    correct_answers,
    difficultys,
    topic_ids,
    uploaded_bys
  ]);

  return rows;
};

//bulk status update
export const updatequestionStatusBulk= async ( reviewed_by)=>{
    try{
        const sql= ` UPDATE questions 
  SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
  WHERE status = 'pending'
  RETURNING question_id`
     const{rows}= await query(sql,[ reviewed_by])

     return rows

    }catch(err){  console.log(err);
    }
}
    //delete rejected
 
export const deleteRejectedQuestions = async (id) => {
  try {
    const sql = `
      DELETE FROM questions
      WHERE question_id = $1
      RETURNING *
    `;

    const { rows } = await query(sql, [id]);
    return rows;

  } catch (err) {
    console.log(err);
  }
};

//update question
export const updateQuestion = async (question_id, fields) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty } = fields;
  const sql = `UPDATE questions SET question_text=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5, correct_answer=$6, difficulty=$7 WHERE question_id=$8 RETURNING *`;
  const { rows } = await query(sql, [question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, question_id]);
  return rows[0];
};