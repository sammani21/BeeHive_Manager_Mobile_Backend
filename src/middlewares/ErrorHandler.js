const { StandardResponse } = require("../dto/StandardResponse");
const { NotFoundError } = require("../types/error/NotFoundError");

/**
 * Error handler middleware
 * @param {Error} err - The error object
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {function} next - The next middleware function
 */
const errorHandler = (err, req, res, next) => {
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode || 404).send({
      statusCode: err.statusCode || 404,
      msg: err.message,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const response = {
    statusCode: statusCode,
    msg: message
  };

  return res.status(statusCode).send(response);
};

module.exports = errorHandler;
