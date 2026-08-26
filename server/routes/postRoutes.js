const express = require('express');
const {
  getPosts,
  getMyPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPosts);
router.get('/mine', protect, getMyPosts);
router.post('/', protect, createPost);
router.get('/:slug', optionalAuth, getPostBySlug);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
