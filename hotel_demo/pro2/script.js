document.addEventListener('DOMContentLoaded', function() {
  lucide.createIcons();
  
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('arrivalDate').value = today;
  
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  initializeCharts();
  populateBookingsTable();
  
  document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    predictCancellation();
  });
});

function initializeCharts() {
  const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
  new Chart(monthlyCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { label: 'Bookings', data: [120, 110, 130, 125, 115, 135, 150, 160, 140, 130, 125, 155], backgroundColor: '#48cae4' },
        { label: 'Cancellations', data: [24, 18, 30, 22, 15, 25, 35, 40, 30, 25, 20, 35], backgroundColor: '#dc3545' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
  });

  const categoryCtx = document.getElementById('categoryChart').getContext('2d');
  new Chart(categoryCtx, {
    type: 'bar',
    data: {
      labels: ['Standard', 'Deluxe', 'Executive', 'Premium', 'Suite'],
      datasets: [
        { label: 'Bookings', data: [400, 320, 200, 100, 40], backgroundColor: '#48cae4' },
        { label: 'Cancellations', data: [120, 80, 40, 20, 5], backgroundColor: '#dc3545' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
  });
}

function populateBookingsTable() {
  const bookings = [
    { id: 'BK001', roomType: 'Standard', arrivalDate: '2023-12-15', weekNights: 2, weekendNights: 1, status: 'Confirmed', avgPricePerRoom: 120, cancellationProbability: 0.15 },
    { id: 'BK002', roomType: 'Deluxe', arrivalDate: '2023-12-20', weekNights: 3, weekendNights: 0, status: 'Confirmed', avgPricePerRoom: 150, cancellationProbability: 0.10 },
    { id: 'BK003', roomType: 'Executive', arrivalDate: '2023-12-23', weekNights: 3, weekendNights: 2, status: 'Cancelled', avgPricePerRoom: 200, cancellationProbability: 0.85 },
    { id: 'BK004', roomType: 'Premium', arrivalDate: '2024-01-05', weekNights: 5, weekendNights: 2, status: 'Confirmed', avgPricePerRoom: 250, cancellationProbability: 0.65 },
    { id: 'BK005', roomType: 'Standard', arrivalDate: '2023-12-10', weekNights: 2, weekendNights: 0, status: 'Checked-In', avgPricePerRoom: 120, cancellationProbability: 0.05 },
    { id: 'BK006', roomType: 'Deluxe', arrivalDate: '2024-01-15', weekNights: 1, weekendNights: 1, status: 'Confirmed', avgPricePerRoom: 150, cancellationProbability: 0.75 }
  ];

  const tableBody = document.getElementById('bookingsTableBody');
  tableBody.innerHTML = '';
  bookings.forEach(booking => {
    const totalNights = booking.weekNights + booking.weekendNights;
    const totalPrice = booking.avgPricePerRoom * totalNights;
    const probabilityText = `${(booking.cancellationProbability * 100).toFixed(1)}%`;
    const probabilityClass = booking.cancellationProbability >= 0.6 ? 'prediction-high' : booking.cancellationProbability >= 0.3 ? 'prediction-medium' : 'prediction-low';
    const statusBadgeClass = {
      'Confirmed': 'status-confirmed',
      'Cancelled': 'status-cancelled',
      'Checked-In': 'status-checked-in'
    }[booking.status] || '';

    tableBody.innerHTML += `
      <tr>
        <td>${booking.id}</td>
        <td>${booking.roomType}</td>
        <td>${booking.arrivalDate}</td>
        <td>${totalNights} nights</td>
        <td><span class="status-badge ${statusBadgeClass}">${booking.status}</span></td>
        <td class="text-right">$${totalPrice}</td>
        <td class="text-right"><span class="${probabilityClass}">${probabilityText}</span></td>
      </tr>
    `;
  });
}

function predictCancellation() {
  const formData = {
    adults: parseInt(document.getElementById('adults').value) || 0,
    children: parseInt(document.getElementById('children').value) || 0,
    weekNights: parseInt(document.getElementById('weekNights').value) || 0,
    weekendNights: parseInt(document.getElementById('weekendNights').value) || 0,
    roomType: document.getElementById('roomType').value,
    mealPlan: document.getElementById('mealPlan').value,
    leadTime: parseInt(document.getElementById('leadTime').value) || 0,
    arrivalDate: document.getElementById('arrivalDate').value,
    marketSegment: document.getElementById('marketSegment').value,
    avgPricePerRoom: parseFloat(document.getElementById('avgPrice').value) || 0,
    previousCancellations: parseInt(document.getElementById('prevCancellations').value) || 0,
    previousBookingsNotCanceled: parseInt(document.getElementById('prevBookings').value) || 0,
    specialRequests: parseInt(document.getElementById('specialRequests').value) || 0,
    parkingSpace: document.getElementById('parkingSpace').checked,
    repeatedGuest: document.getElementById('repeatedGuest').checked
  };

  // Improved prediction logic
  let probability = 0.1; // Base probability
  probability += formData.leadTime > 100 ? 0.3 : formData.leadTime > 50 ? 0.15 : formData.leadTime > 30 ? 0.05 : 0;
  probability += formData.previousCancellations * 0.2;
  probability -= formData.repeatedGuest ? 0.15 : 0;
  probability -= formData.specialRequests * 0.05;
  probability += formData.marketSegment === 'Online' ? 0.1 : formData.marketSegment === 'Travel Agent' ? 0.05 : 0;
  probability += formData.avgPricePerRoom > 200 ? 0.1 : 0;
  probability = Math.max(0, Math.min(1, probability));

  const riskLevel = probability >= 0.6 ? 'high' : probability >= 0.3 ? 'medium' : 'low';
  const willCancel = probability > 0.5;
  showPredictionResult(willCancel, probability, riskLevel);
}

function showPredictionResult(willCancel, probability, riskLevel) {
  const resultElement = document.getElementById('predictionResult');
  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  const resultProbability = document.getElementById('resultProbability');
  const progressFill = document.getElementById('progressFill');
  const recommendationsList = document.getElementById('recommendationsList');

  const config = {
    high: { icon: 'x-circle', color: 'text-danger', progress: 'bg-danger' },
    medium: { icon: 'alert-triangle', color: 'text-warning', progress: 'bg-warning' },
    low: { icon: 'check-circle', color: 'text-success', progress: 'bg-success' }
  }[riskLevel];

  resultIcon.innerHTML = `<i data-lucide="${config.icon}" class="${config.color}"></i>`;
  lucide.createIcons();
  resultTitle.textContent = willCancel ? 'Likely to Cancel' : 'Likely to Keep';
  resultProbability.textContent = `${(probability * 100).toFixed(1)}%`;
  resultProbability.className = `result-probability prediction-${riskLevel}`;
  progressFill.style.width = `${probability * 100}%`;
  progressFill.className = `progress-fill ${config.progress}`;

  const recommendations = {
    high: ['Request a deposit', 'Prepare alternative bookings', 'Follow up with customer'],
    medium: ['Monitor booking status', 'Send a reminder', 'Prepare flexible alternatives'],
    low: ['Process normally', 'Consider upselling', 'Prepare for guest arrival']
  }[riskLevel];
  recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');

  resultElement.style.display = 'block';
  resultElement.scrollIntoView({ behavior: 'smooth' });
}
