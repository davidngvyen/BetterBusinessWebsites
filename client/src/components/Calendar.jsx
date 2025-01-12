import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Grid,
  Paper,
} from '@mui/material';
import { 
    Select, 
    MenuItem,
    Menu,
    FormControl, 
    InputLabel 
} from '@mui/material';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styles/Calendar.css';

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customers, setCustomers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState({
    start: null,
    end: null
  });
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    fName: '',
    lName: '',
    pNum: '',
    price: '',
    style: ''
  });
  const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [contextMenu, setContextMenu] = useState(null); // Stores the context menu position
    const [selectedEvent, setSelectedEvent] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, customersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/appointments', { withCredentials: true }),
          axios.get('http://localhost:5000/api/customers', { withCredentials: true })
        ]);
        
        console.log('Received appointments:', appointmentsRes.data);
        console.log('Received customers:', customersRes.data);
        
        const calendarEvents = appointmentsRes.data.map(apt => ({
            id: apt.id,
            title: `${apt.customer_fname} ${apt.customer_lname}`,
            start: moment(`${apt.date} ${apt.start_time}`, 'YYYY-MM-DD HH:mm:ss').toDate(),
            end: moment(`${apt.date} ${apt.end_time}`, 'YYYY-MM-DD HH:mm:ss').toDate(),
            customer: apt.customer_id
          }));
        setEvents(calendarEvents);
        setCustomers(customersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data);
      }
    };
    fetchData();
  }, []);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const time = moment().hours(hour).minutes(minute);
        slots.push(time.format('HH:mm'));
      }
    }
    return slots;
  };

  const handleRightClick = (event, calendarEvent) => {
    event.preventDefault(); // Prevent the browser's default context menu
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
    setSelectedEvent(calendarEvent);
  };

  const handleDeleteEvent = async () => {
    try {
      console.log('Attempting to delete appointment with ID:', selectedEvent.id);
      await axios.delete(`http://localhost:5000/api/appointments/${selectedEvent.id}`, {
        withCredentials: true,
      });
  
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setContextMenu(null);
      alert('Appointment deleted successfully!');
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Appointment not found. It may have already been deleted.');
      } else {
        alert('Failed to delete appointment. Please try again.');
      }
      console.error('Error deleting appointment:', error);
    }
  };  
  

  const handleCloseContextMenu = () => {
    setContextMenu(null); // Close the context menu
  };
  
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#1976d2'
      }
    };
  };

  const EventComponent = ({ event }) => (
    <div
      style={{ fontSize: '12px', lineHeight: '1.2', cursor: 'context-menu' }}
      onContextMenu={(e) => handleRightClick(e, event)} // Trigger right-click menu
    >
      <strong>{event.title}</strong>
      <div>Phone: {event.phone}</div>
      <div>Price: ${event.price}</div>
      <div>Style: {event.style}</div>
    </div>
  );
  

  const handleSelectSlot = ({ start }) => {
    console.log('Selected slot:', { start });
    setSelectedDate(start);
    setDialogOpen(true);
  };
  
  const handleTimeChange = (type, value) => {
    if (type === 'start') {
      setSelectedStartTime(value);
      // Set end time to 1 hour after start time by default
      const endTime = moment(value, 'HH:mm').add(1, 'hour').format('HH:mm');
      setSelectedEndTime(endTime);
    } else {
      setSelectedEndTime(value);
    }
  };

  const handleAddAppointment = async () => {
    if (!selectedCustomer || !selectedStartTime || !selectedEndTime) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const appointmentDate = moment(selectedDate).format('YYYY-MM-DD');
        const appointment = {
        customer_id: selectedCustomer.id,
        date: appointmentDate,
        start_time: selectedStartTime + ':00',
        end_time: selectedEndTime + ':00',
        notes: ''
        };

        console.log('Sending appointment data:', appointment);

        const response = await axios.post(
        'http://localhost:5000/api/appointments',
        appointment,
        { withCredentials: true }
        );

        const newEvent = {
        id: response.data.id,
        title: `${response.data.customer_fname} ${response.data.customer_lname}`,
        start: moment(`${appointmentDate} ${selectedStartTime}`).toDate(),
        end: moment(`${appointmentDate} ${selectedEndTime}`).toDate(),
        customer: response.data.customer_id
        };

        setEvents(prevEvents => [...prevEvents, newEvent]);
        setDialogOpen(false);
        resetForm();
        alert('Appointment scheduled successfully!');
    } catch (error) {
        console.error('Error details:', error.response?.data);
        alert(`Error scheduling appointment: ${error.response?.data?.message || 'Please try again'}`);
    }
    };

    const resetForm = () => {
        setSelectedCustomer(null);
        setSelectedStartTime('');
        setSelectedEndTime('');
        setShowNewCustomerForm(false);
    };

  const handleAddNewCustomer = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/customers',
        newCustomer,
        { withCredentials: true }
      );
      setCustomers([...customers, response.data]);
      setSelectedCustomer(response.data);
      setShowNewCustomerForm(false);
      setNewCustomer({
        fName: '',
        lName: '',
        pNum: '',
        price: '',
        style: ''
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Error adding customer. Please try again.');
    }
  };

  return (
    <div className="calendar-container">
        <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            step={7.5}
            timeslots={4}
            defaultView="week"
            views={['day', 'week', 'month']}
            min={moment().hours(8).minutes(0).toDate()}  // Changed to 8 AM
            max={moment().hours(20).minutes(0).toDate()} // Changed to 8 PM
            eventPropGetter={eventStyleGetter}
            components={{
                event: EventComponent
            }}
            formats={{
                eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                `${localizer.format(start, 'h:mm A')} - ${localizer.format(end, 'h:mm A')}`
            }}
        />
        {/* Context Menu */}
        {contextMenu && (
            <Menu
                open={Boolean(contextMenu)}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                contextMenu
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
                }
            >
                <MenuItem onClick={handleDeleteEvent}>Delete Appointment</MenuItem>
            </Menu>
        )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>
            Schedule Appointment for {moment(selectedDate).format('MMMM D, YYYY')}
            </DialogTitle>
        <DialogContent>
            <Grid container spacing={3}>
                {/* Time Selection */}
                <Grid item xs={12}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                    <FormControl fullWidth>
                        <InputLabel>Start Time</InputLabel>
                        <Select
                        value={selectedStartTime}
                        label="Start Time"
                        onChange={(e) => handleTimeChange('start', e.target.value)}
                        >
                        {generateTimeSlots().map((time) => (
                            <MenuItem key={time} value={time}>
                            {moment(time, 'HH:mm').format('h:mm A')}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                    <FormControl fullWidth>
                        <InputLabel>End Time</InputLabel>
                        <Select
                        value={selectedEndTime}
                        label="End Time"
                        onChange={(e) => handleTimeChange('end', e.target.value)}
                        disabled={!selectedStartTime}
                        >
                        {generateTimeSlots()
                            .filter(time => time > selectedStartTime)
                            .map((time) => (
                            <MenuItem key={time} value={time}>
                                {moment(time, 'HH:mm').format('h:mm A')}
                            </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    </Grid>
                </Grid>
                </Grid>

                {/* Customer Selection */}
                <Grid item xs={12}>
                <Autocomplete
                    options={customers}
                    getOptionLabel={(customer) => 
                    `${customer.fname} ${customer.lname} - ${customer.pnum}`
                    }
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    value={selectedCustomer}
                    onChange={(event, newValue) => setSelectedCustomer(newValue)}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search Customer"
                        variant="outlined"
                    />
                    )}
                />
                </Grid>

                {/* Add New Customer Button */}
                <Grid item xs={12}>
                <Button
                    variant="outlined"
                    onClick={() => setShowNewCustomerForm(true)}
                >
                    Add New Customer
                </Button>
                </Grid>

                {/* New Customer Form */}
                {showNewCustomerForm && (
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="First Name"
                            value={newCustomer.fName}
                            onChange={(e) => 
                            setNewCustomer({ ...newCustomer, fName: e.target.value })
                            }
                        />
                        </Grid>
                        <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={newCustomer.lName}
                            onChange={(e) => 
                            setNewCustomer({ ...newCustomer, lName: e.target.value })
                            }
                        />
                        </Grid>
                        <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={newCustomer.pNum}
                            onChange={(e) => 
                            setNewCustomer({ ...newCustomer, pNum: e.target.value })
                            }
                        />
                        </Grid>
                        <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={newCustomer.price}
                            onChange={(e) => 
                            setNewCustomer({ ...newCustomer, price: e.target.value })
                            }
                        />
                        </Grid>
                        <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Style"
                            value={newCustomer.style}
                            onChange={(e) => 
                            setNewCustomer({ ...newCustomer, style: e.target.value })
                            }
                        />
                        </Grid>
                        <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={handleAddNewCustomer}
                            fullWidth
                        >
                            Add Customer
                        </Button>
                        </Grid>
                    </Grid>
                    </Paper>
                </Grid>
                )}
            </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddAppointment}
            variant="contained"
            disabled={!selectedCustomer}
          >
            Schedule Appointment
          </Button>
        </DialogActions>
      </Dialog>
      
    </div>
  );
};

export default Calendar;