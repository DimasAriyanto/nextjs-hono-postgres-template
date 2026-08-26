import { Hono } from 'hono';
import { articleCategoriesController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { checkPermission } from '@/server/http/middlewares/permission';
import { createArticleCategoryRequest, updateArticleCategoryRequest } from '@/server/http/validators/article-categories.validator';

// Categories are managed from within the Article admin screen, so they ride on the
// existing article permissions rather than a separate permission key.
const requireArticleView = checkPermission('menu.article.view');
const requireArticleManage = checkPermission('menu.article.manage');

export const articleCategoriesRoutes = new Hono()
	.use(auth)
	.get('/', requireArticleView, articleCategoriesController.index)
	.get('/:id', requireArticleView, articleCategoriesController.show)
	.post('/', requireArticleManage, createArticleCategoryRequest, articleCategoriesController.create)
	.put('/:id', requireArticleManage, updateArticleCategoryRequest, articleCategoriesController.update)
	.delete('/:id', requireArticleManage, articleCategoriesController.delete);
