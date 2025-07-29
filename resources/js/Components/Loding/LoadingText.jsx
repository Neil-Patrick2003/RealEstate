import React from 'react';
import './LoadingText.css'; // make sure this file contains the CSS you provided

const LoadingText = ({ text = 'Loading...' }) => {
    return (
        <div className="textWrapper">
            <p className="text">{text}</p>
            <div className="invertbox"></div>
        </div>
    );
};

export default LoadingText;
