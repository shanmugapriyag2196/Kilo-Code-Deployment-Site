import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err.stack);

  if (err.name === "PrismaClientKnownRequestFailed") {
    return res.status(409).json({ error: "Database constraint violation" });
  }

  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { message: err.message }),
  });
}
