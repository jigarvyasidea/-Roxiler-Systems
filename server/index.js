const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mern-challenge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  category: String,
  sold: Boolean,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Route to initialize the database
app.get('/api/initialize', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    await Transaction.deleteMany({});
    await Transaction.insertMany(response.data);
    res.send('Database initialized with seed data.');
  } catch (error) {
    res.status(500).send('Error initializing database.');
  }
});

// Route to get all transactions with pagination and search
app.get('/api/transactions', async (req, res) => {
  const { month, page = 1, search = '', perPage = 10 } = req.query;
  const query = {
    dateOfSale: { $regex: `-${month.padStart(2, '0')}-`, $options: 'i' }
  };

  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { price: new RegExp(search, 'i') },
    ];
  }

  const transactions = await Transaction.find(query)
    .skip((page - 1) * perPage)
    .limit(parseInt(perPage));
  const total = await Transaction.countDocuments(query);

  res.json({ transactions, total });
});

// Route to get statistics for a given month
app.get('/api/statistics', async (req, res) => {
  const { month } = req.query;
  const regex = new RegExp(`-${month.padStart(2, '0')}-`, 'i');

  const totalSaleAmount = await Transaction.aggregate([
    { $match: { dateOfSale: regex, sold: true } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);

  const totalSoldItems = await Transaction.countDocuments({ dateOfSale: regex, sold: true });
  const totalNotSoldItems = await Transaction.countDocuments({ dateOfSale: regex, sold: false });

  res.json({
    totalSaleAmount: totalSaleAmount[0]?.total || 0,
    totalSoldItems,
    totalNotSoldItems,
  });
});

// Route to get bar chart data for a given month
app.get('/api/bar-chart', async (req, res) => {
  const { month } = req.query;
  const regex = new RegExp(`-${month.padStart(2, '0')}-`, 'i');
  const ranges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Infinity },
  ];

  const barData = await Promise.all(ranges.map(async (range) => {
    const count = await Transaction.countDocuments({
      dateOfSale: regex,
      price: { $gte: range.min, $lte: range.max },
    });
    return { range: range.range, count };
  }));

  res.json(barData);
});

// Route to get pie chart data for a given month
app.get('/api/pie-chart', async (req, res) => {
  const { month } = req.query;
  const regex = new RegExp(`-${month.padStart(2, '0')}-`, 'i');

  const pieData = await Transaction.aggregate([
    { $match: { dateOfSale: regex } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  res.json(pieData.map((item) => ({ category: item._id, count: item.count })));
});

// Route to get combined data from all the above APIs
app.get('/api/combined-data', async (req, res) => {
  const { month } = req.query;

  const [transactionsResponse, statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
    axios.get('http://localhost:3000/api/transactions', { params: { month, page: 1, search: '' } }),
    axios.get('http://localhost:3000/api/statistics', { params: { month } }),
    axios.get('http://localhost:3000/api/bar-chart', { params: { month } }),
    axios.get('http://localhost:3000/api/pie-chart', { params: { month } }),
  ]);

  res.json({
    transactions: transactionsResponse.data,
    statistics: statisticsResponse.data,
    barChart: barChartResponse.data,
    pieChart: pieChartResponse.data,
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
