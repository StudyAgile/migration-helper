import Resolver from "@forge/resolver";
import api, { route, authorize } from "@forge/api";

const resolver = new Resolver();

resolver.define("getRoles", async (req) => {
  const projectId = req.payload.projectId;
  const canEdit = await authorize().onJiraProject(projectId).canCreateIssues();
  if (canEdit) {
    try {
      const rolesResponse = await api
        .asApp()
        .requestJira(route`/rest/api/latest/project/${projectId}/role`, {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
        });

      if (!rolesResponse.ok) throw new Error("Unable to fetch user roles.");
      const links = await rolesResponse.json();
      const roles = JSON.stringify(links).split(",");
      console.info("Roles count: ", roles.length);
      const rolesOfUser = [];
      for (let index = 0; index < roles.length; index++) {
        const element = roles[index].split(":");
        console.info(
          "element : ",
          element[0].replace('"', "").replace("{", "").replace('"', "")
        );
        if (
          element &&
          element[0].replace('"', "").replace("{", "").replace('"', "") !==
            "atlassian-addons-project-access"
        ) {
          const link = element[2].substring(
            element[2].indexOf("/rest"),
            element[2].length
          );
          const roleID = link
            .substring(link.lastIndexOf("/") + 1)
            .replace('"', "")
            .replace("}", "")
            .replace("{", "")
            .trim();

          const res = await api
            .asApp()
            .requestJira(
              route`/rest/api/latest/project/${projectId}/role/${roleID}`,
              {
                headers: {
                  accept: "application/json",
                  "content-type": "application/json",
                },
              }
            );
          console.log(`UserCount Response: ${res.status} ${res.statusText}`);
          const isOk = res.status === 200;
          if (isOk) {
            const data = await res.json();
            const userCount = data.actors == undefined ? 0 : data.actors.length;
            rolesOfUser.push({
              key: element[0]
                .replace('"', "")
                .replace("}", "")
                .replace("{", "")
                .replace('"', ""),
              value: userCount,
            });
          } else throw new Error(res.statusText);
        }
      }
      console.info("Total Users: ", rolesOfUser.length);
      return rolesOfUser;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
});

const fetchNumIssue = async (issueTypeName, projectKey) => {
  try {
    // console.log("in numIssues: " + issueTypeName);
    const jql = `project = ${projectKey} and issueType = ${issueTypeName}`;
    const res = await api
      .asApp()
      .requestJira(route`/rest/api/latest/search?jql=${jql}`, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
      });
    const data = await res.json();
    const dataTotal = data.total == undefined ? 0 : data.total;
    return { key: issueTypeName, value: dataTotal };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

resolver.define("getIssueTypes", async (req) => {
  let numIssues = [];
  const projectId = req.payload.projectId;
  const projectKey = req.context.extension.project.key;
  console.info(`Project id: ${projectId}`);
  const canEdit = await authorize().onJiraProject(projectId).canCreateIssues();
  if (canEdit) {
    try {
      const response = await api
        .asApp()
        .requestJira(
          route`/rest/api/latest/issuetype/project?projectId=${projectId}`,
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
            },
          }
        );
      const data = await response.json();

      for (const issueType of data) {
        try {
          const data = await fetchNumIssue(
            issueType.untranslatedName,
            projectKey
          );
          numIssues.push(data);
        } catch (error) {
          console.log(error);
          throw error;
        }
      }
      console.info("Total Issues: ", numIssues.length);
      return numIssues;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
});

export const handler = resolver.getDefinitions();
