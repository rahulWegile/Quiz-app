import query from "../database/db.js"
import bcrypt from "bcrypt"

//user insertion
export const newUser = async(name,email,password,profile_picture,verification_code,verification_code_expires,)=>{
try{
    const Name = name.trim().toLowerCase();
    const Email = email.trim().toLowerCase();
    const salt = bcrypt.genSaltSync(10)
    const hashPass=bcrypt.hashSync(password,salt)
    

    const sql = ` INSERT INTO users (name,email,password,profile_url,verification_code,verification_code_expires) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`
    const {rows} = await query(sql,[Name,Email,hashPass,profile_picture,verification_code,verification_code_expires])

    return rows[0]

    }
   catch(err) {
    if (err.code === "23505") {
        throw err; // ✅ throw so controller catches it
    }
    throw err;
}
}

//get users 
export const getUsers= async ()=>{
    try{
        const sql = `SELECT * FROM users`

        const {rows}= await query ( sql)

        return rows


    }catch(err){
        console.error(err);
        
    }
}

//delete user 
export const deleteUserById = async (id)=>{
    try{
        const sql = ` DELETE * FROM users WHERE id = $1`

        const {rows}= await query(sql,[id])

        return rows[0]

    }catch(err){
        console.error(err);
        
    }
}

//get user by id  
export const getUserById = async (id)=>{
    try{
        const sql = ` SELECT * FROM users WHERE id = $1`

        const {rows}= await query(sql,[id])

        return rows[0]

    }catch(err){
        console.error(err);
        
    }
}
//get user by code 
export const getUserByOtp = async (verification_code)=>{
    try{
        const sql = ` SELECT * FROM users WHERE verification_code = $1`

        const {rows}= await query(sql,[verification_code])

        return rows[0]

    }catch(err){
        console.error(err);
        
    }
}
//clear otp 
export const clearOtp= async(id)=>{
    try{
        const sql = `
    UPDATE users 
    SET verification_code = NULL, verification_code_expires = NULL 
    WHERE id = $1
`;
await query(sql, [id]);

    }
    catch(err){
        console.error(err);
        
    }
}
//update user 
export const updateUser = async (id, name, email, password, profile_url) => {
    try {
        const Name = name?.trim().toLowerCase();
        const Email = email?.trim().toLowerCase();
        const hashPass = password ? bcrypt.hashSync(password, bcrypt.genSaltSync(10)) : undefined;

        const sql = `
            UPDATE users
            SET
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                password = COALESCE($3, password),
                profile_url = COALESCE($4, profile_url)
            WHERE id = $5
            RETURNING *`;                          

        const { rows } = await query(sql, [Name, Email, hashPass, profile_url, id]);
        return rows[0];

    } catch (err) {
        console.error("updateUser error:", err);
    }
};
//change password
export const changePass = async (newPassword, code) => {
  try {
    if (!newPassword || typeof newPassword !== "string") {
      throw new Error("Invalid password");
    }

    const hashPass = await bcrypt.hash(newPassword, 10);

    const sql = `
      UPDATE users
      SET password = $1,
          verification_code = NULL,
          verification_code_expires = NULL
      WHERE verification_code = $2
      RETURNING *
    `;

    const { rows } = await query(sql, [hashPass, code]);
    return rows[0];

  } catch (err) {
    console.error("changePass error:", err);
    throw err;
  }
};



//get user by email
export const userByEmail =async(email)=>{
    try{
        const {rows}= await query(`SELECT * FROM users WHERE email= $1`,[email])
        return rows[0]

    }catch(err){
        console.error(err);
        
    }
}

//insert otp for  verification 
export const insertOtp = async (code, email) => {
    try {
        const sql = `
            UPDATE users
            SET verification_code = $1
            WHERE email = $2
            RETURNING *;
        `;
        
      
        const { rows } = await query(sql, [code, email]); 
        
        return rows[0]; 

    } catch (err) {
        console.error("Database Error in insertOtp:", err);
        throw err; 
}


}
