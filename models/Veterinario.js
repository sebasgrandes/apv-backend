import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generarId from "../helpers/generarId.js";

// - definimos nuestro squema... que define la estructura de documentos dentro de la coleccion mongoDB
// omitiendo el campo "require" ya le decimos que es "false" o no requerido.
// default es el valor por defecto si no se pasa alguno para el campo... si omitimos el "default: null" en un "require: false", el campo no se incluira en el documento guardado.
// el id no lo añadioms porque mongodb por defecto ya lo añade
const veterinarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        require: true,
        trim: true,
    },
    password: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true,
    },
    telefono: {
        type: String,
        default: null,
        trim: true,
    },
    web: {
        type: String,
        default: null,
    },
    token: {
        type: String,
        default: generarId(),
    },
    confirmado: {
        type: Boolean,
        default: false,
    },
});

// antes (pre) del evento "save" (almacenar) en documentos creados del esquema veterinarioSchema... los hasheamos
// pre es un middleware, en este contexto, significa una funcion que se ejecuta entre el inicio y el final de una solicitud en una aplicacion (por ejemplo antes o despues de guardar, validar, eliminar, etc.)
// usamos .pre en el esquema porque este esquema define la estructura y reglas (incluyendo middlewares) de los datos... mientras que el modelo se utiliza para crear y manejar documentos individuales. de esta manera nos aseguramos de que todos los documentos creados a partir de modelos basados en este esquema sigan las mismas reglas y comportamientos definidos
// usamos function porque en este caso this hará referencia al objeto actual... si usaramos arrow function this haría referencia al objeto global
veterinarioSchema.pre("save", async function (next) {
    // si mi password ya está hasheado (modificado)... no lo vuelvas a hashear. porque sino ya no se podrá autenticar mi usuario
    if (!this.isModified("password")) {
        // pasa al siguiente middleware (porque aqui ya terminaste)
        next();
    }
    // .this hace referencia al objeto actual (documento) que se va a almacenar (antes de que se almacene)
    // console.log(this);
    // - generamos el salt para la encriptacion
    // el salt es una cadena aleatoria que se añade a la contraseña antes de su encriptacion, en nuestro caso el cost factor es 10, y determina la complejidad de generacion del salt
    const salt = await bcrypt.genSalt(10);
    // - encriptamos la contraseña
    // la encriptamos con bcrypt.hash usando el salt generado
    // this.password -> guardamos la contraseña encriptada en el campo password de nuestro documento actual
    this.password = await bcrypt.hash(this.password, salt);
    // no tienes que almacenar nada (con .save por ejemplo)... porque solo estamos modificando antes que se almacene
});

// con .methods agregamos un método (personalizado) llamado comprobarPassword a los métodos disponibles en el esquema veterinarioSchema
// passwordFormulario representa la contraseña con la que se quiere comparar con la almacenada en la db
// ! creamos .methods.comprobarPassword en el esquema y no en el modelo. porque los esquemas definen la estructura y reglas de los datos para una coleccion especifica en mongoDB
veterinarioSchema.methods.comprobarPassword = async function (
    passwordFormulario
) {
    // .compare de la biblioteca bcrypt permite comparar una contraseña sin encriptar con una encriptada
    // this se refiere al documento actual basado en el esquema veterinarioSchema
    // this.password es la contraseña encriptada del documento de la db
    return await bcrypt.compare(passwordFormulario, this.password);
    // retorna true o false
};

// - creamos nuestro modelo a partir del esquema definido
// de esta manera también creo mi coleccion (en mi db) llamada "veterinarios" por la pluralizacion del nombre de mi modelos definido en mi .model
// ! un modelo 1. representa una colección en la base de datos y 2. define la forma (esquema o estructura) de los documentos dentro de esa colección.
const Veterinario = mongoose.model("Veterinario", veterinarioSchema);

export default Veterinario;
