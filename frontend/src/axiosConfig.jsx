import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // Updated to include /api
  //baseURL: 'http://13.211.99.24:5001', //live
  headers: { 'Content-Type': 'application/json' },
});



export default axiosInstance;
