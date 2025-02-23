document.addEventListener('DOMContentLoaded', function () {
    var ctx = document.getElementById('productChart').getContext('2d');
    var productChart = new Chart(ctx, {
        type: 'bar', // Loại biểu đồ: bar, line, pie, etc.
        data: {
            labels: ['Tổng số', 'Hoạt động', 'Dừng hoạt động'],
            datasets: [{
                label: 'Thống kê sản phẩm',
                data: [
                    productStatistics.total,
                    productStatistics.active,
                    productStatistics.inactive
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});