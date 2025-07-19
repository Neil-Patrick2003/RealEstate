// components/ColumnChart.jsx
import React from "react";
import Chart from "react-apexcharts";

const ColumnChart = ({ series, categories, title }) => {
    const chartOptions = {
        chart: {
            type: "bar",
            height: 350,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "55%",
                endingShape: "rounded",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: false,
            width: 1,
            colors: ["transparent"],
        },
        xaxis: {
            categories: categories,
        },
        yaxis: {
            title: {
                text: title,
            },
        },
        fill: {
            opacity: 10,
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return `${val} inquiries`;
                },
            },
        },
        colors: ["#719440"], // ✅ Set bar color here
    };

    return (
        <div className="w-full">
            <Chart
                options={chartOptions}
                series={series}
                type="bar"
                height={350}
            />
        </div>
    );
};

export default ColumnChart;
