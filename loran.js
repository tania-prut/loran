const socket = new WebSocket('ws://localhost:4002');

socket.onopen = () => {
    console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
    console.log('Received message from WebSocket:', event.data);
    const data = JSON.parse(event.data);
    processSignal(data);
};

const baseStations = {
    'source1': { x: 0, y: 0 },
    'source2': { x: 100000, y: 0 },
    'source3': { x: 0, y: 100000 }
};

let timestamps = {};

function processSignal(data) {
    const { sourceId, receivedAt } = data;
    if (baseStations[sourceId]) {
        timestamps[sourceId] = receivedAt;
        if (Object.keys(timestamps).length === 3) {
            calculateLocation();
        }
    }
}

function calculateLocation() {
    const [source1, source2, source3] = Object.keys(timestamps);
    const receivedAt1 = timestamps[source1];
    const receivedAt2 = timestamps[source2];
    const receivedAt3 = timestamps[source3];

    const deltaT12 = (receivedAt1 - receivedAt2) / 1000;
    const deltaT13 = (receivedAt1 - receivedAt3) / 1000;
    const c = 3e8;

    if (isNaN(deltaT12) || isNaN(deltaT13)) return;

    const initialGuess = [50000, 50000];
    const result = customLeastSquares(tdoaError, initialGuess, [
        baseStations[source1].x, baseStations[source1].y,
        baseStations[source2].x, baseStations[source2].y,
        baseStations[source3].x, baseStations[source3].y,
        deltaT12, deltaT13, c
    ]);

    updatePlot(result);
}

function tdoaError(params, x1, y1, x2, y2, x3, y3, deltaT12, deltaT13, c) {
    const [x, y] = params;
    const d1 = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
    const d2 = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
    const d3 = Math.sqrt(Math.pow(x - x3, 2) + Math.pow(y - y3, 2));

    const deltaT12Calc = (d1 - d2) / c;
    const deltaT13Calc = (d1 - d3) / c;

    return [deltaT12Calc - deltaT12, deltaT13Calc - deltaT13];
}

function lossFunction(params, tdoaErrorFunc, args) {
    const errors = tdoaErrorFunc(params, ...args);
    return errors.reduce((sum, e) => sum + e * e, 0);
}

function customLeastSquares(tdoaErrorFunc, initialGuess, args, learningRate = 0.01, maxIterations = 10000, tolerance = 1e-12) {
    let [x, y] = initialGuess;
    let prevLoss = Infinity;
    let iteration = 0;

    while (iteration < maxIterations) {
        const loss = lossFunction([x, y], tdoaErrorFunc, args);

        if (Math.abs(prevLoss - loss) < tolerance) break;

        prevLoss = loss;

        const delta = 1e-6;

        const lossX = lossFunction([x + delta, y], tdoaErrorFunc, args);
        const gradX = (lossX - loss) / delta;

        const lossY = lossFunction([x, y + delta], tdoaErrorFunc, args);
        const gradY = (lossY - loss) / delta;

        x -= learningRate * gradX;
        y -= learningRate * gradY;

        iteration++;
    }

    return [x, y, iteration];
}

function updatePlot(location) {
    const [x, y] = location;

    const traces = [{
        x: [baseStations['source1'].x, baseStations['source2'].x, baseStations['source3'].x],
        y: [baseStations['source1'].y, baseStations['source2'].y, baseStations['source3'].y],
        mode: 'markers',
        type: 'scatter',
        marker: { size: 10, color: 'blue' },
        name: 'Base Stations',
    }];

    traces.push({
        x: [x],
        y: [y],
        mode: 'markers',
        type: 'scatter',
        marker: { size: 8, color: 'red' },
        name: 'Estimated Position',
    });

    const layout = {
        xaxis: { title: 'X' },
        yaxis: { title: 'Y' },
        showlegend: true,
    };

    Plotly.newPlot('plot', traces, layout);
}

 
function updateGPSConfig() {
    const objectSpeed  = document.getElementById('objectSpeed').value;

    const configData = {
        objectSpeed: parseInt(objectSpeed) || 100
    };

    socket.send(JSON.stringify(configData));
    console.log('Configuration sent:', configData);
}
