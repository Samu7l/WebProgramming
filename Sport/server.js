const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Route POST : sauvegarde en CSV
app.post('/save-csv', (req, res) => {
    try {
        const datasets = req.body;
        let csv = 'Dataset,X,Y\n';

        console.log("Requête reçue, enregistrement CSV...");
        /* ancienne version
        for (const [key, points] of Object.entries(datasets)) {
            points.forEach(p => {
                // Ignore les points incomplets
                if (typeof p.x === 'number' && typeof p.y === 'number') {
                    csv += `${key},${p.x},${p.y}\n`;
                }
            });
        }*/

        for (const [key, points] of Object.entries(datasets)) {
            points.forEach(p => {
                if (!isFinite(p.x) || !isFinite(p.y)) return;
                csv += `${key},${p.x},${p.y}\n`;
            });
        }


        fs.writeFile(path.join(__dirname, 'data/datasets.csv'), csv, (err) => {
            if (err) {
                console.error("Erreur d'écriture :", err);
                return res.status(500).send("Erreur d’écriture CSV.");
            }
            //res.send("CSV sauvegardé avec succès.");
        });

    } catch (err) {
        console.error("Erreur côté serveur :", err);
        res.status(500).send("Erreur serveur.");
    }
});


// Route GET : chargement depuis CSV
app.get('/load-csv', (req, res) => {
    const filePath = path.join(__dirname, 'data/datasets.csv');
    if (!fs.existsSync(filePath)) return res.json({});

    const csv = fs.readFileSync(filePath, 'utf8');
    const lines = csv.trim().split('\n').slice(1); // skip header
    const datasets = {};

    lines.forEach(line => {
        const [key, x, y] = line.split(',');
        if (!datasets[key]) datasets[key] = [];
        datasets[key].push({ x: parseFloat(x), y: parseFloat(y) });
    });

    res.json(datasets);
});

app.get('/about', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/html/about.html'));
});

// Lancement serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur prêt sur http://localhost:${PORT}/about`);
});
