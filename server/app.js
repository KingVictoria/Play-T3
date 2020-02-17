const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index.js');
const cors = require('cors')

const app = express();

app.use(cors()) // Use this after the variable declaration
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', indexRouter);

// Render page
app.use(express.static(path.join(__dirname, "../")));
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

module.exports = app;