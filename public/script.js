const socket = io();
const consoleOutput = document.getElementById('console-output');
const consoleInput = document.getElementById('console-input');
const cpuValueDisplay = document.getElementById('cpu-value');
const memoryValueDisplay = document.getElementById('memory-value');
const pingValueDisplay = document.getElementById('ping-value');

function logToConsole(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

const cpuChart = new Chart(document.getElementById('cpu-chart').getContext('2d'), {
    type: 'line',
    options: { responsive: false, maintainAspectRatio: false, scales: {x: { display: false}} },
    data: {
        labels: [],
        datasets: [{ label: 'CPU Load (%)', backgroundColor: '#4717f6', data: [] }]
    }
});

const memoryChart = new Chart(document.getElementById('memory-chart').getContext('2d'), {
    type: 'line',
    options: { responsive: false, maintainAspectRatio: false, scales: {x: { display: false}} },
    data: {
        labels: [],
        datasets: [{ label: 'Memory Usage (%)', backgroundColor: '#a239ca', data: [] }]
    }
});

const pingChart = new Chart(document.getElementById('ping-chart').getContext('2d'), {
    type: 'line',
    options: { responsive: false, maintainAspectRatio: false, scales: {x: { display: false}} },
    data: {
        labels: [],
        datasets: [{ label: 'Ping (ms)', backgroundColor: '#e7dfdd', data: [] }]
    }
});

function updateChart(chart, label, data, displayElement, unit) {
    if (chart.data.labels.length > 20) chart.data.labels.shift();
    if (chart.data.datasets[0].data.length > 20) chart.data.datasets[0].data.shift();
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data);
    chart.update();

    displayElement.textContent = `${chart.data.datasets[0].label}: ${data}${unit}`;
}

socket.on('stats', (data) => {
    const timestamp = new Date().toLocaleTimeString();

    if (data.cpuLoad) updateChart(cpuChart, timestamp, data.cpuLoad, cpuValueDisplay, '%');
    if (data.memoryUsage) updateChart(memoryChart, timestamp, data.memoryUsage, memoryValueDisplay, '%');
    if (data.ping) updateChart(pingChart, timestamp, data.ping, pingValueDisplay, ' ms');

});

consoleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = consoleInput.value.trim();
        if (command) {
            logToConsole(`> ${command}`);
            handleCommand(command);
            consoleInput.value = '';
        }
    }
});


const commands = {
    clear: () => consoleOutput.innerHTML = '',
    echo: (args) => {
        if (args.length > 0) {
            logToConsole(args.join(' '));
        } else {
            logToConsole('Usage : echo [message]');
        }
    },
    time: () => logToConsole(new Date().toLocaleTimeString()),
    date: () => logToConsole(new Date().toLocaleDateString()),

    help: () => {
        logToConsole('Available commands:');
        for (let cmd in commands) {
            logToConsole(`- ${cmd}`);
        }
    },

    stats: () => {
        logToConsole(`CPU: ${cpuValueDisplay.textContent}`);
        logToConsole(`Memory: ${memoryValueDisplay.textContent}`);
        logToConsole(`Ping: ${pingValueDisplay.textContent}`);
    },

    uptime: async () => {
        const data = await fetch('/api/uptime').then(res => res.json());
        logToConsole(`Uptime: ${data.uptime}`);
    },

    cputemp: async () => {
        const data = await fetch('/api/cputemp').then(res => res.json());
        logToConsole(`CPU Temp: ${data.temp} °C`);
    },

    hostname: async () => {
        const data = await fetch('/api/hostname').then(res => res.json());
        logToConsole(`Hostname: ${data.hostname}`);
    },

    platform: async () => {
        const data = await fetch('/api/platform').then(res => res.json());
        logToConsole(`Platform: ${data.platform}`);
    },

    whoami: async () => {
        const data = await fetch('/api/user').then(res => res.json());
        logToConsole(`User: ${data.user}`);
    },

    dashboard: () => {
        window.open('/monitoring', '_blank');
        logToConsole('Dashboard opened in new tab.');
    },
};

function handleCommand(input) {
    const [command, ...args] = input.trim().split(' ');

    if (commands[command]) {
        commands[command](args);
    } else {
        logToConsole(`Command not recognized: ${command}`);
    }
}
