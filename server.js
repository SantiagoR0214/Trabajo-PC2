const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para analizar el cuerpo de las solicitudes JSON
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para registrar logs
app.post('/log', (req, res) => {
    const log = req.body;
    fs.appendFile('user_logs.json', JSON.stringify(log) + '\n', err => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al guardar el log');
        } else {
            res.status(200).send('Log guardado correctamente');
        }
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
