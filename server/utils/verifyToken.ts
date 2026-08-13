import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserType } from '../types/types';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(' ')[1];
		jwt.verify(
			token,
			process.env.JWT_SEC as string,
			(err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
				if (err) return res.status(403).json('Token is not valid!');

				req.user = decoded as UserType;
				next();
			}
		);
	} else {
		return res.status(401).json('You are not authenticated!');
	}
};

export { verifyToken };
