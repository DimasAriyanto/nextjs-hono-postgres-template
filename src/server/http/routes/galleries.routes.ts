import { Hono } from 'hono';
import { galleriesController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { checkPermission } from '@/server/http/middlewares/permission';
import { createGalleryRequest } from '@/server/http/validators/galleries.validator';

const requireGalleryView = checkPermission('menu.gallery.view');
const requireGalleryManage = checkPermission('menu.gallery.manage');

export const galleriesRoutes = new Hono()
	.get('/public', galleriesController.publicIndex)
	.get('/', auth, requireGalleryView, galleriesController.index)
	.post('/', auth, requireGalleryManage, createGalleryRequest, galleriesController.create)
	.delete('/:id', auth, requireGalleryManage, galleriesController.delete);
