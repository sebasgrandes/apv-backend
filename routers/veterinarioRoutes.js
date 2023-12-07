import express from "express";
// importamos los controladores
import {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword,
} from "../controllers/veterinarioController.js";

import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// un endpoint es un punto de acceso específico en una API o una aplicación web (direccion web) que permite a los clientes realizar operaciones o acceder a recursos de manera estructurada a través de Internet.

// ! area publica
// router para registrar al usuario en nuestra db
// esta es una ruta, también es un endpoint creo
router.post("/", registrar);

// router para que confirme su cuenta mediante el token
// le pasamos un parametro dinamico... por ejemplo si ingreso a .../confirmar/3 -> el 3 se le asigna al token y este puede leerse a través de req.params.token
router.get("/confirmar/:token", confirmar);

// router para autenticar el usuario (autenticar = comprobar la confirmación mediante token, comprobar correo y contraseña)
router.post("/login", autenticar);

/* leer el token */
// 1. pagina donde se entra y coloca su email (valida su email)
router.post("/olvide-password", olvidePassword);
// les llega un email... y 2. mediante el token (que le pasamos a su email creo) lo comprobamos y 3. le pedimos un nuevo password el cual almacenamos
// route es un objeto de express que permite definir rutas en el servidor... get maneja las solicitudes GET y post las de POST. son independientes y puedem ser llamadas en cualquier orden segun las acciones del usuario. aunque en un flujo tipico de usuario, la soli get ocurre antes de la post
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);

// ! area privada
// - en los siguientes routes se requiere la comprobacion de inicio de sesion... mientras que en los anteriores no, cualquiera puede acceder
// router para mostrar el perfil
// esta es otra ruta
// * "checkAuth" es mi middleware, es decir, este se ejecuta y cuando termina pasa al siguiente (gracias al next)... o sea "perfil". de esta manera por ejemplo podemos comprobar mediante jwt si el usuario tiene permiso de poder ver la pagina de perfil, si ya pago, etc.
router.get("/perfil", checkAuth, perfil);
router.put("/perfil/:id", checkAuth, actualizarPerfil);
router.put("/actualizar-password", checkAuth, actualizarPassword);

export default router;
