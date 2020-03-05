class CustomError extends Error
{
  constructor(message, status)
  {
    super()

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;

    this.message = message || "Database query error.";

    this.status = status || 500;
  }
}

module.exports =
{
  CustomError: CustomError
}
