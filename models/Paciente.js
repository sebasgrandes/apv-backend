import mongoose from "mongoose";
import Veterinario from "./Veterinario.js";

const pacienteSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
        },
        propietario: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        fecha: {
            type: Date,
            required: true,
            default: Date.now(),
        },
        sintomas: {
            type: String,
            required: true,
        },
        veterinario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Veterinario,
        },
    },
    { timestamps: true }
);
/*
- en la propiedad veterinario..
. el type es objectid que es el tipo de dato especial usado por mongodb para identificadores unicos (a cada coleccion en una coleccion). al usar esto indicamos que el valor de la propiedad veterinario será un identificador unico que hace referencia a otro documento en la db
. el ref se usa para indicar a que modelo se refiere el objectid. basicamente le decimos que hay una relacion entre el documento actual (de pacienteSchema) y un documento de la coleccion Veterinario
entonces, la propiedad veterinario esta configurada para almacenar un objectid que hace referencia a un documento especifico en la coleccion Veterinario

*/

const Paciente = mongoose.model("Paciente", pacienteSchema);

export default Paciente;
