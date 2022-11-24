const express = require("express");
const morgan = require("morgan");
const app = express();
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

// //! MIDDLEWARES //

app.use(morgan('dev'))

app.use(express.json());

app.use((req, res, next) => {
  console.log("Hello this is our middle ware")
  next();
})


//! SERVER //

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
