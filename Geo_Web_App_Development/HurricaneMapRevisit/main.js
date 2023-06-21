require(["esri/Map", "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleLineSymbol", "esri/widgets/Legend",
    "esri/widgets/Home", "esri/rest/support/Query", "esri/Graphic"
], (Map, MapView, FeatureLayer, ClassBreaksRenderer, SimpleLineSymbol, Legend, Home, Query, Graphic) => {

    document
        .getElementById("getHurricanesButton")
        .addEventListener("click", getHurricanes);

    const map = new Map({
        basemap: "dark-gray-vector",
    });

    const listNode = document.getElementById("list_hurricanes");

    const template = {
        content: '<div style="text-align:center;"><p><span style="font-size:x-large;"><strong>{NAME}</strong></span><br><br>&nbsp;' +
            '</p><div style="text-align:left;"><span style="font-size:medium;">Date:&nbsp;{Hurricane_Date}</span><br>' +
            '<span style="font-size:medium;">Maximum Wind Speed:&nbsp;{USA_WIND}&nbsp;knots</span><br><br>' +
            '<span style="color:#c0c0c0;font-size:small;"><i>STORM ID:&nbsp;{SID}</i></span><br>' +
            '<span style="color:#c0c0c0;font-size:small;"><i>Latitude:&nbsp;{LAT}</i></span><br>' +
            '<span style="color:#c0c0c0;font-size:small;"><i>Longitude:&nbsp;{LON}</i></span></div></div>',
    };

    const hurricaneRenderer = new ClassBreaksRenderer({
        field: "USA_WIND"
    });

    const addClass = function(min, max, clr, lbl, renderer) {
        renderer.addClassBreakInfo({
            minValue: min,
            maxValue: max,
            symbol: new SimpleLineSymbol({
                color: clr,
                style: "dash"
            }),
            label: lbl
        });
    };

    addClass(0, 0, "rgb(247,252,253)", "Unknown",
        hurricaneRenderer);
    addClass(1, 38, "rgb(224,236,244)",
        "Tropical Depression (1-38 knots)",
        hurricaneRenderer);
    addClass(39, 73, "rgb(191,211,230)",
        "Tropical Storm (39-73 knots)", hurricaneRenderer);
    addClass(74, 95, "rgb(158,188,218)",
        "Category 1 (74-95 knots)", hurricaneRenderer);
    addClass(96, 110, "rgb(140,150,198)",
        "Category 2 (96-110 knots)", hurricaneRenderer);
    addClass(111, 129, "rgb(140,107,177)",
        "Category 3 (111-129 knots)", hurricaneRenderer);
    addClass(130, 156, "rgb(136,65,157)",
        "Category 4 (130-156 knots)", hurricaneRenderer);
    addClass(157, 185, "rgb(110,1,107)",
        "Category 5 (157-185 knots)", hurricaneRenderer);

    const hurricaneLayer = new FeatureLayer({
        portalItem: {
            id: "d053e72aabfd4c5ab4139c3829c1e11c"
        },
        outfields: ["Hurricane_Date", "USA_WIND", "SID", "LAT", "LON", "NAME"],
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [0, 0],
        zoom: 1
    });

    let graphics = [];

    function getHurricanes() {
        map.removeAll();
        document.getElementById("message").innerHTML = "";
        //hurricaneLayer.definitionExpression = "1 = 0";

        const startDate = document.getElementById("dateFrom").value;
        const endDate = document.getElementById("dateTo").value;

        const whereClause = "Hurricane_Date >= DATE '" + startDate + "' AND Hurricane_Date <= DATE '" + endDate + "'";
        /*hurricaneLayer.definitionExpression = "Hurricane_Date >= DATE '" + startDate + "' AND Hurricane_Date <= DATE '" + endDate + "'";*/
        view.when(function() {
            const hurricaneQuery = new Query({
                where: whereClause,
                returnGeometry: true,
                outFields: ["Hurricane_Date", "USA_WIND", "SID", "LAT", "LON", "NAME"],
                orderByFields: ["NAME"],
                outSpatialReference: view.map.basemap.baseLayers.items[0].spatialReference
            });
            return hurricaneLayer.queryFeatures(hurricaneQuery).then(displayResults);
        });


        function displayResults(results) {

            const fragment = document.createDocumentFragment();

            results.features.forEach(function(hurricane, index) {
                hurricane.popupTemplate = template;

                graphics.push(hurricane);

                const attributes = hurricane.attributes;
                const name = attributes.NAME + " (" + attributes.USA_WIND + " knots)";

                const li = document.createElement("li");
                li.classList.add("panel-result");
                li.tabIndex = 0;
                li.setAttribute("data-result-id", index);
                li.textContent = name;

                fragment.appendChild(li);
            });

            listNode.innerHTML = "";
            listNode.appendChild(fragment);

            const selLayer = new FeatureLayer({
                source: graphics,
                fields: hurricaneLayer.fields,
                objectIdField: "FID",
                renderer: hurricaneRenderer,
                popupTemplate: template
            });

            map.add(selLayer);

            const legend = new Legend({
                view: view,
                layerInfos: [{
                    layer: selLayer,
                    title: "Hurricane Categories"
                }]
            });

            view.ui.empty("bottom-left");
            view.ui.add(legend, "bottom-left");
            selLayer.queryFeatureCount().then(function(numFeatures) {
                document.getElementById("message").innerHTML = "Found " + numFeatures + " hurricanes meeting your criteria";
            });

            selLayer.queryExtent().then(function(results) {
                view.goTo(results.extent);
            });
        }
    }

    listNode.addEventListener("click", onListClickHandler);

    function onListClickHandler(event) {
        const target = event.target;
        const resultId = target.getAttribute("data-result-id");

        const result = resultId && graphics && graphics[parseInt(resultId,
            10)];

        if (result) {
            view.popup.open({
                features: [result],
                location: result.geometry.firstPoint
            });
            view.goTo(result);
        }
    }

    let homeWidget = new Home({
        view: view
    });

    view.ui.add(homeWidget, "top-left");


});