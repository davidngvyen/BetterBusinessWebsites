const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Existing routes
// ... existing code ...

// Dashboard Analytics Routes
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const customers = await db.query('SELECT * FROM customers');
    const appointments = await db.query('SELECT * FROM appointments');
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Calculate basic stats
    const totalCustomers = customers.rows.length;
    const upcomingAppointments = appointments.rows.filter(apt => new Date(apt.start_time) > today).length;
    const monthlyRevenue = appointments.rows
      .filter(apt => new Date(apt.start_time) > lastMonth)
      .reduce((sum, apt) => sum + Number(apt.price || 0), 0);

    // Calculate customer retention
    const repeatCustomers = customers.rows.filter(customer => 
      appointments.rows.filter(apt => apt.customer_id === customer.id).length > 1
    ).length;
    const customerRetention = (repeatCustomers / totalCustomers) * 100;

    // Calculate average appointment value
    const averageAppointmentValue = monthlyRevenue / appointments.rows.length;

    res.json({
      totalCustomers,
      upcomingAppointments,
      monthlyRevenue,
      customerRetention,
      averageAppointmentValue
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/dashboard/insights', authenticateToken, async (req, res) => {
  try {
    const customers = await db.query('SELECT * FROM customers');
    const appointments = await db.query('SELECT * FROM appointments');
    
    // Calculate peak hours
    const hourCounts = {};
    appointments.rows.forEach(apt => {
      const hour = new Date(apt.start_time).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        count
      }));

    // Calculate trending styles
    const styles = {};
    customers.rows.forEach(customer => {
      styles[customer.style] = (styles[customer.style] || 0) + 1;
    });
    
    const trendingStyles = Object.entries(styles)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([style, count]) => ({ style, count }));

    // Calculate revenue growth
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const thisMonthRevenue = appointments.rows
      .filter(apt => new Date(apt.start_time) > lastMonth)
      .reduce((sum, apt) => sum + Number(apt.price || 0), 0);
    
    const previousMonth = new Date(lastMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const lastMonthRevenue = appointments.rows
      .filter(apt => {
        const aptDate = new Date(apt.start_time);
        return aptDate <= lastMonth && aptDate > previousMonth;
      })
      .reduce((sum, apt) => sum + Number(apt.price || 0), 0);
    
    const revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    res.json({
      peakHours,
      trendingStyles,
      customerSatisfaction: 92, // Placeholder - implement actual feedback system
      revenueGrowth
    });
  } catch (error) {
    console.error('Error fetching dashboard insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/dashboard/suggestions', authenticateToken, async (req, res) => {
  try {
    const customers = await db.query('SELECT * FROM customers');
    const appointments = await db.query('SELECT * FROM appointments');
    const today = new Date();
    
    // Get peak hours for scheduling tips
    const hourCounts = {};
    appointments.rows.forEach(apt => {
      const hour = new Date(apt.start_time).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0];

    // Get inactive customers
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const inactiveCustomers = customers.rows.filter(customer => {
      const lastAppointment = appointments.rows
        .filter(apt => apt.customer_id === customer.id)
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))[0];
      return lastAppointment && new Date(lastAppointment.start_time) < threeMonthsAgo;
    });

    // Get popular styles
    const styles = {};
    customers.rows.forEach(customer => {
      styles[customer.style] = (styles[customer.style] || 0) + 1;
    });
    
    const popularStyle = Object.entries(styles)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate customer retention
    const repeatCustomers = customers.rows.filter(customer => 
      appointments.rows.filter(apt => apt.customer_id === customer.id).length > 1
    ).length;
    const customerRetention = (repeatCustomers / customers.rows.length) * 100;

    const suggestions = {
      schedulingTips: [
        {
          tip: 'Consider adding more appointments during peak hours',
          reason: `Your busiest times are ${peakHour[0]}:00`
        },
        {
          tip: 'Follow up with inactive customers',
          reason: `${inactiveCustomers.length} customers haven't visited in over 3 months`
        }
      ],
      customerRecommendations: [
        {
          tip: `Promote ${popularStyle[0]} style packages`,
          reason: 'Most requested style this month'
        },
        {
          tip: 'Consider loyalty program',
          reason: `${customerRetention.toFixed(1)}% customer retention rate`
        }
      ],
      inventoryAlerts: [
        {
          alert: 'Low stock on styling products',
          action: 'Order more inventory'
        }
      ]
    };

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching dashboard suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/dashboard/activity', authenticateToken, async (req, res) => {
  try {
    const recentAppointments = await db.query(
      'SELECT * FROM appointments ORDER BY created_at DESC LIMIT 3'
    );
    const recentCustomers = await db.query(
      'SELECT * FROM customers ORDER BY created_at DESC LIMIT 2'
    );

    const activity = [...recentAppointments.rows, ...recentCustomers.rows]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        type: item.start_time ? 'appointment' : 'customer',
        title: item.start_time
          ? `New appointment with ${item.customer_name || 'Customer'}`
          : `New customer: ${item.fname} ${item.lname}`,
        time: item.created_at
      }));

    res.json(activity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 