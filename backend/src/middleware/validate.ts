import { Request, Response, NextFunction } from 'express';

// Reusable middleware factory — checks that required fields exist in req.body
// Usage: validate(['title', 'status'])
export const validate = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      });
      return;
    }

    next();
  };
};
