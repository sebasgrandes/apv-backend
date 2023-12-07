import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {
    try {
        // imprimimos lo que recibimos por el metodo post... mediante el body de postman
        // req.body es la propiedad (del objeto req) que contiene los datos enviados desde un formulario o solicitud POST
        // req.body ahora es un objeto js gracias a que en mi index.js coloque el express.json()
        // console.log(req.body);

        // prevenir usuarios duplicados
        const { email } = req.body;
        // .findOne busca solo un documento en la coleccion Veterinario (que es lo que representa mi modelo) que coincida con el criterio especificado, en este caso, la propiedad email cuyo valor sea la de aquel del destructuring de arriba
        const existeUsuario = await Veterinario.findOne({ email });
        if (existeUsuario) {
            // creo una instancia de error con un mensaje
            const error = new Error("Usuario ya registrado - DESDE BACKEND");
            // con res.status(400) informamos al cliente que la solicitd que realizó tiene un problema. además le enviamos un mensaje de error en formato json
            res.status(400).json({ msg: error.message });
            return;
        }
        // console.log(`credenciales de: ${nombre}. ${email}, ${password}`);

        // Creamos una instancia del modelo
        // Crear una instancia del modelo significa crear un nuevo objeto que sigue la estructura (esquema o reglas) definida por el modelo
        // esta instancia la inicializamos con los datos de la solicitud
        // lo que despliega en consola es el objeto (definido a partir del modelo) con los datos colocados
        // en resumen: creamos un nuevo objeto que representa a un veterinario, usando los datos proporcionados en la soli HTTP (a través de req.body)
        const veterinario = new Veterinario(req.body);
        // console.log(veterinario);

        // utilizas save() para guardar ese objeto en la base de datos (como un documento)... y lo guardo en una variable para enviarlo en el "res"
        // lo desplegado en consola será lo mismo que lo anterior, solo que se añade una pequeña propiedad "__v" al final
        const veterinarioGuardado = await veterinario.save();
        // console.log(veterinarioGuardado);

        // * buen lugar para enviar un email de confirmacion (porque nos aseguramos de que el usuario se haya guardado en la db)
        emailRegistro({
            nombre: veterinarioGuardado.nombre,
            email: veterinarioGuardado.email,
            token: veterinarioGuardado.token,
        });

        // enviamos una respuesta en formato json. esta respuesta es un objeto que se convertirá a json
        // * al enviar una respuesta como res.json, estás informando al cliente que el registro del veterinario fue exitoso... esto es necesario para resolver la promesa que se ejecuta en el frontend
        // en la siguiente linea también estás proporcionando los detalles del veterinario recién registrado.
        // res.json(veterinarioGuardado);
        // * Si sólo quisieras mostrar un mensaje de éxito sin ningún detalle, podrías enviar una respuesta como esta:
        res.json({ msg: "Usuario registrado..." });
        // Es una práctica común en el desarrollo web asegurarse de que el servidor siempre envíe alguna forma de respuesta, ya sea un éxito, un error, o algún otro tipo de información relevante, para mantener el flujo de comunicación adecuado entre el cliente y el servidor.
    } catch (error) {
        // console.log(error);
        res.json({ msg: "Hubo un error, intentelo de nuevo" });
    }
};

const perfil = (req, res) => {
    // despues de haber pasado por la comprobacion del token de jwt y la decodificacion del id del usuario... ya tenemos almacenado en nuestro req el veterinario, por lo tanto lo extraemos
    const { veterinario } = req;
    res.json(veterinario);
    // console.log("asdasdasd");
    // res.json({ msg: "Mostrando perfil" });
};

// usando req.params.token para leer los parametros pasados a través de la url
const confirmar = async (req, res) => {
    const { token } = req.params;
    // console.log(token);
    // almacenamos en una variable aquel documento (de mi coleccion Veterinario, que es lo que representa mi modelo Veterinario) que cumple con la condicion de .findOne
    // usuarioConfirmar es un objeto (una instancia) que representa el documento que cumple con las condiciones establecidas. osea usuarioConfirmar es una instancia del documento
    const usuarioConfirmar = await Veterinario.findOne({
        token,
    });
    // console.log(usuarioConfirmar);
    if (!usuarioConfirmar) {
        const error = new Error(
            "El token del usuario no existe o ya fue confirmado"
        );
        res.status(400).json({ msg: error.message });
        return;
    }
    try {
        // modificamos la instnacia del documento (o sea el objeto)
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        // llamamos .save() en la instancia para guardar los cambios realizados en la instancia del documento **en la db**. aqui, el documento de la coleccion Veterinario en MongoDB se actualizará para reflejar los cambios que hiciste
        usuarioConfirmar.save();
        res.json({ msg: "Usuario confirmado correctamente mediante su token" });
    } catch (error) {
        // console.log(error);
        res.json({ msg: "Hubo un error, intentelo de nuevo" });
    }
};

