import { Router } from 'express';
import { PostsController } from '../controllers/PostsController';

const router = Router();
const postsController = new PostsController();

router.get('/', (req, res) => postsController.getAllPosts(req, res));
router.get('/:id', (req, res) => postsController.getPostById(req, res));
router.post('/', (req, res) => postsController.createPost(req, res));
router.get('/:id/category', (req, res) => postsController.getPostCategory(req, res));
router.get('/categories/stats', (req, res) => postsController.getCategoryStats(req, res));

export default router;
