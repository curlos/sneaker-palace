import { UserType } from './types';
import Order from '../models/Order';

type OrderDocument = Awaited<ReturnType<typeof Order.findById>>;

declare global {
	namespace Express {
		interface Request {
			user?: UserType;
			order?: OrderDocument;
		}
	}
}

export {};
