import MainLayout from './components/layout/MainLayout';
import { AppProvider } from './contexts/AppContext';
import { InvoiceProvider } from './contexts/InvoiceContext';
import { DataMasterProvider } from './contexts/DataMasterContext';
import { WorkflowProvider } from './contexts/WorkflowContext';

function App() {
  return (
    <AppProvider>
      <DataMasterProvider>
        <WorkflowProvider>
          <InvoiceProvider>
            <MainLayout />
          </InvoiceProvider>
        </WorkflowProvider>
      </DataMasterProvider>
    </AppProvider>
  );
}

export default App;
