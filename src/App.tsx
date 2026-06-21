import { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import { InvoiceProvider } from './contexts/InvoiceContext';
import { DataMasterProvider } from './contexts/DataMasterContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayoutInner } from './components/layout/MainLayout';
import SplashScreen from './components/layout/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProvider>
      <AuthProvider>
        <DataMasterProvider>
          <WorkflowProvider>
            <InvoiceProvider>
              {showSplash ? <SplashScreen /> : <MainLayoutInner />}
            </InvoiceProvider>
          </WorkflowProvider>
        </DataMasterProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
