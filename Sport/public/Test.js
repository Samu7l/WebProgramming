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

    let currentPage = 0;
    const itemsPerPage = 5;

    function updatePointList() {
        pointList.innerHTML = '';

        const points = datasets[currentKey] || [];
        const startIndex = currentPage * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, points.length);
        const visiblePoints = points.slice(startIndex, endIndex);

        visiblePoints.forEach((point, index) => {
            const li = document.createElement('li');
            li.textContent = `x: ${point.x}, y: ${point.y} `;

            const btn = document.createElement('button');
            btn.textContent = 'Supprimer';
            btn.onclick = () => {
                datasets[currentKey].splice(startIndex + index, 1); // Corriger l'index global
                updatePointList();
                updateChart();
                saveToCSV();
            };

            li.appendChild(btn);
            pointList.appendChild(li);
        });
        // Met à jour l'état des boutons
        document.getElementById('prevPageBtn').disabled = currentPage === 0;
        document.getElementById('nextPageBtn').disabled = endIndex >= points.length;
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


    document.querySelectorAll('.menu-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            document.querySelectorAll('.submenu').forEach(menu => {
                if (menu.id === targetId) {
                    menu.classList.toggle('hidden');
                } else {
                    menu.classList.add('hidden');
                }
                updateChart();
                updatePointList();
            });
        });
    });


    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            updatePointList();
        }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
        if ((currentPage + 1) * itemsPerPage < (datasets[currentKey] || []).length) {
            currentPage++;
            updatePointList();
        }
    });


    fetch('/load-csv')
        .then(res => res.json())
        .then(loaded => {
            Object.assign(datasets, loaded);
        });
});
