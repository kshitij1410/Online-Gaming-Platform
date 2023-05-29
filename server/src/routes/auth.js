import express from 'express';
import { register, logout, login, getTournamentScore,getCoin,updateCoin,addScore,getScore, getSummary } from '../controller/auth.js';

const router = express.Router();

router.get('/',(req,res)=> res.send("hello to the server"))
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.post('/getCoin',getCoin);
router.patch('/updateCoin',updateCoin);
router.get("/getTournamentScore",getTournamentScore);
router.post('/getScore',getScore)
router.post('/addScore',addScore);
router.post('/getSummary',getSummary);



export default router;