import Paciente from "../models/Paciente.js";

const agregarPaciente = async (req, res) => {
    const paciente = new Paciente(req.body);
    // req.veterinario es el objeto veterinario almacenado en req... esto se hizo en checkAuth, just ocuando se comprobo el token de autorizacion del veterinario
    paciente.veterinario = req.veterinario._id;
    try {
        // con .save lo almacenamos en la db como un documento
        const pacienteAlmacenado = await paciente.save();
        res.json(pacienteAlmacenado);
    } catch (error) {
        console.log(error);
    }
};
const obtenerPacientess = async (req, res) => {
    // ! el try catch es necesario (por si hay error en la db)
    try {
        // con find nos traemos todos pero con where equals filtramos aquellos pacientes cuya propiedad de veterinario es igual a la del veterinario de la autenticacion (req.veterinario)
        const pacientes = await Paciente.find()
            .where("veterinario")
            .equals(req.veterinario);

        res.json(pacientes);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al obtener los pacientes" });
    }
};

const obtenerPaciente = async (req, res) => {
    // hasta qui el checkauth cumple con verificar que el token sea valido... pero solo eso

    // del url obtenemos el id del paciente
    const { id } = req.params;
    // obtenemos el registro completo del paciente buscandolo por su id
    // ! el try catch es necesario porque puede que el .findById de arroje algun error (tanto si algo sale mal con la db o SI EL ID ESTÁ MAL FORMADO, no aplica un id incorrecto porque este retornaria null en el findbyid)
    try {
        const paciente = await Paciente.findById(id);
        // si no existe el paciente... puede no existir porque le pasamos un id invalido o incorrecto, en este caso findbyid retornaria un null (pero si le pasamos un id mal formado ahi si tiraria error y se iria al catch)
        if (!paciente) {
            res.status(400).json({ msg: "No encontrado" });
        }
        // console.log(paciente);
        // - comprobamos que el veterinario a cargo del paciente efectivamente es aquel que está ingresando a la url... porque puede que otro veterinario acceda a este link con el id
        // comprobamos que la propiedad veterinario (15435 pej) DEL PACIENTE... sea igual al id de veterinario (15435 pej) que accede a esta url (y se esta autenticando gracias al checkauth)
        // los convertimos a string para que dejen de ser ObjectId
        // console.log(paciente.veterinario.toString());
        // console.log(req.veterinario._id.toString());
        if (
            req.veterinario._id.toString() !== paciente.veterinario.toString()
        ) {
            return res.json({ msg: "Acceso invalido" });
        }

        res.json(paciente);
    } catch (error) {
        // por si no existe el id de la url en algun paciente...al usa findById dara error lo cual se pasa a esta linea
        console.log(error);
    }
};
const actualizarPaciente = async (req, res) => {
    try {
        // ! codigo para verificar que quien esta solicitando el request es el mismo que el que lo creó
        const { id } = req.params;
        const paciente = await Paciente.findById(id);
        if (!paciente) {
            res.status(400).json({ msg: "No encontrado" });
        }
        if (
            paciente.veterinario.toString() !== req.veterinario._id.toString()
        ) {
            return res.json({ msg: "Acceso invalido" });
        }
        // codigo para actualizar paciente
        const pacienteEdit = req.body;
        paciente.nombre = pacienteEdit.nombre || paciente.nombre;
        paciente.propietario = pacienteEdit.propietario || paciente.propietario;
        paciente.email = pacienteEdit.email || paciente.email;
        paciente.fecha = pacienteEdit.fecha || paciente.fecha;
        paciente.sintomas = pacienteEdit.sintomas || paciente.sintomas;

        const pacienteActualizado = await paciente.save();
        res.json(pacienteActualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al actualizar el paciente" });
    }
};
const borrarPaciente = async (req, res) => {
    try {
        // ! codigo para verificar que quien esta solicitando el request es el mismo que el que lo creó
        const { id } = req.params;
        const paciente = await Paciente.findById(id);
        if (!paciente) {
            res.status(400).json({ msg: "No encontrado" });
        }
        if (
            paciente.veterinario.toString() !== req.veterinario._id.toString()
        ) {
            return res.json({ msg: "Acceso invalido" });
        }
        // codigo para borrar paciente
        await paciente.deleteOne();
        res.json({ msg: "Paciente eliminado correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al eliminar el paciente" });
    }
};

export {
    agregarPaciente,
    obtenerPacientess,
    obtenerPaciente,
    actualizarPaciente,
    borrarPaciente,
};
