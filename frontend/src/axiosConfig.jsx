import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // Updated to run locally
  //baseURL: 'http://13.239.243.228:5001', // Updated to live
  headers: { 'Content-Type': 'application/json' },
});


export default axiosInstance;
