const express = require('express')
const connectDB = require('./config/db')
const path = require('path')
const PORT = process.env.PORT || 5000;

const app = express();

//connect Database
connectDB();

//init Middleware
app.use(express.json({ extended: false }))

//define our Routes
app.use('/api/users', require('./routes/users'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/contacts', require('./routes/contacts'))

// app.listen(PORT, () => console.log(`Server started on ${PORT}`))

// Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
  // set static folder
app.use(express.static('client/build'))
  .get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')))
  .listen(PORT, () => console.log(`Server started on ${PORT}`))
// }


