const express = require('express');

const newsController = require('./../controllers/newsController');

const router = express.Router();

router.post('/', newsController.createNews);

module.exports = router;
