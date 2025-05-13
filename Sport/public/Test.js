let chart;
let currentKey = null;
const datasets = {};

document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('xyChart').getContext('2d');
    const form = document.getElementById('addPointForm');
    const xInput = document.getElementById('xValue');
    const yInput = document.getElementById('yValue');
    const pointList = document.getElementById('pointList');
    const graphInfo = document.getElementById('graphInfo');
    const graphContainer = document.getElementById('graphContainer');

    graphContainer.classList.add('hidden');
    graphInfo.classList.add('hidden');

    function updatePointList() {
        pointList.innerHTML = '';
        datasets[currentKey].forEach((point, index) => {
            const li = document.createElement('li');
            li.textContent = `x: ${point.x.toFixed(2)}, y: ${point.y.toFixed(2)}`;
            const btn = document.createElement('button');
            btn.textContent = 'Supprimer';
            btn.onclick = () => {
                datasets[currentKey].splice(index, 1);
                updateChart();
                updatePointList();
                saveToCSV();
            };
            li.appendChild(btn);
            pointList.appendChild(li);
        });
    }

    function updateChart() {
        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Graphique XY',
                    data: datasets[currentKey],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    showLine: true,
                    tension: 0.2
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'X' } },
                    y: { title: { display: true, text: 'Y' } }
                }
            }
        });
        graphContainer.classList.remove('hidden');
        graphInfo.classList.remove('hidden');
    }
    /* ancienne fonction
    function saveToCSV() {
        fetch('/save-csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datasets)
        })
            .then(res => res.text())
            .then(message => alert(message))
            .catch(err => {
                    console.error("Erreur pendant le POST /save-csv :", err);
                    alert("Erreur lors de l'enregistrement (voir la console).");
                });
    }*/

    function saveToCSV() {
        const cleanData = JSON.parse(JSON.stringify(datasets)); // nettoyage simple
        fetch('/save-csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanData)
        })
            .then(res => res.text())
            .then(message => {
                alert(message);
            })
            .catch(err => {
                console.error("Erreur côté client :", err);
                alert("Erreur lors de l'enregistrement (voir la console).");
            });
    }


    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const x = parseFloat(xInput.value.replace(',', '.'));
        const y = parseFloat(yInput.value.replace(',', '.'));

        if (!isNaN(x) && !isNaN(y)) {
            if (!datasets[currentKey]) datasets[currentKey] = [];
            datasets[currentKey].push({
                x: parseFloat(x.toFixed(2)),
                y: parseFloat(y.toFixed(2))
            });
            updateChart();
            updatePointList();
            form.reset();
            saveToCSV();
        }
    });


    document.querySelectorAll('.dataset-btn').forEach(button => {
        button.addEventListener('click', () => {
            currentKey = button.getAttribute('data-set');
            if (!datasets[currentKey]) datasets[currentKey] = [];
            updateChart();
            updatePointList();
        });
    });

    document.querySelectorAll('.menu-container .menu-toggle').forEach(toggleBtn => {
        toggleBtn.addEventListener('click', () => {
            const submenu = toggleBtn.nextElementSibling;

            document.querySelectorAll('.menu-container .submenu').forEach(menu => {
                if (menu !== submenu) menu.classList.add('hidden');
            });

            submenu.classList.toggle('hidden');
        });
    });

    fetch('/load-csv')
        .then(res => res.json())
        .then(loaded => {
            Object.assign(datasets, loaded);
        });
});
