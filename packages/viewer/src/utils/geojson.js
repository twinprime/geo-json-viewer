export function processGeoJSON(data) {
    let features = [];
    const processedData = JSON.parse(JSON.stringify(data)); // Deep clone to avoid mutation issues if any
    if (processedData.type === 'FeatureCollection') {
        processedData.features.forEach((feature, index) => {
            ensureId(feature, index);
            features.push(feature);
        });
    }
    else if (processedData.type === 'Feature') {
        ensureId(processedData, 0);
        features.push(processedData);
    }
    else {
        // Geometry or other types - wrap in Feature? or handle as is?
        // For now, if it's not a Feature/FeatureCollection, we might treat it as a single feature with no properties if we wrapped it, 
        // but DeckGL handles raw geometries too. However, for "Tree View", we need Features.
        // Let's wrap raw geometry in a Feature 
        const wrapper = {
            type: 'Feature',
            geometry: processedData,
            properties: {},
            id: 'generated-0'
        };
        // We essentially return a FeatureCollection of 1 item
        return {
            data: { type: 'FeatureCollection', features: [wrapper] },
            features: [wrapper]
        };
    }
    return { data: processedData, features };
}
function ensureId(feature, index) {
    if (feature.id === undefined || feature.id === null) {
        feature.id = `feature-${index}`;
    }
}
export function getFeatureBounds(feature) {
    const bounds = [Infinity, Infinity, -Infinity, -Infinity];
    let found = false;
    function traverse(coordinates) {
        if (typeof coordinates[0] === 'number') {
            // It's a point [lon, lat] (or [lon, lat, alt])
            const [lon, lat] = coordinates;
            if (lon < bounds[0])
                bounds[0] = lon;
            if (lat < bounds[1])
                bounds[1] = lat;
            if (lon > bounds[2])
                bounds[2] = lon;
            if (lat > bounds[3])
                bounds[3] = lat;
            found = true;
        }
        else {
            coordinates.forEach(traverse);
        }
    }
    if (feature.geometry) {
        if (feature.geometry.type === 'GeometryCollection') {
            feature.geometry.geometries.forEach(geom => {
                if ('coordinates' in geom) {
                    traverse(geom.coordinates);
                }
            });
        }
        else if ('coordinates' in feature.geometry) {
            traverse(feature.geometry.coordinates);
        }
    }
    return found ? bounds : null;
}
export function getFeatureLabel(feature) {
    const props = feature.properties || {};
    if (props.name)
        return String(props.name);
    if (props.key)
        return String(props.key);
    return `Feature ${feature.id}`;
}
export function getCollectionBounds(features) {
    if (features.length === 0)
        return null;
    const bounds = [Infinity, Infinity, -Infinity, -Infinity];
    let found = false;
    features.forEach(feature => {
        const b = getFeatureBounds(feature);
        if (b) {
            if (b[0] < bounds[0])
                bounds[0] = b[0];
            if (b[1] < bounds[1])
                bounds[1] = b[1];
            if (b[2] > bounds[2])
                bounds[2] = b[2];
            if (b[3] > bounds[3])
                bounds[3] = b[3];
            found = true;
        }
    });
    return found ? bounds : null;
}
