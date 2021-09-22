import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ConnectUtilityAccount from './components/ConnectUtilityAccount.jsx';
import SelectCarbonOffsetProject from './components/SelectCarbonOffsetProject.jsx';
import CarbonOffsetProjectDetail from './components/CarbonOffsetProjectDetail.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => (
  <BrowserRouter>
    <Switch>
        <Route exact path="/" component={ConnectUtilityAccount} />
        <Route exact path="/select" component={SelectCarbonOffsetProject} />
        <Route exact path="/select/:projectType" component={CarbonOffsetProjectDetail} />
    </Switch>
  </BrowserRouter>
);

export default App;