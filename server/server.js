import express, {json} from 'express'
import cors from 'cors'
import session from 'express-session'
import cookieParser from "cookie-parser";
import {config} from 'dotenv'
import spotifyRouter from './spotifyRoutes.js'
import youtubeRouter from './ytRoutes.js';
config()

const app = express()
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:5173', 'http://127.0.01:5173', 'http://localhost:5173/:5173', 'http://localhost:5173/'],
    credentials: true, 
    methods: ['GET', 'POST', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(json())
app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    },
}));
app.use('/', spotifyRouter)
app.use('/', youtubeRouter)

app.get('/favicon.ico', (req, res) => res.status(204))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});