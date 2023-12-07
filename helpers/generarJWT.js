import jwt from "jsonwebtoken";

// creamos una funcion expresion que crea un nuevo jwt y la exportamos para ser usada en veterinarioController
const generarJWT = (id) => {
    // console.log("jwt generado");
    // con .sign creamos un nuevo jwt
    // 1er argumento: es payload, es decir, el objeto que contiene los datos que se incluirán en el token (por ejemplo id, nombre, permisos, etc.). 2do arcumento: cavle secreta o privada, se utiliza para firmar el token y garantizar la seguridad (en mi caso usamos una variable de entorno). 3er argumento: opciones, en mi caso le coloco el tiempo de vida del token, despues de este periodo expira y deja de ser valido
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

export default generarJWT;
