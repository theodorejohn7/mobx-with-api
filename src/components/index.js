import React from "react";
import { render } from "react-dom";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import glamorous from "glamorous";

const AppView = glamorous("div")({
  fontFamily: "sans-serif"
});

function createAsyncOp(api) {
  const store = observable({
    loading: false,
    data: null,
    error: null,
    fetch: action(async function(input) {
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
    })
  });
  return store;
}

const asyncOp = createAsyncOp(() =>
  fetch("https://api.github.com/users/kentcdodds/repos")
);
const RepoView = glamorous("div")({
  margin: 4,
  padding: 4,
  borderRadius: "0.4rem",
  border: `1px solid lightgrey`
});

const NameView = glamorous("div")({
  fontSize: "16px",
  fontWeight: "bold"
});

function Repo({ repo = {} }) {
  return (
    <RepoView>
      <div>
        <NameView>
          {repo.name}
        </NameView>
      </div>
      <div>
        {repo.description}
      </div>
      <div>
        stars {repo.stargazers_count}
      </div>
    </RepoView>
  );
}

const Repos = observer(function Repos({ repos }) {
  if (!repos) return null;
  return (
    <div>
      {repos.map((repo, key) => <Repo key={key} repo={repo} />)}
    </div>
  );
});

const App = observer(({ asyncOp }) =>
  <AppView>
    <h2>
      Fetching data with fetch, stored in mobx {"\u2728"}
    </h2>
    <div>
      {asyncOp.loading ? "Loading" : null}
    </div>
    <div>
      {asyncOp.data && !asyncOp.error && <Repos repos={asyncOp.data} />}
    </div>
    <div>
      {asyncOp.error && asyncOp.error.message}
    </div>
  </AppView>
);

render(<App asyncOp={asyncOp} />, document.getElementById("root"));

asyncOp.fetch();
