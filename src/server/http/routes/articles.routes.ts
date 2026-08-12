import { Hono } from 'hono';
import { articlesController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { checkPermission } from '@/server/http/middlewares/permission';
import { createArticleRequest, updateArticleRequest } from '@/server/http/validators/articles.validator';

const requireArticleView = checkPermission('menu.article.view');
const requireArticleManage = checkPermission('menu.article.manage');

export const articlesRoutes = new Hono()
	.get('/public', articlesController.publicIndex)
	.get('/public/:slug', articlesController.publicShow)
	.get('/', auth, requireArticleView, articlesController.index)
	.get('/:id', auth, requireArticleView, articlesController.show)
	.post('/', auth, requireArticleManage, createArticleRequest, articlesController.create)
	.put('/:id', auth, requireArticleManage, updateArticleRequest, articlesController.update)
	.delete('/:id', auth, requireArticleManage, articlesController.delete);
