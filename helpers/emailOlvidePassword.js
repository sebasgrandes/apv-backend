import nodemailer from "nodemailer";

const emailOlvidePassword = async (datos) => {
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
        subject: "Reestablece tu contraseña",
        to: email,
        text: `Hola ${nombre}, reestablece tu contraseña`,
        html: `
            <h1>Reestablece tu contraseña</h1>
            <p>Hola ${nombre}, para establecer tu nueva contraseña haz click en el siguiente enlace</p>
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>

            <p>Si no quisiste reestablecer tu contraseña en nuestra plataforma por favor ignora este mensaje</p>
        `,
    });
};
export default emailOlvidePassword;
