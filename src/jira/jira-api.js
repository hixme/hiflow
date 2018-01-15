import http from '../http'

export default function jiraAPI({ token, host } = {}, httpClient = http) {
  const BASE_URL = `https://${host}/rest/api/2`

  function request({ url, params = {}, method } = {}) {
    return httpClient({
      url,
      params,
      headers: {
        Authorization: `Basic ${token}`,
      },
      ...(method ? { method } : {}),
    })
  }

  function getProjects() {
    return request({ url: `${BASE_URL}/project` })
  }

  return {
    request,
    getProjects,
  }
}
