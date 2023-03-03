exports.catchAsync = fn => {
  return (req, res, next) => {
    //* Esta siguiente linea es la magia, si hay error cae a la pila de errores (que seria la funcion globalHandleErrors)
    fn(req, res, next).catch(
      next // PASAREMOS ESTE ERROR A LA PILA DE ERRORES CON EL NEXT. //! "err => next(err)" es resumido por "next"
    );
  };
};
