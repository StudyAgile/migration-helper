import React, { Fragment, useEffect, useState } from "react";
import ForgeReconciler, {
  Tabs,
  Tab,
  TabList,
  TabPanel,
  Box,
  useProductContext,
  Text,
} from "@forge/react";

import { invoke } from "@forge/bridge";
import Tables from "./Tables"

const head = {
  cells: [
    {
      key: "issueType",
      content: "Issue Type",
      isSortable: true,
    },
    {
      key: "count",
      content: "Issues Count",
      isSortable: true,
    },
  ],
};
const userHead = {
  cells: [
    {
      key: "userRoles",
      content: "User Roles",
      isSortable: true,
    },
    {
      key: "uCount",
      content: "Count of Users",
      isSortable: true,
    },
  ],
};
const getRows = (data) => {
  try {
    console.log("Row Data: ", JSON.stringify(data));
    if (data) {
      console.log("Data type: ", typeof data);

      return data.map((iType, index) => ({
        key: `row-${index}-${iType.key}`,
        cells: [
          {
            key: createKey(iType.key),
            content: <Text>{iType.key}</Text>,
          },
          {
            key: createKey(iType.value),
            content: iType.value,
          },
        ],
      }));
    } else return null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createKey = (input) => {
  return input
    ? input
        .toString()
        .replace(/^(the|a|an)/, "")
        .replace(/\s/g, "")
    : input;
};





var totalIssues = 0;
var totalUsers = 0;
const App = () => {
  const context = useProductContext();
  const [issueRows, setIRows] = useState([]);
  const [userRows, setURows] = useState([]);

  useEffect(() => {
    if (context) {
      const projectId = context.extension.project.id;
      invoke("getIssueTypes", { projectId: projectId }).then((value) => {
        for (let index = 0; index < value.length; index++) {
          const row = JSON.stringify(value[index]).split(":");
          totalIssues += parseInt(row[2].replace("}", ""));
        }
        console.warn("Total issues found: ", totalIssues);
        setIRows(getRows(value));
      });
      invoke("getRoles", { projectId: projectId }).then((value) => {
        for (let index = 0; index < value.length; index++) {
          const row = JSON.stringify(value[index]).split(":");
          console.log(row[2].replace("}", ""));
          totalUsers += parseInt(row[2].replace("}", ""));
        }

        console.warn("Total Users found: ", totalUsers);
        value.length;
        setURows(getRows(value));
      });
    }
  }, [context]);
  return (
    <>
      <Fragment>
        <Box>

        </Box>
        <Tabs id="default">
          <TabList>
            <Tab>Issue Types</Tab>
            <Tab>Users</Tab>
          </TabList>
          <TabPanel>
              <Tables head={head} rows={issueRows} totalCount={totalIssues}/>
          </TabPanel>
          <TabPanel>
              <Tables head={head} rows={userRows} totalCount={totalUsers}/>
          </TabPanel>
        </Tabs>
      </Fragment>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
