import mongoose from "mongoose"; /* Importamos la biblioteca de Mongoose que proporciona una forma sencilla de conectarse a tu base de datos MongoDB y trabajar con tus datos */
// * cada que modifiques tus variables de entorno debes parar y correr el servidor con npm run dev de forma manual

// funcion que se usará para establecer la conexión con la base de datos
const conectarDB = async () => {
    try {
        // con mongoose.connect creamos una conexion entre la aplicacion node.js y la instancia de db de mongo DB... esto permitira que la aplicacion interactúe con la db para realizar operaciones CRUD
        const db = await mongoose.connect(process.env.MONGO_URI);
        // parece que los use del segundo argumento de mongoose.connect ya no son necesarios

        // Construimos una URL usando la host y el puerto de la conexión establecida.. para despues imprimirla
        const url = `${db.connection.host}:${db.connection.port}`;

        console.log(`MongoDB conectado en: ${url}`);
    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(
            1
        ); /*  terminar el proceso con un estado de salida '1', que indica que el proceso terminó debido a un error */
    }
};

export default conectarDB;
