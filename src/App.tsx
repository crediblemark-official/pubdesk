import MainLayout from './components/layout/MainLayout';
import { AppProvider } from './contexts/AppContext';
import { InvoiceProvider } from './contexts/InvoiceContext';

function App() {
  return (
    <AppProvider>
      <InvoiceProvider>
        <MainLayout />
      </InvoiceProvider>
    </AppProvider>
  );
}

export default App;
