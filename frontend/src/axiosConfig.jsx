import axios from 'axios';

const axiosInstance = axios.create({

  baseURL: 'http://localhost:5001', // Updated to run locally
  // baseURL: 'http://3.107.50.175:5001', // Updated to live

  headers: { 'Content-Type': 'application/json' },
});


export default axiosInstance;
