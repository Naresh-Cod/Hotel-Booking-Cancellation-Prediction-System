document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons
  lucide.createIcons();
  
  // Set today's date as default for arrival date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('arrivalDate').value = today;
  
  // Tab functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and content
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // Initialize charts
  initializeCharts();
  
  // Populate bookings table
  populateBookingsTable();
  
  // Form submission
  document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    predictCancellation();
  });
});

function initializeCharts() {
  // Monthly trends chart
  const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
  const monthlyChart = new Chart(monthlyCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Bookings',
          data: [120, 110, 130, 125, 115, 135, 150, 160, 140, 130, 125, 155],
          backgroundColor: '#48cae4',
          borderColor: '#0077b6',
          borderWidth: 1
        },
        {
          label: 'Cancellations',
          data: [24, 18, 30, 22, 15, 25, 35, 40, 30, 25, 20, 35],
          backgroundColor: '#dc3545',
          borderColor: '#a71d2a',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // Category chart
  const categoryCtx = document.getElementById('categoryChart').getContext('2d');
  const categoryChart = new Chart(categoryCtx, {
    type: 'bar',
    data: {
      labels: ['Standard', 'Deluxe', 'Executive', 'Premium', 'Suite'],
      datasets: [
        {
          label: 'Bookings',
          data: [400, 320, 200, 100, 40],
          backgroundColor: '#48cae4',
          borderColor: '#0077b6',
          borderWidth: 1
        },
        {
          label: 'Cancellations',
          data: [120, 80, 40, 20, 5],
          backgroundColor: '#dc3545',
          borderColor: '#a71d2a',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function populateBookingsTable() {
  const bookings = [
    {
      id: 'BK001',
      roomType: 'Standard',
      arrivalDate: '2023-12-15',
      weekNights: 2,
      weekendNights: 1,
      status: 'Confirmed',
      avgPricePerRoom: 120,
      cancellationProbability: 0.15
    },
    {
      id: 'BK002',
      roomType: 'Deluxe',
      arrivalDate: '2023-12-20',
      weekNights: 3,
      weekendNights: 0,
      status: 'Confirmed',
      avgPricePerRoom: 150,
      cancellationProbability: 0.10
    },
    {
      id: 'BK003',
      roomType: 'Executive',
      arrivalDate: '2023-12-23',
      weekNights: 3,
      weekendNights: 2,
      status: 'Cancelled',
      avgPricePerRoom: 200,
      cancellationProbability: 0.85
    },
    {
      id: 'BK004',
      roomType: 'Premium',
      arrivalDate: '2024-01-05',
      weekNights: 5,
      weekendNights: 2,
      status: 'Confirmed',
      avgPricePerRoom: 250,
      cancellationProbability: 0.65
    },
    {
      id: 'BK005',
      roomType: 'Standard',
      arrivalDate: '2023-12-10',
      weekNights: 2,
      weekendNights: 0,
      status: 'Checked-In',
      avgPricePerRoom: 120,
      cancellationProbability: 0.05
    },
    {
      id: 'BK006',
      roomType: 'Deluxe',
      arrivalDate: '2024-01-15',
      weekNights: 1,
      weekendNights: 1,
      status: 'Confirmed',
      avgPricePerRoom: 150,
      cancellationProbability: 0.75
    }
  ];
  
  const tableBody = document.getElementById('bookingsTableBody');
  
  bookings.forEach(booking => {
    const row = document.createElement('tr');
    
    // Calculate total nights and price
    const totalNights = booking.weekNights + booking.weekendNights;
    const totalPrice = booking.avgPricePerRoom * totalNights;
    
    // Format cancellation probability
    let probabilityClass = '';
    let probabilityText = '';
    
    if (booking.cancellationProbability !== undefined) {
      probabilityText = `${(booking.cancellationProbability * 100).toFixed(1)}%`;
      
      if (booking.cancellationProbability >= 0.6) {
        probabilityClass = 'prediction-high';
      } else if (booking.cancellationProbability >= 0.3) {
        probabilityClass = 'prediction-medium';
      } else {
        probabilityClass = 'prediction-low';
      }
    }
    
    // Status badge
    let statusBadgeClass = '';
    let statusText = booking.status;
    
    switch (booking.status) {
      case 'Confirmed':
        statusBadgeClass = 'status-badge confirmed';
        break;
      case 'Cancelled':
        statusBadgeClass = 'status-badge cancelled';
        break;
      case 'Checked-In':
        statusBadgeClass = 'status-badge checked-in';
        break;
      case 'Checked-Out':
        statusBadgeClass = 'status-badge checked-out';
        break;
    }
    
    row.innerHTML = `
      <td class="font-medium">${booking.id}</td>
      <td>${booking.roomType}</td>
      <td>${booking.arrivalDate}</td>
      <td>${totalNights} nights</td>
      <td><span class="${statusBadgeClass}">${statusText}</span></td>
      <td class="text-right">$${totalPrice}</td>
      <td class="text-right"><span class="${probabilityClass}">${probabilityText}</span></td>
    `;
    
    tableBody.appendChild(row);
  });
}

function predictCancellation() {
  // Get form values
  const formData = {
    adults: parseInt(document.getElementById('adults').value),
    children: parseInt(document.getElementById('children').value),
    weekNights: parseInt(document.getElementById('weekNights').value),
    weekendNights: parseInt(document.getElementById('weekendNights').value),
    roomType: document.getElementById('roomType').value,
    mealPlan: document.getElementById('mealPlan').value,
    leadTime: parseInt(document.getElementById('leadTime').value),
    arrivalDate: document.getElementById('arrivalDate').value,
    marketSegment: document.getElementById('marketSegment').value,
    avgPricePerRoom: parseFloat(document.getElementById('avgPrice').value),
    previousCancellations: parseInt(document.getElementById('prevCancellations').value),
    previousBookingsNotCanceled: parseInt(document.getElementById('prevBookings').value),
    specialRequests: parseInt(document.getElementById('specialRequests').value),
    parkingSpace: document.getElementById('parkingSpace').checked,
    repeatedGuest: document.getElementById('repeatedGuest').checked
  };
  
  // Simple prediction algorithm (demo only)
  let probability = 0;
  
  // Lead time factor
  if (formData.leadTime > 100) probability += 0.3;
  else if (formData.leadTime > 50) probability += 0.15;
  else if (formData.leadTime > 30) probability += 0.05;
  
  // Previous cancellations
  probability += 0.2 * formData.previousCancellations;
  
  // Repeated guest
  if (formData.repeatedGuest) probability -= 0.15;
  
  // Special requests
  probability -= 0.05 * formData.specialRequests;
  
  // Market segment
  if (formData.marketSegment === 'Online') probability += 0.1;
  if (formData.marketSegment === 'Travel Agent') probability += 0.05;
  
  // Ensure probability is between 0 and 1
  probability = Math.max(0, Math.min(1, probability));
  
  // Determine risk level
  let riskLevel = 'low';
  let willCancel = false;
  
  if (probability >= 0.6) {
    riskLevel = 'high';
    willCancel = true;
  } else if (probability >= 0.3) {
    riskLevel = 'medium';
    willCancel = probability > 0.5;
  } else {
    riskLevel = 'low';
  }
  
  // Update UI with prediction result
  showPredictionResult(willCancel, probability, riskLevel);
}

function showPredictionResult(willCancel, probability, riskLevel) {
  const resultElement = document.getElementById('predictionResult');
  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  const resultProbability = document.getElementById('resultProbability');
  const progressFill = document.getElementById('progressFill');
  const recommendationsList = document.getElementById('recommendationsList');
  
  // Set icon and color based on risk level
  let iconName = 'check-circle';
  let iconColor = 'text-success';
  let progressColor = 'bg-success';
  
  if (riskLevel === 'high') {
    iconName = 'x-circle';
    iconColor = 'text-danger';
    progressColor = 'bg-danger';
  } else if (riskLevel === 'medium') {
    iconName = 'alert-triangle';
    iconColor = 'text-warning';
    progressColor = 'bg-warning';
  }
  
  // Create icon element
  resultIcon.innerHTML = `<i data-lucide="${iconName}" class="${iconColor}"></i>`;
  lucide.createIcons(); // Refresh icons
  
  // Set other result values
  resultTitle.textContent = willCancel ? 'Likely to Cancel' : 'Likely to Keep';
  resultProbability.textContent = `${(probability * 100).toFixed(1)}%`;
  resultProbability.className = `result-probability ${riskLevel === 'high' ? 'prediction-high' : riskLevel === 'medium' ? 'prediction-medium' : 'prediction-low'}`;
  
  // Set progress bar
  progressFill.style.width = `${probability * 100}%`;
  progressFill.className = `progress-fill ${progressColor}`;
  
  // Set recommendations
  let recommendations = [];
  
  if (riskLevel === 'high') {
    recommendations = [
      'Consider requesting a deposit',
      'Prepare alternative booking options',
      'Follow up with customer to confirm'
    ];
  } else if (riskLevel === 'medium') {
    recommendations = [
      'Monitor booking status',
      'Send a friendly reminder',
      'Prepare flexible alternatives'
    ];
  } else {
    recommendations = [
      'Process normally',
      'Consider upselling opportunities',
      'Prepare for guest arrival'
    ];
  }
  
  // Update recommendations list
  recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
  
  // Show the result section
  resultElement.style.display = 'block';
  
  // Scroll to result
  resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest
