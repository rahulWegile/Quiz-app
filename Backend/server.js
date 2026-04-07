import express from 'express'
import cors from 'cors'
import query from "./database/db.js"
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import questionsRoutes from './routes/questions.routes.js'
import subjectRoutes from './routes/subjects.routes.js'
import topicRoutes from './routes/topics.routes.js'
import adminRoutes from './routes/admin.routes.js'
import quizRoutes from './routes/quiz.routes.js'
import { payment, stripeWebhook } from './controllers/payment.controller.js'
import { verifyToken } from './middlewares/auth.middleware.js'



import dotenv from 'dotenv'
dotenv.config()

const app = express()

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://10.255.2.8:3000",
        "http://192.168.29.219:3000",
        "http://192.168.29.219:3000",

    ],
    credentials: true
}))

app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook)


app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.post('/api/payment', verifyToken, payment)

app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', questionsRoutes)
app.use('/api', subjectRoutes)
app.use('/api', topicRoutes)
app.use('/api', adminRoutes)
app.use('/api', quizRoutes)

const connect = async () => {
    const result = await query(`SELECT version()`)
    console.log(result.rows[0].version)

    const PORT = process.env.PORT || 4000
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`app running on port: ${PORT}`)
    })
}

connect()