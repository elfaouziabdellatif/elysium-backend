const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const multer = require('multer');
const membershipController = require('../controllers/membership.controller');
const userController = require('../controllers/user.controller');
const seanceController = require('../controllers/seance.controller');

const upload = multer();

// Public
router.post('/login', authController.loginUser);

// Admin-only
router.post('/register', auth,upload.none(), authController.registerUser);
router.get("/dashboard/admin/analytics",auth, membershipController.getAdminDashboardCharts);
router.get('/dashboard/admin/users', userController.getUsersSummary);
router.put('/users/:id', auth, userController.updateUser);

// Seance routes
router.post('/seances', auth, seanceController.createSeance);
router.get('/seances', auth, seanceController.getAllSeances);
router.get('/seances/:id', auth, seanceController.getSeanceById);
router.get('/coach/seances', auth, seanceController.getCoachSeances);

// Member seance routes
router.get('/member/seances/available', auth, seanceController.getAvailableSeances);
router.post('/member/seances/:seanceId/reserve/:userId', auth, seanceController.reserveSeance);


module.exports = router;
