// PieChart.jsx
import React from 'react';
import ReactApexChart from 'react-apexcharts';

const PieChart = ({ series = [], labels = [], width = 380, colors = [] }) => {
    const options = {
        chart: {
            width,
            type: 'pie',
        },
        labels,
        colors: colors.length > 0 ? colors : undefined,
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200,
                    },
                    legend: {
                        position: 'bottom',
                    },
                },
            },
        ],
    };

    return (
        <ReactApexChart
            options={options}
            series={series}
            type="pie"
            width={width}
        />
    );
};

export default PieChart;
