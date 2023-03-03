// Acá generaremos el JSON Web Token
const jwt = require('jsonwebtoken');

// Crear una promesa
/*
  id: Será el id del usuario que recibirá por los parámetros
*/
exports.generateJWT = id => {
  // Creació de la promesa
  return new Promise((resolve, reject) => {
    // Creacion del payload (uno de los 3 componentes para generar el JWT)
    const payload = { id };
    // Firmar el token.
    /*
      Necesitaremos del payload y de una clave segura.
      Problema: Si nos llegan a ver el github, esto queda expuesto. Asi que debemos
      crear una variable de entorno para

      Usar small dev tools para Codificación en BASE64: https://smalldev.tools/base64-encoder-online

      sing recibe por 
      
    */
    jwt.sign(
      payload,
      process.env.SECRET_JWT_SEED,
      {
        // Crearemos tambien otra variable de entorno para determinar cuando expira el token
        /*
          El tiempo de expiración del token me determina. En el ejemplo, un fue al edificio
          y este le dio un token, entonces cuanto tiempo ese token va a estar activo. si se 
          acaba, lo que hara es sacarme y me tocaria logearme de nuevo a menos que haga algo que
          miraremos la otra clase.
        */
        expiresIn: process.env.JWT_EXPIRE_IN,
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(token);
      }
    );
  });
};
