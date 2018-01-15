import jira from './jira-api'
import {
  getJiraToken,
  getJiraHost,
} from '../config'

export default function jiraCmd() {
  return jira({
    host: getJiraHost(),
    token: getJiraToken(),
  })
    .getProjects()
    .then((res) => {
      console.log(`${res.length} Project(s)`)
      console.log('--------------------------------')

      res.forEach(({ name, id, key }) => {
        console.log(`${id} - ${name}`)
        console.log(`==> ${getJiraHost()}/projects/${key}`)
        console.log('--------------------------------')
      })
    })
}
