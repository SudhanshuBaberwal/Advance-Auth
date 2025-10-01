import jsonwebToken from "jsonwebtoken"

export const verifyToken = (req , res , next) => {
    const token = req.cookies.token;  // we save cookie in browser with name cookie
    if (!token) {
        return res.status(400).json({
            success : false,
            message : "Unauthorized - No token provided"
        })
    }
    try {
        const decoded = jsonwebToken.verify(token , process.env.JWT_SECRET)
        if (!decoded){
            return res.status(400).json({
                success : false,
                message : "Unauthorized - Invalid Token"
            })
        }
        req.userId = decoded.userId;
        next()
    } catch (error) {
        console.log("Error in verifyToken function : " , error)
        return res.status(400).json({
            success : false,
            message : "Server Error"
        })
    }
}