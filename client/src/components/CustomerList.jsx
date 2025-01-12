import { useEffect, useState } from 'react';
import axios from 'axios';

function CustomerList() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
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

    fetchCustomers();
  }, []);

  return (
    <div>
      <h2>Customer List</h2>
      <ul>
        {customers.map(customer => (
          <li key={customer.id}>{customer.fname} {customer.lname}</li>
        ))}
      </ul>
    </div>
  );
}

export default CustomerList;
