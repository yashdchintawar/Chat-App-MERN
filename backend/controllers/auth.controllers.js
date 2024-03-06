import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "password don't match!" });
    }
    const user = await User.findOne({ username });
    if (user) {
      return res
        .status(400)
        .json({ error: "Username already exist please choose another!" });
    }

    // HASH Password
    const salt = await bcrypt.genSalt(10);
    const hashdPassword = await bcrypt.hash(password, salt);

    const maleProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const femaleProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = await User({
      fullName,
      username,
      password: hashdPassword,
      gender,
      profilePic: gender === "male" ? maleProfilePic : femaleProfilePic,
    });

    if (newUser) {
      //Genrate JWT Token
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullName,
        username: newUser.username,
        profilePic: newUser.profilePic,
      });
    } else {
      res.satatus(400).json({ error: "Invalid User Data!" });
    }
  } catch (error) {
    console.log("Internal server error", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const {username, password} = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error : "Invalid Username Or Passwrod" });
    };

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id : user._id,
      fullName : user.fullName,
      username : user.username,
      profilePic : user.profilePic,
    })


  } catch (error) {
    console.log("Internal server error", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge : 0});
    res.status(200).json({ message : "Successfully Logout" });    
  } catch (error) {
    console.log("Error In Logout Controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });    
  }
};
