import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {generateVerificationCode} from "../utils/generateVerificationCode.js"
import {generateTokenAndSetCookie} from "../utils/generateTokenAndSetCookir.js"
import  {sendVerificationEmail}  from "../mailtrap/email.js";
import {sendWelcomeEmail} from "../mailtrap/email.js"

export const signup = async (req , res) => {
    const {email , password , name } = req.body;
    try {
        if (!email || !password || !name){
            throw new Error("All fileds are required")
        }

        const userAlreadyExists = await User.findOne({email});
        if (userAlreadyExists){
            return res.status(400).json({success : false, message : "User already exist"})
        }

        const hashedPassword = await bcrypt.hash(password , 10);
        const verificationCode = generateVerificationCode();
        const user = new User({
            email,
            password : hashedPassword,
            name,
            verificationToken : verificationCode,
            verificationTokenExpiresAt : Date.now() + 24 * 60 *60 * 1000
        })
        await user.save();

        //jwt
        generateTokenAndSetCookie(res,user._id);
        await sendVerificationEmail(user.email , verificationCode);

        res.status(201).json({
            success : true,
            message : "User Created Successfully",
            user : {
                ...user._doc,
                password : undefined
            },
        });
    } catch (error) {
        console.log(error.message)
        res.status(400).json({success : false , message : error.message})
    }
}

export const verifyEmail = async (req , res) => {
    // 1 2 3 4 5 6
    const {code} = req.body;
    try {
        const user = await User.findOne({
            verificationToken : code,
            verificationTokenExpiresAt : {$gt : Date.now()}
        })

        if (!user){
            return res.status(400).json({
                success : false,
                message : "Invalid or expires verification code"
            })
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        await sendWelcomeEmail(user.email , user.name);

        res.status(200).json({
            success : true,
            message : "Email verified successfully",
            user : {
                ...user.doc,
                password : undefined
            }
        })
    } catch (error) {
        
    }
}


export const login = async (req , res) => {
    res.send("login route")
}


export const logout = async (req , res) => {
    res.send("logout route")
}