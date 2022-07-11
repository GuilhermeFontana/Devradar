import { Page } from './pages/Page'
import { DevsContextProvider } from './contexts/DevsContext';


function App() {
  
  return (
    <DevsContextProvider>
      <Page />
    </DevsContextProvider>
  );
}

export default App;
