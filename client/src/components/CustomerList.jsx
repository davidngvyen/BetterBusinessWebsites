import { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton
} from '@mui/material';
import moment from 'moment';
import axios from 'axios';
import './styles/CustomerList.css';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers', {
        withCredentials: true,
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('Failed to fetch customers. Please log in again.');
    }
  };

  const fetchCustomerAppointments = async (customerId) => {
    try {
      const response = await axios.get('http://localhost:5000/api/appointments', {
        withCredentials: true,
      });
      // Filter appointments for the selected customer
      const customerAppointments = response.data.filter(
        apt => apt.customer_id === customerId
      );
      setAppointments(customerAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      alert('Failed to fetch appointment history.');
    }
  };

  const handleCustomerClick = async (customer) => {
    setSelectedCustomer(customer);
    await fetchCustomerAppointments(customer.id);
    setDialogOpen(true);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredCustomers = customers.filter(customer => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      customer.fname.toLowerCase().includes(searchTerm) ||
      customer.lname.toLowerCase().includes(searchTerm) ||
      customer.pnum.includes(searchTerm)
    );
  });

  return (
    <div className="customer-list">
      <div className="customer-list-header">
        <Typography variant="h4" component="h1">
          Customer List
        </Typography>
        <TextField
          className="search-field"
          variant="outlined"
          placeholder="Search customers..."
          onChange={handleSearch}
          fullWidth
        />
      </div>

      <div className="customer-grid">
        {filteredCustomers.map(customer => (
          <Paper
            key={customer.id}
            className="customer-card"
            onClick={() => handleCustomerClick(customer)}
          >
            <Typography variant="h6" className="customer-name">
              {customer.fname} {customer.lname}
            </Typography>
            <Typography className="customer-info">
              <strong>Phone:</strong> {customer.pnum}
            </Typography>
            <Typography className="customer-info">
              <strong>Price:</strong> ${customer.price}
            </Typography>
            <Typography className="customer-info">
              <strong>Style:</strong> {customer.style}
            </Typography>
          </Paper>
        ))}
      </div>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="appointment-history-title">
          Appointment History - {selectedCustomer?.fname} {selectedCustomer?.lname}
        </DialogTitle>
        <DialogContent dividers>
          {appointments.length > 0 ? (
            <div className="appointment-list">
              {appointments.map(appointment => (
                <Paper key={appointment.id} className="appointment-item">
                  <Typography variant="h6">
                    {moment(appointment.date).format('MMMM D, YYYY')}
                  </Typography>
                  <Typography>
                    Time: {moment(appointment.start_time, 'HH:mm:ss').format('h:mm A')} - 
                    {moment(appointment.end_time, 'HH:mm:ss').format('h:mm A')}
                  </Typography>
                  {appointment.notes && (
                    <Typography className="appointment-notes">
                      Notes: {appointment.notes}
                    </Typography>
                  )}
                </Paper>
              ))}
            </div>
          ) : (
            <Typography className="no-appointments">
              No appointment history found for this customer.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CustomerList;
