import { Hono } from 'hono';
import { articlesController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { createArticleRequest, updateArticleRequest } from '@/server/http/validators/articles.validator';

export const articlesRoutes = new Hono()
	.use(auth)
	.get('/', articlesController.index)
	.get('/:id', articlesController.show)
	.post('/', createArticleRequest, articlesController.create)
	.put('/:id', updateArticleRequest, articlesController.update)
	.delete('/:id', articlesController.delete);
