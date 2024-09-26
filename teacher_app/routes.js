const express = require('express');
const authContollers = require('../teacher_app/controllers/authContollers')
const router = express.Router();

router
  .route('/login')
  .post(authContollers.login);

module.exports = router;