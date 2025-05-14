const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const multer = require('multer');

const upload = multer();

// Public
router.post('/login', authController.loginUser);

// Admin-only
router.post('/register', auth,upload.none(), authController.registerUser);

module.exports = router;
