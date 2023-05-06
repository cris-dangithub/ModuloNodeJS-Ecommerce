const bcryptjs = require('bcryptjs');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const { appSuccess } = require('../utils/appSuccess');
const { catchAsync } = require('../utils/catchAsync');
const { generateJWT } = require('../utils/jwt');
const { ref, uploadBytes } = require('firebase/storage');
const { storage } = require('../utils/firebase');

exports.createUser = catchAsync(async (req, res, next) => {
  console.table(req.body);
  console.log(req.file);

  const { username, email, password, role } = req.body;
  // Creación de una constante con la referencia
  /*
    En la ruta lo que hace es crearse una carpeta user y acá se almacenarán todas
    las imágenes de nuestros usuarios (en la aplicación de firebase, en la app).
    El nombre que tendrá será el mismo nombre  la hora de yo subirlo (mediante el req.file.originalname).
    El Date.now nos servirá para evitar que los archivos se reemplacen si tienen 2 nombres iguales.

  */
  const imgRef = ref(storage, `user/${Date.now()}-${req.file.originalname}`);
  // Subimos la imagen a Firebase mediante uploadByes
  const imgUploaded = await uploadBytes(imgRef, req.file.buffer);

  // 1. Crear instancia de la clase User con la información que viene por el body
  const user = new User({
    username,
    email,
    password,
    role,
    profileImageUrl: `${imgUploaded.metadata.fullPath}`,
  });

  // 2.1 Encriptacion de la contraseña. Primero generaremos los saltos
  /*
    salt permitirá hacer encriptación en saltos (es decir, que si le
    digo que me haga saltos de 3, me enciptará 1 vez, luego lo que encripte
    vuelve a encriptar, y así).

    genSalt es para generar la salt y hay 2 tipos: genSalt y genSaltSync. Debemos
    usar el genSalt pues debemos mantenernos en codigo asincrono. Se debe poner
    como argumentos los saltos a realizar. Lo máximo recomendado son 12 saltos, y
    lo minimo 10 saltos (no aconseja otros valores por abajo o por encima de estos)
  */
  const salt = await bcryptjs.genSalt(10);
  // 2.2 Generaremos contraseña encriptada
  /*
    hash le pasamos: contraseña del rest.body
    Le asignare la encriptacion de la contrasñea que recibo de la req.body y la 
    cantidad de saltos que genera esa contraseña
  */
  user.password = await bcryptjs.hash(password, salt);

  // 3. Guardar en la base de datos con las contraseñas encriptadas
  await user.save();

  // 4. Generar el jwt
  /*
    Le mandamos el id del usuario que ya se creó en el punto 3
  */
  const token = await generateJWT(user.id);
  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    token,
    // Debo mandar ciertas cosas de user, NO MANDAR TODO EL USER
    /*
      Esto debido a que se mandan cosas importantes como el
      password (así esté encriptado), y otras cosas innecesarias como la creación
      del usuario.
    */
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // 1. Desestructurar email y password del body
  const { email, password } = req.body;
  // 2.1 Verificar la existencia del usuario y que password sea correcto
  /*
    Mirar si tenemos algun middleware en la ruta de user.
  */
  const user = await User.findOne({
    where: {
      email: email.toLowerCase(),
      status: true,
    },
  });
  if (!user) {
    return next(new AppError('The user could not be found', 404));
  }
  // 2.2 Verificar que el password sea correcto
  /*
    .compare() me compara contraseñas que están encriptadas y me dice si es correcto o no
    Esto devolverá un true o un false, si son iguales devuelve true.

  */
  if (!(await bcryptjs.compare(password, user.password))) {
    // Si no son iguales: Contraseñas no son corDrectas
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. Si todo está bien, enviar token al cliente
  /*
    Generaremos un token con la función creada para esto
  */
  const token = await generateJWT(user.id);
  const objExtras = {
    id: user.id,
    name: user.username,
    email: user.email,
    role: user.role,
  };
  return appSuccess(res, 200, undefined, { token, user: objExtras });
});

// Genera un nuevo token al usuario en sesión
exports.renewToken = catchAsync(async (req, res, next) => {
  // 1. Obtener el id del usuario en sesión
  const { id } = req.sessionUser;

  // 2. Generar nuevo token
  const token = await generateJWT(id);

  // 3. Buscar el usuario (Este será el mismo del sessionUser, asi que no es obligatorio este paso)
  const user = await User.findOne({
    attributes: ['id', 'username', 'email', 'role'],
    where: {
      id,
      status: true,
    },
  });

  // 4. Enviar respuesta al cliente
  return appSuccess(res, 200, undefined, { token, user });
});
