
const express = require('express');
const { signupUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

module.exports = router;
