import express from 'express';
import admin_router from './controller/admin/admin.js';
import { PORT } from './configs/config.js';
import cors from 'cors';
import user_router from './controller/admin/users.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));
app.use('/admin', admin_router);
app.use('/user', user_router);
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
