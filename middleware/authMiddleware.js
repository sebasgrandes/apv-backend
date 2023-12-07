import jwt from "jsonwebtoken";
import Veterinario from "../models/Veterinario.js";

// - autenticando el usuario
const checkAuth = async (req, res, next) => {
    let token;
    // las cabeceras proporcionan info adicional sobre la solicitud http, como el tipo de contenido, longitud, autenticación, etc.
    // bearer es un metodo comun para enviar un token de acceso, como un jwt, en las solicitudes http
    // req.headers.authorization... en los headers del req se tiene "authorization", cuyo valor es "Bearer " + el token de jwt que enviamos mediante postman
    // revisamos si mi token existe y si este comienza con bearer
    // console.log(req.headers.authorization);
    // * que inicie el token con "Bearer" es una convencion
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // console.log("Si tiene el token con Bearer");
            // jalo mi token del req.headers.authorization
            token = req.headers.authorization.split(" ")[1];

            // verificamos la autenticidad y validez del token (o sea si no fue alterado)... esto lo hace comparando la firma que esta en el token recibido con una nueva firma que se genera apartir del payload de este mismo token y la clave secreta (o publica)... si las firmas coinciden, entonces es autentico
            // token es el jwt que deseo verificar... es el recibido desde el cliente a través del encabezado de autorizacion de una soli http. // process.env.JWT_SECRET es la clave secreta usada para firmar el token cuando se creó
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decoded); /* me devuelve el token decodificado (en mi caso codifiqué el id) y mas cositas... o sea el payload decodificado del jwt */
            // extraemos el usuario a través del id del token decodificado
            // no olvides el await... porque sino no manejaras la promesa
            // añadimos una propiedad personalizada a mi objeto req... para poder (en cualquier middleware posterior) acceder luego a req.veterinario y obtener la informacion del veterinario
            // lo almacenamos en el req porque esta representa mi soli http entrante... y al agregar info adicional al req... podemos en cualquier middleware que se ejecute despues (por ejemplo en perfil imagino) tener esa info disponible
            // el objeto req representa la soli entrante que contiene info como parametros de la url, cuerpo de la soli, headers, etc... en un flujo tipico de middlewares, este objeto pasa a través de varios middlewares, permitiendo que cada uno lea o modifique la info... mientras que res se usa al final del flujo de procesamiento para enviar una rpta al cliente
            // lo almacenamos en req para mantener y pasar datos a lo largo de la cadena de middlewares porque representa la soli en curso y sus datos asociados
            // res se usa para construir y enviar la respuesta de que la soli ha sido completamente procesada
            // ! hasta aqui ya se verificó que el token es valido...y decoded.id retornara el id del veterinario que ha accedido
            // sin embargo... aqui jalo todas las propiedades de mi veterinario
            // ! con su id o en este caso, con sus propiedades casi completas... puedo posteriormente, en la pag de perfil por ejemplo desplegar sus datos. también en las paginas de pacientes puedo obtener los pacientes filtrandolos por aquellos QUE PERTENECEN EXCLUSIVAMENTE A ESTE VETERINARIO... ya sea por el id o por sus datos casi completos que extraje en el codigo posterior
            // * imaginalo como que en mi router para dicha ruta /perfil al hacer un get recibes el req, y este pasa a través de todos los middlewares (pudiendo agregarseles variables como mi veterinario) hasta el ultimo
            req.veterinario = await Veterinario.findById(decoded.id).select(
                "-password -token -confirmado"
            );
            // gracias al next pasa al siguiente middleware... pero eso no asegura que no se siga ejecutando codigo posterior, por ello usamos el return... para detener la ejecución del codigo posterior
            return next();
        } catch (error) {
            // caeria aqui si hay un error en la decodificacion o comparacion por ejemplo
            // console.log(error);
            const er = new Error("Token no valido");
            // si no pones el return se seguirá ejecutando el codigo posterior
            return res.status(403).json({ msg: er.message });
        }
    }
    // si no hay un token (se queda vacio)...
    // caeria en este caso si no se cumple alguno de los casos del if anterior. porque dentro del if anterior es en donde asignamos un valor a la variable "token"
    if (!token) {
        const error = new Error("Token no valido o inexistente");
        res.status(403).json({ msg: error.message });
    }
    next();
};

export default checkAuth;
