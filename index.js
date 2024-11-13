const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const si = require('systeminformation');

class MonitoringDashboard {
    constructor(options = {}) {
        this.port = options.port || 3000;
        this.showCpuLoad = options.showCpuLoad !== false;
        this.showMemoryUsage = options.showMemoryUsage !== false;
        this.showPing = options.showPing !== false;
        this.refreshInterval = options.refreshInterval || 1000;
        
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server);
        
        this.setupRoutes();
        this.setupSocket();
    }

    setupRoutes() {
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.get('/monitoring', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        this.app.get('/api/cpu', async (req, res) => {
            const cpuLoad = await this.getCpuLoad();
            res.json({ cpuLoad });
        });

        this.app.get('/api/memory', async (req, res) => {
            const memoryUsage = await this.getMemoryUsage();
            res.json({ memoryUsage });
        });

        this.app.get('/api/ping', async (req, res) => {
            const ping = await this.getPing();
            res.json({ ping });
        });


        this.app.get('/monitoring/api/cpu', async (req, res) => {
            const tryapi = "Try /api/cpu"
            res.json({ tryapi });
        });

        this.app.get('/monitoring/api/memory', async (req, res) => {
            const tryapi = "Try /api/memory"
            res.json({ tryapi });
        });

        this.app.get('/monitoring/api/ping', async (req, res) => {
            const tryapi = "Try /api/ping"
            res.json({ tryapi });
        });
    }

    setupSocket() {
        this.io.on('connection', (socket) => {
            console.log('Client connected');

            setInterval(async () => {
                const data = {};
                if (this.showCpuLoad) data.cpuLoad = await this.getCpuLoad();
                if (this.showMemoryUsage) data.memoryUsage = await this.getMemoryUsage();
                if (this.showPing) data.ping = await this.getPing();

                socket.emit('stats', data);
            }, this.refreshInterval);
        });
    }

    async getCpuLoad() {
        const cpu = await si.currentLoad();
        return cpu.currentLoad.toFixed(2);
    }

    async getMemoryUsage() {
        const memory = await si.mem();
        return ((memory.active / memory.total) * 100).toFixed(2);
    }

    async getPing() {
        return await si.inetLatency();
    }

    startServer() {
        this.server.listen(this.port, () => {
            console.log(`Monitoring Dashboard running on http://127.0.0.1:${this.port}/monitoring`);
        });
    }

    stopServer() {
        this.server.close(() => {
            console.log('Monitoring Dashboard server has been stopped');
        });

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.io.close();
    }
}

module.exports = MonitoringDashboard;
