import React, { useState, useEffect } from "react";

import "./custom.slider.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faArrowRight} from "@fortawesome/free-solid-svg-icons";

function CustomCarousel({ children }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [slideDone, setSlideDone] = useState(true);
    const [timeID, setTimeID] = useState(null);

    useEffect(() => {
        if (slideDone) {
            setSlideDone(false);
            setTimeID(
                setTimeout(() => {
                    slideNext();
                    setSlideDone(true);
                }, 5000)
            );
        }
    }, [slideDone]);

    const slideNext = () => {
        setActiveIndex((val) => {
            if (val >= children.length - 1) {
                return 0;
            } else {
                return val + 1;
            }
        });
    };

    const slidePrev = () => {
        setActiveIndex((val) => {
            if (val <= 0) {
                return children.length - 1;
            } else {
                return val - 1;
            }
        });
    };

    const AutoPlayStop = () => {
        if (timeID > 0) {
            clearTimeout(timeID);
            setSlideDone(false);
        }
    };

    const AutoPlayStart = () => {
        if (!slideDone) {
            setSlideDone(true);
        }
    };

    return (
        <div className="container__slider">
            {/* Top-right nav buttons */}
            <div className="container__slider__buttons">
                <button onClick={(e) => { e.preventDefault(); slidePrev(); }}><FontAwesomeIcon icon={faArrowLeft} /></button>
                <button onClick={(e) => { e.preventDefault(); slideNext(); }}><FontAwesomeIcon icon={faArrowRight} /></button>
            </div>

            {/* Top-left indicators */}
            <div className="container__slider__links">
                {children.map((_, index) => (
                    <button
                        key={index}
                        className={
                            activeIndex === index
                                ? "container__slider__links-small container__slider__links-small-active"
                                : "container__slider__links-small"
                        }
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveIndex(index);
                        }}
                    ></button>
                ))}
            </div>

            {/* Slide Items */}
            {children.map((item, index) => (
                <div
                    className={`slider__item slider__item-active-${activeIndex + 1}`}
                    key={index}
                >
                    {item}
                </div>
            ))}
        </div>

    );
}

export default CustomCarousel;
