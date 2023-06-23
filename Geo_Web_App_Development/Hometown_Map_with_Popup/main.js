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

      const ptAtt = {
          City: "Trujillo",
          Country: "Peru",
          Departement: "La Libertad",
          Province: "Trujillo",
          District: "Trujillo",
          Founded: "November 1534",
          Founder: "Diego de Almagro",
          Metro_Area: "1,100 Kilometers Squared"
      };
        const ptGraphic = new Graphic({
          geometry: pt,
          symbol: sym,
          attributes: ptAtt,
          popupTemplate: {
                // autocasts as new PopupTemplate()
                title: "{City}",
                content: [
                    {
                        type: "fields",
                        fieldInfos: [
                            {
                                fieldName: "County"
                            },
                            {
                                fieldName: "Department"
                            },
                            {
                                fieldName: "Province"
                            },
                            {
                                fieldName: "District"
                            },
                            {
                                fieldName: "Founded"
                            },
                            {
                                fieldName: "Founder"
                            },
                            {
                                fieldName: "Metro_Area"
                            }
                        ]
                    }
                ]
            }

        });

        const view = new MapView({
          container: "viewDiv",
          map: map,
          zoom: 8,
          center: pt // longitude, latitude
         });

        view.graphics.add(ptGraphic);

  });
