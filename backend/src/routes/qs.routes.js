import {Router} from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const qsRouter = Router();

// Routes import
import {uploadQs,approveQs, getAllQs, getAllPendingQs} from '../controllers/qs.controller.js';

// Routes
qsRouter.post('/upload',upload.fields([{name:'qs', maxCount:1 }]),verifyJwt,uploadQs);
qsRouter.post('/approve/:qsId',verifyJwt,approveQs);
qsRouter.get('/all',getAllQs);
qsRouter.get('/pending',getAllPendingQs);

export {qsRouter}