import axios from "axios";
import { env } from '../configs/env';

const api = axios.create({
    baseURL: `${env.API_URL}${env.API_PORT}`
})

export default api

