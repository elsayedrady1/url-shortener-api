import { NextFunction, Request, Response } from "express";

export default function (req: Request, res: Response, next: NextFunction) {
    if(!req.headers['authorization']) res.status(401).send('You are not authorized to access this route!')

    if (req.headers['authorization'] === process.env.AUTH_TOKEN) {
        next();
    } else {
        res.status(403).send('You are forbidden from accessing this route!')
    }
}