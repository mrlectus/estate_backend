import { Router } from 'express';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const user_router = Router();
const prisma = new PrismaClient();

user_router.get('/listings', async (_, res: Response) => {
  const users = await prisma.listing.findMany();
  res.json(users);
});

user_router.get('/listings/:id', async (req, res: Response) => {
  const { id } = req.params;
  const users = await prisma.listing.findUnique({
    where: {
      listing_id: id,
    },
  });
  res.json(users);
});

export default user_router;
