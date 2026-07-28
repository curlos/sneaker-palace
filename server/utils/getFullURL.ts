import { Request } from 'express';
import url from 'url';

export const getFullURL = (req: Request) => {
	return url.format({
		protocol: req.protocol,
		host: req.get('host'),
		pathname: req.originalUrl,
	});
};
