var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); 
require('dotenv').config({ path: ['.env.local', '.env'] });

const { connectToDB } = require('./config/mongo.connection');

// Route Imports
var indexRouter = require('./routes/index');
var carsRouter = require('./routes/cars.routes');
var userRoutes = require('./routes/users.routes');
var contactRouter = require('./routes/contact.routes'); 
var bookingRouter = require('./routes/bookings.routes'); // Corrected to match bookings.routes.js

var app = express();
const http = require('http');

// Middlewares
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/api/cars', carsRouter);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRouter); 
app.use('/api/messages', contactRouter); 
app.use('/api/bookings', bookingRouter); 

// Catch 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Error Handler
app.use(function(err, req, res, next) {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message
  });
});

const PORT = parseInt(process.env.PORT || '5000', 10);
connectToDB();

http.createServer(app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});