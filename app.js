require('dotenv').config();
// 1. importamos el modelo
const Server = require('./models/server');

// 2. Instaciamos la clase
const server = new Server();

//3. Ponemos a escuchar la clase
server.listen();
