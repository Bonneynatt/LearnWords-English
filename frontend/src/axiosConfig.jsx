import axios from 'axios';
//updated
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // Updated to include /api
  //baseURL: 'http://3.24.232.242:5001', //live
  headers: { 'Content-Type': 'application/json' },
});




export default axiosInstance;
