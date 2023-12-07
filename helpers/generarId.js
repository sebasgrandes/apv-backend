const generarId = () => {
    // el numero lo convertimos a una base 32, es decir, 32 caracteres usados
    return Date.now().toString(32) + Math.random().toString(32).substring(2);
};

export default generarId;
