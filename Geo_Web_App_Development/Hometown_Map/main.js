  require(["esri/Map", "esri/views/MapView", "esri/geometry/Point", "esri/symbols/SimpleMarkerSymbol", "esri/Graphic"], (Map, MapView, Point, SimpleMarkerSymbol, Graphic) => {
        const map = new Map({
          basemap: "terrain"
        });

        const pt = new Point({
           latitude: -8.1167,
           longitude: -79.0333
        });

         const sym = new SimpleMarkerSymbol({
          color: "blue",
          style: "square",
          size: 12
         });

        const ptGraphic = new Graphic({
          geometry: pt,
          symbol: sym
        });

        const view = new MapView({
          container: "viewDiv",
          map: map,
          zoom: 8,
          center: pt // longitude, latitude
         });

        view.graphics.add(ptGraphic);

  });
