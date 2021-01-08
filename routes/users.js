const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const config = require('config')
const { body, validationResult } = require('express-validator');

const User = require('../models/User')

//@route  POST api/users
//@desc   Register a user
//@access Public
router.post('/', [
  body('name', 'Please add name').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    
    //if there is no error
    const { name, email, password } = req.body
    
    //check if the user sent exists or not
    try {
      let user = await User.findOne({ email: email }) //you can write findOne({email})
      
      if (user) {
        return res.status(400).json({msg: 'User already exists'})
      }

      //there it is not there, create a new one
      user = new User({
        name: name, 
        email: email, 
        password: password
      })

      //then encrypt the password

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt)

      await user.save()

      // Now we got the user saved in the database, we need to use Jsonwebtoken to send
      // back a token to the front-end 
      // firstly, is the object we want to send in the token
      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        "secret",
        // config.get('jwtSecret'),
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err;
          res.json({token: token})
        }
      )
      
    } catch (error) {
      console.log(error.message); //for us only, not for user
      res.status(500).json('Server Error')
    }
})

module.exports = router