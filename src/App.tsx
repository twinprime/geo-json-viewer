import { MainLayout } from './components/Layout/MainLayout';
import { MapViewer } from './components/Map/MapViewer';
import { SidePanel } from './components/SidePanel/SidePanel';

function App() {
  return (
    <>
      <MainLayout 
        sidePanel={<SidePanel />}
        mapPanel={<MapViewer />}
      />
    </>
  );
}

export default App;
