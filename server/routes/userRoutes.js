const express = require('express');
const { getUserProfile, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/me', protect, updateMe);
router.get('/:id', getUserProfile);

module.exports = router;
