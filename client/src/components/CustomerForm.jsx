import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Grid, Paper, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import './styles/CustomerForm.css';

const CustomerForm = () => {
  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    pNum: '',
    price: '',
    style: ''
  });

  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editData, setEditData] = useState(null); // State for the customer being edited
  const [editDialogOpen, setEditDialogOpen] = useState(false); // State for dialog visibility

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customers', {
          withCredentials: true,
        });
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error.response || error);
        alert('Failed to fetch customers. Please log in again.');
      }
    };

    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/customers', formData, {
        withCredentials: true,
      });
      setResults([...results, response.data]);
      setFormData({
        fName: '',
        lName: '',
        pNum: '',
        price: '',
        style: ''
      });
      alert('Customer added successfully!');
    } catch (error) {
      console.error('Error adding customer:', error.response || error);
      alert('Error adding customer');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`, {
        withCredentials: true,
      });
      setResults(results.filter((customer) => customer.id !== id));
      alert('Customer deleted successfully!');
    } catch (error) {
      console.error('Error deleting customer:', error.response || error);
      alert('Error deleting customer');
    }
  };

  const handleEdit = (customer) => {
    setEditData(customer); // Set the customer to be edited
    setEditDialogOpen(true); // Open the dialog
  };

  const handleEditSubmit = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/customers/${editData.id}`, editData, {
        withCredentials: true,
      });
      // Update the results list with the edited customer
      setResults(results.map((customer) => (customer.id === editData.id ? response.data : customer)));
      setEditDialogOpen(false);
      setEditData(null);
      alert('Customer updated successfully!');
    } catch (error) {
      console.error('Error updating customer:', error.response || error);
      alert('Error updating customer');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const filteredResults = results.filter((customer) => {
    const search = searchQuery.toLowerCase();
    const fullName = `${customer.fname} ${customer.lname}`.toLowerCase();
    return (
      fullName.includes(search) ||
      customer.fname.toLowerCase().includes(search) ||
      customer.lname.toLowerCase().includes(search) ||
      customer.pnum.startsWith(search)
    );
  });

  return (
    <div>
    {/* Search Bar */}
    <div style={{ padding: '20px', marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
          <TextField
            fullWidth
            label="Search Customers"
            value={searchQuery}
            onChange={handleSearch}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderWidth: '2px', // Adjust the border thickness
                },
                '&:hover fieldset': {
                  borderWidth: '2px', // Border thickness on hover
                },
                '&.Mui-focused fieldset': {
                  borderWidth: '2px', // Border thickness when focused
                },
              },
            }}
          />
      </div>
      <div id="form-container" style={{ padding: '20px' }}>
        <Paper elevation={3} className="form-paper" style={{ padding: '20px', marginBottom: '20px' }}>
          <Typography variant="h4" gutterBottom>
            Add New Customer
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="First name"
                  name="fName"
                  value={formData.fName}
                  onChange={(e) => setFormData({ ...formData, fName: e.target.value })}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Last name"
                  name="lName"
                  value={formData.lName}
                  onChange={(e) => setFormData({ ...formData, lName: e.target.value })}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="pNum"
                  value={formData.pNum}
                  onChange={(e) => setFormData({ ...formData, pNum: e.target.value })}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  variant="outlined"
                  type="number"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Style"
                  name="style"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Add Customer
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {filteredResults.map((result, index) => (
          <Paper elevation={3} key={index} className="result-paper" style={{ padding: '20px', marginBottom: '20px' }}>
            <Typography><strong>First name:</strong> {result.fname}</Typography>
            <Typography><strong>Last name:</strong> {result.lname}</Typography>
            <Typography><strong>Phone Number:</strong> {result.pnum}</Typography>
            <Typography><strong>Price:</strong> ${result.price}</Typography>
            <Typography><strong>Style:</strong> {result.style}</Typography>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleEdit(result)}
                style={{ marginRight: '10px', width: '200px' }} // Add a specific width
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDelete(result.id)}
                style={{ width: '200px' }} // Add a specific width
              >
                Delete
              </Button>
            </div>
          </Paper>
        ))}

        {/* Edit Dialog */}
        {editDialogOpen && (
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                label="First name"
                name="fname"
                value={editData.fname}
                onChange={handleEditChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Last name"
                name="lname"
                value={editData.lname}
                onChange={handleEditChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Phone Number"
                name="pnum"
                value={editData.pnum}
                onChange={handleEditChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Price"
                name="price"
                type="number"
                value={editData.price}
                onChange={handleEditChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Style"
                name="style"
                value={editData.style}
                onChange={handleEditChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} color="primary" variant="contained">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default CustomerForm;
