# 📊 Transaction Analysis API

Welcome to the Transaction Analysis API project! This project is part of the MERN Stack Internship at Roxiler Systems. The API allows you to analyze transaction data using various endpoints.

## 🚀 Features

- 🔄 **Initialize Database**: Load seed data into the database.
- 🔍 **List Transactions**: List transactions with search and pagination.
- 📅 **Monthly Statistics**: Get statistics for transactions in a selected month.
- 📊 **Bar Chart Data**: Get data for generating bar charts based on transaction prices.
- 🥧 **Pie Chart Data**: Get data for generating pie charts based on transaction categories.
- 🗂️ **Combined Data**: Fetch combined statistics, bar chart, and pie chart data for a selected month.

## 🛠️ Getting Started

### Prerequisites

- 🟢 Node.js
- 🟡 MongoDB

### Installation

1. 📥 Clone the repository:
    ```bash
    git clone [https://github.com/jigarvyasidea/-Roxiler-Systems]
    cd Roxiler-Systems
    ```

2. 📦 Install the dependencies:
    ```bash
    npm install
    ```

3. 🗄️ Start MongoDB:
    ```bash
    mongod
    ```

4. ▶️ Start the server:
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3000`.

### 📡 API Endpoints

#### 🔄 Initialize Database

Load seed data into the database.

- **URL**: `/api/initialize`
- **Method**: `GET`
- **Response**: `Database initialized with seed data` on success.

#### 🔍 List Transactions

List all transactions with search and pagination.

- **URL**: `/api/transactions`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (default: 1)
  - `perPage` (default: 10)
  - `search` (default: '')
  - `month`
- **Response**: JSON object with total transactions and the list of transactions.

#### 📅 Monthly Statistics

Get statistics for transactions in the selected month.

- **URL**: `/api/statistics`
- **Method**: `GET`
- **Query Parameters**:
  - `month`
- **Response**: JSON object with total sale amount, total sold items, and total not sold items.

#### 📊 Bar Chart Data

Get data for generating bar charts based on transaction prices for the selected month.

- **URL**: `/api/bar-chart`
- **Method**: `GET`
- **Query Parameters**:
  - `month`
- **Response**: JSON array with price ranges and their counts.

#### 🥧 Pie Chart Data

Get data for generating pie charts based on transaction categories for the selected month.

- **URL**: `/api/pie-chart`
- **Method**: `GET`
- **Query Parameters**:
  - `month`
- **Response**: JSON array with categories and their counts.

#### 🗂️ Combined Data

Fetch combined statistics, bar chart, and pie chart data for the selected month.

- **URL**: `/api/combined`
- **Method**: `GET`
- **Query Parameters**:
  - `month`
- **Response**: JSON object with statistics, bar chart data, and pie chart data.

## 📁 Project Structure

