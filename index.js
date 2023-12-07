// cuando importas dependencias que instalas no requieres la extension
import express from "express";
// cuando importas archivos que instalas si requieres la extension
import conectarDB from "./config/db.js";
// importamos el modulo dotenv
import dotenv from "dotenv";
// importamos nuestro routing (lo que exporté originalmente se llama "router", pero puedo importarlo con el nombre que quiera)
import veterinarioRoutes from "./routers/veterinarioRoutes.js";
import pacienteRoutes from "./routers/pacienteRoutes.js";
import cors from "cors";

// creamos la instancia de la aplicacion express
const app = express();

// Habilitar el middleware (para todas las rutas) express.json() para analizar las solicitudes entrantes que estan en formato JSON...
// es decir, analiza el JSON entrante y lo convierte en un objeto javascript... para así poder por ejemplo imprimirlo en consola, realizar destructuing, o realizar operaciones con esto
app.use("/", express.json());

// llamamos al metodo config de dotenv... este método lee las variables de entorno desde el archivo .env y las agrega al objeto process.env, que es un objeto global en Node.js donde puedes acceder a las variables de entorno.
dotenv.config();

// conectamos la aplicacion con la base de datos MongoDB usando Mongoose
conectarDB();

// configuramos nuestro cors
const dominiosPermitidos = [process.env.FRONTEND_URL];
const corsOptions = {
    // la funcion origin se llama cada que se realiza una soli al servidor
    origin: function (origin, callback) {
        // toma 2 arg: 1. origin que es la url desde la que se (originó) está solicitando el acceso, 2. callback que es una funcion que se debe llamar para indicar si la solicitud es aceptada o no.

        // verificamos si el origin de mi soli (mi url desde la que estoy solicitando el acceso) está en el arreglo de los dominios permitidos... (si no esta, indexOf retorna -1)
        if (dominiosPermitidos.indexOf(origin) !== -1) {
            // entonces el origen del request está permitido
            /* 1. "null" indica que no hubo errores 2. "true" indica que la soli es aceptada */
            callback(null, true);
        } else {
            callback(new Error("El origen no está permitido"));
        }
    },
};

// aplicamos el middleware cors a todos los endpoints (rutas y metodos) de la aplicacion
app.use(cors(corsOptions));

// ! importante
app.use("/api/veterinarios", veterinarioRoutes);
app.use("/api/pacientes", pacienteRoutes);

// si no existe mi variable de entorno entonces aplica el puerto 4000
// process.env. es sintaxis de nodejs y es la forma en la que accedemos al valor de la variables de entorno PORT almacenada en el objeto global process.env
// * cada que modifiques tus variables de entorno debes parar y correr el servidor con npm run dev de forma manual
const PORT =
    process.env.PORT ||
    4000; /* la variable de entorno existirá una vez que hagamos el deployment en un servidor especializado para nodejs */

app.listen(PORT, () => {
    console.log(`El servidor backend está funcionando en el puerto ${PORT}`);
});
