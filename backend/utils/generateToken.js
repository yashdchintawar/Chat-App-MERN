import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d' // expires in 15 days
    });
    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // days * hours * minutes * seconds * miliseconds 
        httpOnly: true,
        sameSite : "strict",
        secure : process.env.NODE_ENV !== "development",
    });
}

export default generateTokenAndSetCookie;