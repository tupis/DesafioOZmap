/* eslint-disable @typescript-eslint/no-explicit-any */
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

export function validationMiddlewareDto(dtoClass: any): any {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const formattedErrors = errors.map((err) => ({
        field: err.property,
        errors: Object.values(err.constraints || {}),
      }));

      return res.status(400).json({
        statusCode: 400,
        message: "Validation failed",
        errors: formattedErrors,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    next();
  };
}
