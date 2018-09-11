import chalk from "chalk";
import jira from "./jira-api";
import { getJiraToken, getJiraHost } from "../config";

function displayIssues(res) {
  res.issues.forEach(({ key, fields }) => {
    console.log(
      `${key} - ${chalk.yellow(fields.priority.name)} / ${chalk.cyan(
        fields.status.name
      )}`
    );
    console.log(`${fields.reporter.displayName}`);
    console.log("description", fields.description);
    console.log("timespent", fields.timespent);
    console.log("estimate", fields.timeestimate);
    console.log("due", fields.duedate);
    // console.log(`${key} - ${JSON.stringify(fields.issuetype)}`)
    console.log(`${key} - ${JSON.stringify(fields.priority)}`);
    // console.log(`${key} - ${JSON.stringify(fields.status)}`)
    // console.log(`${key} - ${JSON.stringify(fields.progress)}`)
  });
}

function displayIssueCounts(res) {
  console.log(Object.keys(res.issues[0].fields));
  const issueGroups = res.issues.reduce((memo, issue) => {
    const { fields = {} } = issue;
    const { priority = {} } = fields;
    if (priority && priority.name) {
      return {
        ...memo,
        [priority.name]: (memo[priority.name] || 0) + 1
      };
    }

    return memo;
  }, {});

  Object.keys(issueGroups).forEach(key => {
    console.log(`${key} - ${issueGroups[key]} issues`);
  });
}

function displayProjects(res) {
  console.log(`${res.length} Project(s)`);
  console.log("--------------------------------");

  res.forEach(({ name, id, key }) => {
    console.log(`${id} - ${name}`);
    console.log(`==> ${getJiraHost()}/projects/${key}`);
    console.log("--------------------------------");
  });
}

export default function jiraCmd() {
  return jira({
    host: getJiraHost(),
    token: getJiraToken()
  })
    .getIssuesForUser()
    .then(displayIssueCounts);
}
