import express from "express";
import {
    agregarPaciente,
    obtenerPacientess,
    obtenerPaciente,
    actualizarPaciente,
    borrarPaciente,
} from "../controllers/pacienteController.js";

import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// con "checkAuth" primero autenticamos mediante el token de jwt (jalamos el token generado para el veterinario) el cual decodificamos y buscamos el registro de dicho veterinario, el cual almacenamos el en req.veterinario... el cual se le pasa a agregarPaciente, en el que guardamos los datos del paciente, incluyendo su id que es el que proveniente del veterinario
// para obtener los pacientes también debes tener el usuario autenticado (con checkauth)
// ! el checkauth es necesario para saber que usuario se esta autenticando (si andrea o sebastian) y asi poder agregar pacientes a cada uno de ellos, u obtener los pacientes asignados a estos
// el "/" toma el .use de tu index.js definido para pacienteRoutes
router
    .route("/")
    .post(checkAuth, agregarPaciente)
    .get(checkAuth, obtenerPacientess);

router
    .route("/:id")
    .get(checkAuth, obtenerPaciente)
    .put(checkAuth, actualizarPaciente)
    .delete(checkAuth, borrarPaciente);

export default router;
