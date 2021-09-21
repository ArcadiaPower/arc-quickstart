import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ConnectUtilityAccount from './components/ConnectUtilityAccount.jsx';
import SelectCarbonOffsetProject from './components/SelectCarbonOffsetProject.jsx';

const App = () => (
  <BrowserRouter>
    <Switch>
        <Route exact path="/" component={ConnectUtilityAccount} />
        <Route exact path="/select" component={SelectCarbonOffsetProject} />
    </Switch>
  </BrowserRouter>
);

export default App;