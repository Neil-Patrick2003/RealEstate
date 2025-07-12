import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);


const MyCalendar = ({ trippings }) => {
    const myEventsList = trippings.map((trip) => {
        const { visit_date, visit_time, property } = trip;

        const startDateTime = moment(`${visit_date}T${visit_time}`);
        const endDateTime = moment(startDateTime).add(1, 'hour');

        return {
            title: property?.title || 'Scheduled Visit',
            start: startDateTime.toDate(),
            end: endDateTime.toDate(),
            allDay: false,
        };
    });

    return (
        <div style={{ padding: '1rem' }}>
            <Calendar
                localizer={localizer}
                events={myEventsList}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                eventPropGetter={(event) => ({
                    style: {
                        backgroundColor: '#719440', // deep green
                        color: 'white',           // golden orange (or use '#FFA500' for orange-gold)
                        borderRadius: '5px',
                        border: 'none',
                        padding: '4px',
                    },
                })}
            />

        </div>
    );
};

export default MyCalendar;
