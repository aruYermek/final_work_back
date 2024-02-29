const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 3000 || process.env.PORT;

app.use(express.static(__dirname + '/public'));

//DB connection
const connectDB = require('./config/db.js');
connectDB();

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
