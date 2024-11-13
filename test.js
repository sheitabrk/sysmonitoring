const MonitoringDashboard = require('./index.js');

const monitoring = new MonitoringDashboard({
    port: 4000,             
    showCpuLoad: true,      
    showMemoryUsage: true,  
    showPing: true,         
    refreshInterval: 1000   
});

monitoring.startServer(); 
