import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
    // creamos el objeto de transporte que se puede usar para enviar emails desde una app node.js
    // .createTransport toma un objeto de configuración y devuelve un objeto de transporte... este objeto de transporte puede usarse para enviar emails
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_POST,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const { nombre, email, token } = datos;

    // enviamos el email
    const info = await transport.sendMail({
        from: "APV - Administrador de Pacientes de Veterinaria",
        subject: "Confirma tu cuenta",
        to: email,
        text: `Hola ${nombre}, confirma tu cuenta`,
        html: `
            <h1>${nombre} confirma tu cuenta</h1>
            <p>Para confirmar tu cuenta haz click en el siguiente enlace</p>
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar cuenta</a>

            <p>Si no creaste una cuenta en nuestra plataforma por favor ignora este mensaje</p>
        `,
    });
};
export default emailRegistro;
