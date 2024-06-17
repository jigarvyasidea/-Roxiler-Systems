const express = require('express');
const router = express.Router();

const axios = require('axios');

const Transaction = require('../models/Transaction');




router.get('/initalize' , async (req , res)=>{
    try{
       const response  = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      await Transaction.insertMany(response.data);
      res.send('db chala gayg seed db me ');
    } catch(error){
        res.status(500).send(error.message);
    }
});



router.get('/transactions', async (req, res) => {
    const { page = 1, perPage = 10, search = '', month } = req.query;
    const query = {
      dateOfSale: { $regex: new RegExp(`-${month}-`, 'i') },
      $or: [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { price: { $regex: new RegExp(search, 'i') } },
      ],
    };
  
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));
    const total = await Transaction.countDocuments(query);
  
    res.json({ total, transactions });
  });
  

  router.get('/statistics', async (req, res) => {
    const { month } = req.query;
    const transactions = await Transaction.find({
      dateOfSale: { $regex: new RegExp(`-${month}-`, 'i') },
    });
  
    const totalSaleAmount = transactions.reduce((sum, transaction) => sum + transaction.price, 0);
    const totalSoldItems = transactions.filter(transaction => transaction.sold).length;
    const totalNotSoldItems = transactions.length - totalSoldItems;
  
    res.json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
  });
  



  router.get('/bar-chart', async (req, res) => {
    const { month } = req.query;
    const transactions = await Transaction.find({
      dateOfSale: { $regex: new RegExp(`-${month}-`, 'i') },
    });
  
    const priceRanges = [
      { range: '0-100', count: 0 },
      { range: '101-200', count: 0 },
      { range: '201-300', count: 0 },
      { range: '301-400', count: 0 },
      { range: '401-500', count: 0 },
      { range: '501-600', count: 0 },
      { range: '601-700', count: 0 },
      { range: '701-800', count: 0 },
      { range: '801-900', count: 0 },
      { range: '901-above', count: 0 },
    ];
  
    transactions.forEach(transaction => {
      if (transaction.price <= 100) priceRanges[0].count++;
      else if (transaction.price <= 200) priceRanges[1].count++;
      else if (transaction.price <= 300) priceRanges[2].count++;
      else if (transaction.price <= 400) priceRanges[3].count++;
      else if (transaction.price <= 500) priceRanges[4].count++;
      else if (transaction.price <= 600) priceRanges[5].count++;
      else if (transaction.price <= 700) priceRanges[6].count++;
      else if (transaction.price <= 800) priceRanges[7].count++;
      else if (transaction.price <= 900) priceRanges[8].count++;
      else priceRanges[9].count++;
    });
  
    res.json(priceRanges);
  });

  
  router.get('/pie-chart', async (req, res) => {
    const { month } = req.query;
    const transactions = await Transaction.find({
      dateOfSale: { $regex: new RegExp(`-${month}-`, 'i') },
    });
  
    const categoryCounts = transactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + 1;
      return acc;
    }, {});
  
    const result = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));
  
    res.json(result);
  });
  

  router.get('/combined', async (req, res) => {
    const { month } = req.query;
  
    const [statistics, barChart, pieChart] = await Promise.all([
      axios.get(`http://localhost:3000/api/statistics?month=${month}`),
      axios.get(`http://localhost:3000/api/bar-chart?month=${month}`),
      axios.get(`http://localhost:3000/api/pie-chart?month=${month}`),
    ]);
  
    res.json({
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data,
    });
  });

  
  

