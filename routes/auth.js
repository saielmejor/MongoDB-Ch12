const path = require('path');

const express = require('express');
const {check}=require('express-validator')
const authController=require('../controllers/auth')

const router = express.Router(); 

router.get('/login',authController.getLogin) 
router.get('/signup',authController.getSignup)
router.get('/reset',authController.getReset)
router.get('/reset/:token',authController.getNewPassword) // gets a token dynamically
router.post('/reset',authController.postReset)
router.post('/login',authController.postLogin)
router.post('/signup',check('email').isEmail().withMessage('Please enter a valid email').custom((value,{req})=>{ 
    if(value==='test@gmail.com'){ 
        throw new Error('This email is forbidden')
    }
    return true; 
}),authController.postSignup) 
router.post('/logout',authController.postLogout) 
router.post('/new-password',authController.postNewPassword)  
module.exports=router  