document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Update active nav link
            document.querySelector('.sidebar-nav li.active').classList.remove('active');
            this.parentElement.classList.add('active');
            
            // Show target page
            document.querySelector('.page-content.active').classList.remove('active');
            document.getElementById(`${targetPage}-page`).classList.add('active');
        });
    });
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    menuToggle.addEventListener('click', function() {
        document.body.classList.toggle('sidebar-open');
    });
    
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateCharts();
    });
    
    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    // Settings navigation
    const settingsLinks = document.querySelectorAll('.settings-nav a');
    settingsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href');
            
            // Update active settings link
            document.querySelector('.settings-nav li.active').classList.remove('active');
            this.parentElement.classList.add('active');
            
            // Show target settings section
            document.querySelector('.settings-section.active').classList.remove('active');
            document.querySelector(targetSection).classList.add('active');
        });
    });
    
    // Prediction form submission
    const predictionForm = document.getElementById('prediction-form');
    if (predictionForm) {
        predictionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;
            
            // Simulate API call delay
            setTimeout(() => {
                // Get form data
                const formData = new FormData(predictionForm);
                const leadTime = parseInt(formData.get('leadTime')) || 0;
                const repeatedGuest = formData.get('repeatedGuest') === 'on';
                const previousCancellations = parseInt(formData.get('noOfPreviousCancellations')) || 0;
                const specialRequests = parseInt(formData.get('noOfSpecialRequests')) || 0;
                const avgPrice = parseInt(formData.get('avgPricePerRoom')) || 0;
                
                // Simple prediction logic (for demo)
                const baseProb = 0.3;
                const leadTimeFactor = leadTime > 60 ? 0.2 : 0;
                const guestFactor = repeatedGuest ? -0.15 : 0;
                const cancelFactor = previousCancellations > 0 ? 0.25 : 0;
                const requestsFactor = specialRequests > 0 ? -0.1 : 0;
                const priceFactor = avgPrice > 150 ? 0.15 : 0;
                
                const probability = Math.min(0.95, Math.max(0.05, 
                    baseProb + leadTimeFactor + guestFactor + cancelFactor + requestsFactor + priceFactor));
                
                const prediction = {
                    probability: probability,
                    prediction: probability > 0.5 ? 'Cancelled' : 'Not Cancelled',
                    risk: probability > 0.7 ? 'high' : probability > 0.3 ? 'medium' : 'low'
                };
                
                // Display prediction result
                displayPredictionResult(prediction);
                
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                // Enable save booking button
                document.getElementById('save-booking-btn').disabled = false;
            }, 1500);
        });
    }
    
    // Initialize charts
    initializeCharts();
});

function displayPredictionResult(prediction) {
    const resultContainer = document.getElementById('prediction-result');
    
    // Clear previous results
    resultContainer.innerHTML = '';
    
    // Create alert based on prediction
    const alertClass = prediction.risk === 'high' ? 'danger' : 
                       prediction.risk === 'medium' ? 'warning' : 'success';
    
    const alertIcon = prediction.risk === 'high' ? 'fa-times-circle' : 
                      prediction.risk === 'medium' ? 'fa-exclamation-circle' : 'fa-check-circle';
    
    const alertTitle = prediction.prediction === 'Cancelled' ? 
                      'Likely to Cancel' : 'Likely to Keep Reservation';
    
    const alertContent = `
        <div class="prediction-alert ${alertClass}">
            <i class="fas ${alertIcon}"></i>
            <div class="prediction-alert-content">
                <h4>${alertTitle}</h4>
                <p>Our model predicts this booking will ${prediction.prediction === 'Cancelled' ? 'be cancelled' : 'not be cancelled'} with ${(prediction.probability * 100).toFixed(0)}% confidence.</p>
            </div>
        </div>
    `;
    
    // Risk assessment section
    const riskSection = `
        <div class="prediction-section">
            <h4>Risk Assessment</h4>
            <div class="risk-indicator">
                <i class="fas ${prediction.risk === 'high' ? 'fa-times-circle' : 
                              prediction.risk === 'medium' ? 'fa-exclamation-circle' : 'fa-check-circle'} ${prediction.risk}"></i>
                <span>${prediction.risk.charAt(0).toUpperCase() + prediction.risk.slice(1)} Risk</span>
            </div>
            <p>${prediction.risk === 'high' 
                ? 'This booking has a high risk of cancellation. Consider overbooking or requiring a deposit.'
                : prediction.risk === 'medium'
                ? 'This booking has a moderate risk of cancellation. Monitor closely as the check-in date approaches.'
                : 'This booking has a low risk of cancellation. No special action required.'}</p>
        </div>
    `;
    
    // Key factors section
    const form = document.getElementById('prediction-form');
    const leadTime = parseInt(form.leadTime.value) || 0;
    const repeatedGuest = form.repeatedGuest.checked;
    const previousCancellations = parseInt(form.noOfPreviousCancellations.value) || 0;
    const specialRequests = parseInt(form.noOfSpecialRequests.value) || 0;
    const avgPrice = parseInt(form.avgPricePerRoom.value) || 0;
    
    let factorsList = '';
    
    if (leadTime > 60) {
        factorsList += '<li>Long lead time (over 60 days) increases cancellation risk</li>';
    }
    
    if (avgPrice > 150) {
        factorsList += '<li>Higher room price increases cancellation risk</li>';
    }
    
    if (repeatedGuest) {
        factorsList += '<li>Repeated guest status decreases cancellation risk</li>';
    }
    
    if (specialRequests > 0) {
        factorsList += '<li>Special requests decrease cancellation risk</li>';
    }
    
    if (previousCancellations > 0) {
        factorsList += '<li>Previous cancellations increase risk</li>';
    }
    
    const factorsSection = `
        <div class="prediction-section">
            <h4>Key Factors</h4>
            <div class="key-factors">
                <ul>
                    ${factorsList}
                </ul>
            </div>
        </div>
    `;
    
    // Combine all sections
    resultContainer.innerHTML = alertContent + riskSection + factorsSection;
}

function initializeCharts() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e5e7eb' : '#1f2937';
    const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
    
    // Cancellation Chart
    const cancellationCtx = document.getElementById('cancellationChart');
    if (cancellationCtx) {
        const cancellationChart = new Chart(cancellationCtx, {
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
        const distributionChart = new Chart(distributionCtx, {
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
        const accuracyChart = new Chart(accuracyCtx, {
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
        const featureChart = new Chart(featureCtx, {
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
        const trendsChart = new Chart(trendsCtx, {
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
    Chart.helpers.each(Chart.instances, function(instance) {
        instance.destroy();
    });
    
    initializeCharts();
}
