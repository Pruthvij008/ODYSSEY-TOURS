const mongoose = require('mongoose');
//const express = require('express');
const dotenv = require('dotenv');
//video 123 last video of module
//handling or catching uncaught exception
//sir told to keep at top

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION');

  process.exit(1);
});
dotenv.config({ path: './config.env' });

const app = require('./app');

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true
  })
  .then(con => {
    console.log(`name of the database is ${con.connection.name}`);
    console.log('successfully connected to the database');
  });

//creating a schema

const portnumber = process.env.PORT || 3000;
const server = app.listen(portnumber, () => {
  console.log('app is running on the port 3000');
});
//video 122 handling the asynchronous errors
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION');
  server.close(() => {
    process.exit(1);
  });
});

//this is to test the catching uncaught error in video 123 in synchronous code
//console.log(x);
