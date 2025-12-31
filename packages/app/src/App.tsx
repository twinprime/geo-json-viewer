import { useState } from "react"
import { MenuBar } from "./components/MenuBar"
import { GeoJsonViewer } from "@geojson-viewer/viewer"
import type { GeoJSON, Feature } from "geojson"

function App() {
  const [data, setData] = useState<GeoJSON | null>(null)

  const handleAppend = (newData: GeoJSON) => {
    setData((prevData) => {
      if (!prevData) return newData

      const getFeatures = (g: GeoJSON): Feature[] => {
        if (g.type === "FeatureCollection") return g.features
        if (g.type === "Feature") return [g]
        // Handle Geometry or other types by wrapping in a Feature
        return [{ type: "Feature", geometry: g, properties: {} } as Feature]
      }

      const prevFeatures = getFeatures(prevData)
      const newFeatures = getFeatures(newData)

      return {
        type: "FeatureCollection",
        features: [...prevFeatures, ...newFeatures],
      }
    })
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden">
      <MenuBar onDataLoad={setData} onDataAppend={handleAppend} />
      <div className="flex-1 overflow-hidden h-full w-full">
        <GeoJsonViewer data={data} />
      </div>
    </div>
  )
}

export default App
