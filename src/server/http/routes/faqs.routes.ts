import { Hono } from 'hono';
import { faqsController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { checkPermission } from '@/server/http/middlewares/permission';
import { createFaqRequest, updateFaqRequest } from '@/server/http/validators/faqs.validator';

const requireFaqView = checkPermission('menu.faq.view');
const requireFaqManage = checkPermission('menu.faq.manage');

export const faqsRoutes = new Hono()
	.get('/public', faqsController.publicIndex)
	.get('/', auth, requireFaqView, faqsController.index)
	.get('/:id', auth, requireFaqView, faqsController.show)
	.post('/', auth, requireFaqManage, createFaqRequest, faqsController.create)
	.put('/:id', auth, requireFaqManage, updateFaqRequest, faqsController.update)
	.delete('/:id', auth, requireFaqManage, faqsController.delete);
