import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api', // local
  //baseURL: 'http://3.106.182.207:5001', // live
  headers: { 'Content-Type': 'application/json' },
});


export default axiosInstance;
