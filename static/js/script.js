document.addEventListener('DOMContentLoaded', function () {
    // Navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');

            document.querySelector('.sidebar-nav li.active').classList.remove('active');
            this.parentElement.classList.add('active');

            document.querySelector('.page-content.active').classList.remove('active');
            document.getElementById(`${targetPage}-page`).classList.add('active');
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    menuToggle.addEventListener('click', function () {
        document.body.classList.toggle('sidebar-open');
    });

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateCharts();
    });

    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Initialize charts
    initializeCharts();
});

function initializeCharts() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e5e7eb' : '#1f2937';
    const gridColor = isDarkMode ? '#374151' : '#e5e7eb';

    // Cancellation Chart
    const cancellationCtx = document.getElementById('cancellationChart');
    if (cancellationCtx) {
        new Chart(cancellationCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                    {
                        label: 'Actual Cancellations',
                        data: [65, 59, 80, 81, 56, 55, 40],
                        backgroundColor: '#f97316',
                        borderRadius: 4
                    },
                    {
                        label: 'Predicted Cancellations',
                        data: [62, 55, 78, 85, 58, 52, 45],
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    }
                }
            }
        });
    }

    // Distribution Chart
    const distributionCtx = document.getElementById('distributionChart');
    if (distributionCtx) {
        new Chart(distributionCtx, {
            type: 'pie',
            data: {
                labels: ['Standard', 'Deluxe', 'Suite', 'Executive'],
                datasets: [{
                    data: [40, 30, 20, 10],
                    backgroundColor: ['#3b82f6', '#f97316', '#10b981', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor
                        }
                    }
                }
            }
        });
    }

    // Accuracy Chart
    const accuracyCtx = document.getElementById('accuracyChart');
    if (accuracyCtx) {
        new Chart(accuracyCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Prediction Accuracy',
                    data: [75, 78, 82, 85, 86, 88, 87],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        },
                        min: 50,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    }
                }
            }
        });
    }

    // Feature Importance Chart
    const featureCtx = document.getElementById('featureImportanceChart');
    if (featureCtx) {
        new Chart(featureCtx, {
            type: 'horizontalBar',
            data: {
                labels: ['Lead Time', 'Price Per Room', 'Special Requests', 'Repeated Guest', 'Previous Cancellations', 'Market Segment', 'Room Type'],
                datasets: [{
                    label: 'Feature Importance',
                    data: [0.28, 0.22, 0.15, 0.12, 0.10, 0.08, 0.05],
                    backgroundColor: [
                        '#3b82f6', '#f97316', '#10b981', '#8b5cf6',
                        '#ef4444', '#f59e0b', '#6b7280'
                    ]
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Trends Chart
    const trendsCtx = document.getElementById('trendsChart');
    if (trendsCtx) {
        new Chart(trendsCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                datasets: [
                    {
                        label: 'Bookings',
                        data: [120, 135, 150, 142, 160, 175, 180, 190],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Cancellations',
                        data: [20, 25, 30, 28, 35, 32, 38, 40],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    }
                }
            }
        });
    }
}

function updateCharts() {
    // Destroy and reinitialize charts when theme changes
    Chart.helpers.each(Chart.instances, function (instance) {
        instance.destroy();
    });

    initializeCharts();
}