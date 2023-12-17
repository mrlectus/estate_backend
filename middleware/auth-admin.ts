import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { JWT_SECRET_ADMIN } from '../configs/config.js';

const AdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, `${JWT_SECRET_ADMIN}`, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: 'Unauthorized' });
      } else {
        req.admin = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default AdminAuth;
