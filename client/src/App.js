import TextEditor from "./TextEditor";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
}
from 'react-router-dom'


import {v4 as uuidv4} from 'uuid'

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
        <Redirect to={`/documents/${uuidv4()}`}></Redirect>
        </Route>
        <Route path="/documents/:id" element = {<TextEditor/>}>
        <TextEditor/>
        </Route>
      </Switch>
    </Router>
    // <TextEditor/>
  )
}

export default App;
