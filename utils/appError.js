class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    // Indica el número de estado
    this.statusCode = statusCode;
    // Me indica el mensaje de estado que colocamos en la respuesta, y se pone según si es 4XX o 5XX
    this.status = `${statusCode}`.startsWith('4') ? 'error' : 'fail';
    // Estos errores que capturaremos serán errores operacionales:
    this.isOperational = true;
    // pila-stack de errores, y para ello
    Error.captureStackTrace(this, this.constructor);

  }
}

module.exports = AppError;
