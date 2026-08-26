const express = require('express');
const { getTags, getTagPosts } = require('../controllers/tagController');

const router = express.Router();

router.get('/', getTags);
router.get('/:slug/posts', getTagPosts);

module.exports = router;
