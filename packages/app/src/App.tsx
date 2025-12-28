import { useState } from 'react';
import { MenuBar } from './components/Layout/MenuBar';
import { GeoJsonViewer } from '@geojson-viewer/viewer';
import type { GeoJSON } from 'geojson';

function App() {
  const [data, setData] = useState<GeoJSON | null>(null);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden">
      <MenuBar onDataLoad={setData} />
      <div className="flex-1 overflow-hidden">
        <GeoJsonViewer data={data} />
      </div>
    </div>
  );
}

export default App;
