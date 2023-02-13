const express= require('express');
const router= express.Router();
const User= require('../models/user.js');
const mongodb=require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

//create
router.get('/users', async(req, res) => {
    try {
        const foundusers = await User.find({});
        res.status(200).json(foundusers);
        res.send(foundusers);
    } catch (error) {
        res.status(500)({message: error.message})
    }
})

// router.post('/reg', async(req,res)=>{
//      try {
//         const user= new User({
//             name:req.body.name,
//             email:req.body.email,
//             password:req.body.password,
//     })
//     const saveUser= await User.create(user);
//     res.status(200).json(saveUser);
//     console.log(" in /register");
//     res.send("user saved");
//     } catch (error) {
//         res.send("user couldn't be saved");
//         console.log(" didnt got in /register");
//     }
// });

router.post('/register', async(req, res) => {
//     try {
//         const unschemaUser= new User({
//             name: req.body.name,
//             email: req.body.email,
//             password: req.body.password
//         });
 //         const user = await User.create(unschemaUser)
//         res.status(200).json(user);
        
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).json({message: error.message})
//     }
// })

try{
    let {
        firstName,
        lastName,
        email,
        password
       } = req.body;
       //console.log(req.body.password);
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    password=passwordHash;
    const newUser= new User({
        firstName,
        lastName,
        email,
        password
        });
        console.log(password);
        
    const savedUser= await User.create(newUser);
    res.status(201).json(savedUser);
    //res.send(passwordHash+'user saved');
}
catch(err){
    res.status(500).json({error: err.message});
}});

router.put('/register/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndUpdate(id, req.body);
        // we cannot find any user in database
        if(!user){
            return res.status(404).json({message: `cannot find any user with ID ${id}`})
        }
        const updatedUser= await User.findById(id);
        res.status(200).json(updatedUser);
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
});

router.delete('/register/:id', async(req, res) =>{
    try {
        console.log({_id: new mongodb.ObjectId(req.params.id)});
         const {id} = req.params;
         const user = await User.deleteOne({_id: new mongodb.ObjectId(req.params.id)});
        // console.log({_id: new mongodb.ObjectId(req.params.id)});
        // if(!user){
         //    return res.status(404).json({message: `cannot find any user with ID ${id}`})
        // }
        res.status(200).json(user);
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
});

////token related stuff
let refreshTokens = []

router.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
})

router.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

router.post('/login', async (req, res) => {
    const {email, password} =req.body;
    const user = await User.findOne({email: email});
    if(!user) return  res.send('invaild email.');
    //res.status(400).json({msg:"User doesn't exist. "});

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.send('password is incorrect.'); 

//   const username = req.body.username
//   const user = { name: username }

  const accessToken = generateAccessToken({user})
  const refreshToken = jwt.sign({user}, process.env.REFRESH_TOKEN_SECRET)
  refreshTokens.push(refreshToken)
  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}



// router.post("/login", async(req,res)=>{
//     try {
//        const {email, password} =req.body;
//        const user = await User.findOne({email: email});
//        if(!user) return  res.send('Email doesnt exist');
//        //res.status(400).json({msg:"User doesn't exist. "});

//        const isMatch = await bcrypt.compare(password, user.password);
//        if(!isMatch) return res.send('password sapling rong'); 
//        //res.status(400).json({msg:"Invalid credentials. "});

//        const token=jwt.sign({id:user._id}, "hamza123");
//        delete user.password;
//        res.send('Log in sucksessful');
//        res.status(500).json({message: err.msg});
        
//     } catch (err) {
//         res.status(500).json({message: err.msg});
//         }
// });


module.exports=router;

