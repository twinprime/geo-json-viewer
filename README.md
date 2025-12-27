# Geo JSON Viewer

Geo JSON Viewer is a web application that allows users to view and interact with Geo JSON data.

The viewer consists of a main menu bar on top and a left and right panel.

The main menu has a 'File' menu that allows users to open a Geo JSON file from local file system.

The left panel is a file tree view that shows the structure of the Geo JSON file.
It also shows the properties of each feature in the tree.

The right panel is a map view that shows the Geo JSON data.

DeckGL is used to render the map view.

User is able to select a feature in the map view by left clicking on the feature, the feature will be highlighted and the file tree view will also highlight the corresponding feature.

User is able to select a feature in the file tree view by left clicking on the feature, the feature will be highlighted and the map view will also highlight the corresponding feature.

The left panel should also include a search bar that allows users to search for a feature by property key and value matching a regular expression. Matching features will be highlighted in both the file tree view and the map view.
