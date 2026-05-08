require("dotenv/config");

const app = require("./app");

const PORT = process.env.PORT || 6500

app.listen(PORT, () => {
console.log(`Servidor em pé na porta ${PORT}`);
});