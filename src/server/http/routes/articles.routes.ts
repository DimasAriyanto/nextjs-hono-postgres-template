import { Hono } from 'hono';
import { articlesController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { createArticleRequest, updateArticleRequest } from '@/server/http/validators/articles.validator';

export const articlesRoutes = new Hono()
	.get('/public', articlesController.publicIndex)
	.get('/public/:slug', articlesController.publicShow)
	.get('/', auth, articlesController.index)
	.get('/:id', auth, articlesController.show)
	.post('/', auth, createArticleRequest, articlesController.create)
	.put('/:id', auth, updateArticleRequest, articlesController.update)
	.delete('/:id', auth, articlesController.delete);
