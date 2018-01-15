import axios from 'axios'

export function handleResponse(response) {
  // console.log('data - ', response.data)
  return response.data
}

export function handleError(error) {
  // console.log('error - ', JSON.stringify(error.response.data.error))
  // console.log('error - ', error)
  return error.response.data.error
}

export default function http({
  url, params = {}, headers = {}, method,
} = {}) {
  return axios({
    url,
    method: method || 'get',
    data: params,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
    .then(handleResponse)
    .catch(e => Promise.reject(handleError(e)))
}
