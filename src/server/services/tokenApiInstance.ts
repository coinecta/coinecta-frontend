import axios from 'axios';

export const externalApi = axios.create({
  baseURL: `https://tokens.cardano.org`,
  headers: {
    'Content-type': 'application/json;charset=utf-8',
  }
});

export const syncApi = axios.create({
  baseURL: `http://localhost:5232`,
  headers: {
    'Content-type': 'application/json;charset=utf-8',
  }
});