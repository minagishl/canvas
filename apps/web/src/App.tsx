import React from 'react';
import { Canvas } from '~/components/Canvas';
import { Toolbar } from '~/components/Toolbar';

// SEO
import { Helmet, HelmetProvider } from 'react-helmet-async';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Canvas',
  description: 'A free canvas tool available online for building ideas.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

// Contexts
import { AIProvider } from './contexts/AIContext';
import { AlertProvider } from '~/contexts/AlertContext';
import { CanvasProvider } from '~/contexts/CanvasContext';
import { HistoryProvider } from '~/contexts/HistoryContext';

function App(): React.ReactElement {
  return (
    <div>
      <HelmetProvider>
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(schema)}</script>
        </Helmet>
      </HelmetProvider>
      <AlertProvider>
        <HistoryProvider>
          <CanvasProvider>
            <AIProvider>
              <div className="relative h-screen w-screen overflow-hidden bg-gray-50 select-none">
                <Canvas />
                <Toolbar />
              </div>
            </AIProvider>
          </CanvasProvider>
        </HistoryProvider>
      </AlertProvider>
    </div>
  );
}

export default App;
