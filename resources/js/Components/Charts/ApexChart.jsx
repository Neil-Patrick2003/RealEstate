import React from 'react';
import ReactApexChart from 'react-apexcharts';

const ApexChart = ({ categories = [], series = [] }) => {
    const options = {
        chart: {
            height: 350,
            width: '100%', // You can adjust or make this a prop too
            type: 'area',
            toolbar: { show: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        xaxis: {
            type: 'datetime',
            categories: categories,  // <-- pass array directly, no extra braces
        },
        tooltip: {
            x: { format: 'dd/MM/yy HH:mm' }
        }
    };

    return (
        <div>
            <ReactApexChart
                options={options}
                series={series}
                type="area"
                height={350}
                width="100%"
            />
        </div>
    );
};

export default ApexChart;
