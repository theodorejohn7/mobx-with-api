import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { render } from "react-dom";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import LinearProgress from "@mui/material/LinearProgress";

function createAsyncOp(api) {
  const store = observable({
    loading: false,
    data: null,
    error: null,
    fetch: action(async function (input) {
      try {
        store.loading = true;
        store.error = null;
        store.data = null;
        const response = await api(input);
        const json = await response.json();
        if (response.status === 200) {
          store.data = json;
        } else {
          store.error = json;
        }
        return json;
      } catch (error) {
        console.error("fetch error ", error);
        store.error = error;
        throw error;
      } finally {
        store.loading = false;
      }
    }),
  });
  return store;
}

const asyncOp = createAsyncOp(() =>
  fetch("https://api.github.com/users/theodorejohn7/repos")
);

function Repo({ repo = {} }) {
  return (
    <>
      <Accordion
        sx={{
          backgroundColor: "success.main",
        
          borderRadius:2,
        
         
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            "& > :not(style)": {
              m: 1,
              width: 450,
              backgroundColor: "primary.main",

              // height: 128,
            },
          }}
        >
          <Paper elevation={20}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography
                style={{ color: "white", textTransform: "uppercase" }}
              >
                {" "}
                {repo.name}
              </Typography>
            </AccordionSummary>
          </Paper>
        </Box>
        <AccordionDetails>
          <Typography>
            <div>Created on : {repo.created_at}</div>
            <div>Last Update on : {repo.updated_at}</div>
            <div>Scripting Language Used : {repo.language}</div>

            <div>URL : {repo.html_url}</div>
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

const Repos = observer(function Repos({ repos }) {
  if (!repos) return null;
  return (
    <div>
      {repos.map((repo, key) => (
        <Repo key={key} repo={repo} />
      ))}
    </div>
  );
});

const App = observer(({ asyncOp }) => (
  <>
    <div style={{ width: "450px" }}>
      <h2>
        {" "}
        {"\u2728"} Theodore's Github Details {"\u2728"}
      </h2>
      <div>
        {asyncOp.loading ? (
          <Box sx={{ width: "100%" }}>
            <LinearProgress />
          </Box>
        ) : null}
      </div>

      <div>
        {asyncOp.data && !asyncOp.error && <Repos repos={asyncOp.data} />}
      </div>

      <div>{asyncOp.error && asyncOp.error.message}</div>
    </div>
  </>
));

render(<App asyncOp={asyncOp} />, document.getElementById("root"));

asyncOp.fetch();