const autenticar = async (req, res) => {
    // res.json({ msg: "Autenticando" });
    // console.log(req.body);

    // - comprobar si el usuario existe... para ello jalamos el email que nos pasó y almacenamos el usuario con dicho email a "usuario"
    const { email, password } = req.body;
    const usuario = await Veterinario.findOne({ email });
    // const existePassword = Veterinario.findOne({ password });

    if (!usuario) {
        const error = new Error("El usuario no existe");
        // el estado 403 significa que no esta autorizado (puedes checar la documentacion de mdn)
        res.status(403).json({
            msg: error.message,
        });
        return;
    }

    // - comprobar si el usuario esta confirmado (con eso del token)
    // como ya tenemos nuestro usuario almacenado en una variable, solo faltaría comprobar sus propiedades
    if (!usuario.confirmado) {
        const error = new Error(
            "El usuario no está confirmado, por favor revise su bandeja de entrada"
        );
        return res.status(403).json({ msg: error.message });
    }

    // - revisar el password
    // ejecutamos el método comprobarPassword en una instancia del modelo que representa un documento de usuario
    // recuerda que usuario es una instancia de un modelo (creado a partir de un esquema como veterinarioSchema).
    // compruebo el password que el usuario me envió a traves del formulario
    if (await usuario.comprobarPassword(password)) {
        // console.log(usuario);
        // devolvemos como respuesta un objeto que contiene el token (generado por jwt) generado tomando el id del usuario
        // ! este token generado me sirve para autenticar y autorizar al veterinario a acceder a sus propias paginas y pacientes
        const user = {
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id),
        };
        return res.json(user);
        // res.json({ msg: "El email y password son correctos. ¡Bienvenid@!" });
    } else {
        const error = new Error("Tu password es incorrecto");
        return res.status(403).json({ msg: error.message });
    }
};

const olvidePassword = async (req, res) => {
    const { email } = req.body;
    const existeVeterinario = await Veterinario.findOne({ email });
    if (!existeVeterinario) {
        const error = new Error("El email no existe");
        return res.status(400).json({ msg: error.message });
    }
    try {
        existeVeterinario.token = generarId();
        const veterinarioGuardado =
            await existeVeterinario.save(); /* recuerda guardarlo la instancia modificada en la db */
        // enviando el email
        emailOlvidePassword({
            nombre: veterinarioGuardado.nombre,
            email: veterinarioGuardado.email,
            token: veterinarioGuardado.token,
        });
        res.json({ msg: "Hemos enviado un email con las instrucciones" });
    } catch (error) {
        res.json({ msg: "Hubo un error, intentelo de nuevo" });
        // console.log(error);
    }
};
const comprobarToken = async (req, res, next) => {
    const { token } = req.params;
    const existeToken = await Veterinario.findOne({ token });
    if (!existeToken) {
        const error = new Error("El token no existe o es inválido");
        return res.status(400).json({ msg: error.message });
    }
    res.json({ msg: "Token valido, el usuario existe" });
};
const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const veterinario = await Veterinario.findOne({ token });

    if (!veterinario) {
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message });
    }
    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        res.json({ msg: "Password modificado correctamente" });
    } catch (error) {
        res.json({ msg: "Hubo un error, intentelo de nuevo" });
    }
};

const actualizarPerfil = async (req, res) => {
    // console.log("desde backend");
    const perfil = req.body;
    const veterinario = await Veterinario.findById(req.params.id);
    if (!veterinario) {
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message });
    }
    // comprobando si el nuevo email que introdujo ya existe en la db
    if (veterinario.email !== perfil.email) {
        const { id } = perfil;
        const existeEmail = await Veterinario.findOne({ id });
        if (existeEmail) {
            const error = new Error("Hubo un error");
            return res.status(400).json({ msg: error.message });
        }
    }

    try {
        (veterinario.nombre = perfil.nombre),
            (veterinario.email = perfil.email),
            (veterinario.telefono = perfil.telefono),
            (veterinario.web = perfil.web);
        const veterinarioGuardado = await veterinario.save();
        res.json(veterinarioGuardado);
        // console.log(veterinarioGuardado);
        // console.log(req.body);
    } catch (error) {
        console.log(error);
    }
};

const actualizarPassword = async (req, res) => {
    // Leemos los datos
    const { id } = req.veterinario;
    const { current_pass, new_pass } = req.body;

    // Comprobamos que el usuario existe mediante su id
    const veterinario = await Veterinario.findById(id);
    if (!veterinario) {
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message });
    }

    // Comprobamos el password (mediante el metodo personalizado del schema)
    if (await veterinario.comprobarPassword(current_pass)) {
        // Almacenamos su password
        // guarda y hashea de nuevo el password  (lo hashea antes de almacenarlo, gracias al "pre")
        veterinario.password = new_pass;
        await veterinario.save();
        // enviamos respuesta
        res.json({ msg: "Password almacenado correctamente" });
    } else {
        const error = new Error("El password actual es incorrecto");
        res.status(400).json({ msg: error.message });
    }

    // console.log(req.veterinario);
    // console.log(req.body);
};

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword,
};
