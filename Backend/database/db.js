import dotenv from "dotenv"
import{ Pool} from "pg"

dotenv.config()



const pool = new Pool({
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  password: String(process.env.DB_PASS),
  port: process.env.DB_PORT
})

pool.on("error", (err) => {
  console.error("db connection failed ", err)
})

const query = (text, params) => pool.query(text, params)

export default query