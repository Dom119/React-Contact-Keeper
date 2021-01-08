const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { body, validationResult } = require('express-validator');

const User = require('../models/User')
const Contact = require('../models/Contact')

//@route  GET api/contacts
//@desc   Get all users contacts
//@access Private - you have to be logged in
router.get('/',auth , async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({ date: -1 })
    res.json(contacts)
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error.')
  }
})

//@route  POST api/contacts
//@desc   Add new contact
//@access Private - you have to be logged in
router.post('/', [auth, [
  body('name', 'Name is required').not().isEmpty()
]],async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
    
  const { name, email, phone, type } = req.body;

  try {
    const newContact = new Contact({
      name: name,
      email: email,
      phone: phone,
      type: type,
      user: req.user.id
    })

    const contact = await newContact.save()

    res.json(contact)
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server Error')
  }
})

//@route  PUT api/contacts/:id
//@desc   Update contact
//@access Private - you have to be logged in
router.put('/:id', auth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  //build contact objects based on the req
  const contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try {
    let contact = await Contact.findById(req.params.id)
    if (!contact) return res.status(404).json({ msg: 'Contact not found' })
    
    //make sure user owns contact
    //so even token cannot protect here because they can make requests through like Postman ???
    //no it's simply we cannot change the information of others
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json('Not Authorized')
    }

    contact = await Contact.findByIdAndUpdate(req.params.id,
      { $set: contactFields },
      { new: true });
    
    res.json(contact)
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server Error')
  }
})

//@route  DELETE api/contacts/:id
//@desc   Delete contact
//@access Private - you have to be logged in
router.delete('/:id', auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id)
    if (!contact) return res.status(404).json({ msg: 'Contact not found' })
    
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json('Not Authorized')
    }

    await Contact.findByIdAndRemove(req.params.id)
    
    res.json({ msg: 'Contact removed' })
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json('Server Error')
  }
})

module.exports = router