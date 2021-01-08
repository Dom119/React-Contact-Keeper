const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const config = require('config')
const { body, validationResult } = require('express-validator');

//anytime we need to protect a route, we need to bring in the middleware
const auth = require('../middleware/auth.js')

const User = require('../models/User')
//@route  GET api/auth
//@desc   Get logged in user
//@access Private
//Get the ID from the token
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    // const user = await User.findById(req.user.id)
    res.json(user)
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error')
  }
})

//@route  POST api/auth
//@desc   Auth user and get token
//@access Public
//when user enter the username and password and try to login
router.post('/', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
],async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email })

    if (!user) return res.status(400).json('Invalid Credentials')

    //now the user exist based on email, we need to check the password, which need to use bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json('Password does not match');

    //now password matches, we need to Json web token
    const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        // config.get('jwtSecret'),
        "secret",
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err;
          res.json({token: token})
        }
      )
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server Error')
  }
  
})

module.exports = router