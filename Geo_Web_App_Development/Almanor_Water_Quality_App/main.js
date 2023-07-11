require(["esri/Map", "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleMarkerSymbol", "esri/widgets/Legend",
    "esri/widgets/Home", "esri/rest/support/Query", "esri/Graphic", "esri/widgets/Slider", "esri/widgets/Fullscreen"
], (Map, MapView, FeatureLayer, ClassBreaksRenderer, SimpleMarkerSymbol, Legend, Home, Query, Graphic, Slider, Fullscreen) => {

    const listNode = document.getElementById("list_quality_points");

    const StationIDSelect = document.getElementById("station-id");
    const depthSelect = document.getElementById("depth");
    const monthSelect = document.getElementById("month");

    const yearSlider = new Slider({
        container: "year",
        min: 2018,
        max: 2022,
        steps: 1,
        labelFormatFunction: function(value, type) {
            if (type === "value") {
                return parseInt(value);
            }
            return value;
        },
        values: [2020],
        visibleElements: {
            labels: true,
            rangeLabels: true
        }
    });

    const map = new Map({
        basemap: "topo-vector",
    });

    const template = {
        title: '<div style="text-align:center;"><span style="font-size:large;"><strong>{Station_Identifier}</strong></span><br>&nbsp;' +
            '<span style="font-size:medium;">&nbsp;{Month} {Year}</span><br></div>',
        content: '<div style="text-align:left; padding:4px 12px 0px 12px;"><span style="font-size:medium;">Sampling Depth (meters):&nbsp;{Depth_meters_}&nbsp;</span><br></div>' +
            '<div style="text-align:left; padding:4px 12px 0px 12px;"><span style="font-size:medium;">Secchi Depth (meters):&nbsp;{Secchi__m_}&nbsp;</span><br></div>' +
            '<div style="text-align:left; padding:4px 12px 0px 12px;"><span style="font-size:medium;">Dissolved Oxygen:&nbsp;{DO__ppm_}&nbsp; ppm</span><br></div>' +
            '<div style="text-align:left; padding:4px 12px 0px 12px;"><span style="font-size:medium;">Temperature:&nbsp;{Temp__o_C_}<sup>o</sup>C /{Temp__oF_}<sup>o</sup> F</span><br></div>' +
            /*'<div style="text-align:left;"><span style="font-size:medium;">Temp Farenheit:&nbsp;{Temp__oF_}<sup>o</sup>&nbsp;</span><br>' +*/
            '<div style="text-align:left; padding:4px 12px 0px 12px"><span style="font-size:medium;">pH:&nbsp;{pH}&nbsp;</span><br></div>' +
            '<div style="text-align:left; padding:4px 12px 0px 12px;"><span style="font-size:medium;">Electrical Conductivity:&nbsp;{EC__mS_cm_}&nbsp;mS/cm</span><br></div>' +
            '<div style="text-align:left; padding:4px 12px 0px 12px;"><span style="font-size:medium;">Turbididty:&nbsp;{Turbidity}&nbsp;</span><br></div>' +
            '<br><span style="color:#c0c0c0;font-size:small;"><i>Latitude:&nbsp;{y}</i></span><br></div>' +
            '<span style="color:#c0c0c0;font-size:small;"><i>Longitude:&nbsp;{x}</i></span></div>',
    };

    const waterQualityRenderer = new ClassBreaksRenderer({
        field: "DO__ppm_"
    });

    const addClass = function(min, max, clr, lbl, renderer) {
        renderer.addClassBreakInfo({
            minValue: min,
            maxValue: max,
            symbol: new SimpleMarkerSymbol({
                color: clr,
                style: "triangle"
            }),
            label: lbl
        });
    };

    addClass(0, 3, "rgb(215,25,28)", "Extremely Low Oxygen (0.0-3.0ppm)",
        waterQualityRenderer);
    addClass(3, 5, "rgb(253,174,97)", "Low Oxygen (3.1-5.0 ppm)",
        waterQualityRenderer);
    addClass(5, 7, "rgb(255,255,191)",
        "Moderate Oxygen (5.1-7.0ppm)", waterQualityRenderer);
    addClass(7, 10, "rgb(171,221,164)",
        "High Oxygen (7.1-10.0ppm)", waterQualityRenderer);
    addClass(10, 20, "rgb(43,131,186)",
        "Extremely High Oxygen (> 10ppm)", waterQualityRenderer);

    const almanorPointLayer = new FeatureLayer({
        portalItem: {
            id: "bece4a06d4104b95be75e5e7bd180875"
        },
        renderer: waterQualityRenderer,
        outfields: ["*"],
        popupTemplate: template,
        visible: false,
    });
    map.add(almanorPointLayer);

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-121.1, 40.252778],
        zoom: 12
    });

    view.popup.dockOptions.buttonEnabled = false;

    view
        .when(function() {
            return almanorPointLayer.when(function() {
                const query = almanorPointLayer.createQuery();
                return almanorPointLayer.queryFeatures(query);
            });
        })
        .then(getValues)
        .then(getUniqueValues)
        .then(addToSelect);

    // return an array of all the values in the
    // Station Identifier, depth and month fields of the almanor point layer
    function getValues(response) {
        const features = response.features;
        const values = features.map(function(feature) {
            return [feature.attributes.Station_Identifier, feature.attributes.Depth_meters_, feature.attributes.Month];
        });
        return values;
    }

    // return an array of unique values in
    // the Station Identifier, depth, and month fields of the almanor point layer
    function getUniqueValues(values) {
        const stationValues = [];
        const depthValues = [];
        const monthValues = [];
        values.forEach(function(item, i) {
            if (
                (stationValues.length < 1 || stationValues.indexOf(item[0]) === -1) &&
                item[0] !== ""
            ) {
                stationValues.push(item[0]);
            }
            if (
                (depthValues.length < 1 || depthValues.indexOf(item[1]) === -1) &&
                item[1] !== ""
            ) {
                depthValues.push(item[1]);
            }
            if (
                (monthValues.length < 1 || monthValues.indexOf(item[2]) === -1) &&
                item[2] !== ""
            ) {
                monthValues.push(item[2]);
            }
        });
        return [stationValues, depthValues, monthValues];
    }

    // Add the unique values to the station id
    // select element. This will allow the user
    // to filter stations by id.
    function addToSelect(values) {
        const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const stationIds = values[0];
        const depths = values[1];
        const months = values[2];

        stationIds.sort();
        depths.sort(function(a, b) {
            return a - b
        });
        months.sort(function(a, b) {
            return allMonths.indexOf(a) - allMonths.indexOf(b);
        });

        stationIds.forEach(function(value) {
            const stationOption = document.createElement("option");
            stationOption.text = value;
            StationIDSelect.add(stationOption);
        });


        depths.forEach(function(value) {
            const depthOption = document.createElement("option");
            depthOption.text = value;
            depthSelect.add(depthOption);
        });

        months.forEach(function(value) {
            const monthOption = document.createElement("option");
            monthOption.text = value;
            monthSelect.add(monthOption);
        });
        return setAlmanorPointsDefinitionExpression();
    }

    function setAlmanorPointsDefinitionExpression() {

        let whereValues = [StationIDSelect.value, depthSelect.value, monthSelect.value, yearSlider.values[0]];
        var defExp = "Station_Identifier ='" + whereValues[0] + "' AND " + "Depth_meters_ ='" + whereValues[1] + "' AND Month = '" + whereValues[2] + "' AND Year = '" + whereValues[3] + "'";
        var expYear = "Year = '" + whereValues[3] + "'";
        var expMonth = "Month = '" + whereValues[2] + "'";
        var expDepth = "Depth_meters_ = '" + whereValues[1] + "'"
        var expStation = "Station_Identifier = '" + whereValues[0] + "'"

        if (StationIDSelect.value == "all" && depthSelect.value == "all" && monthSelect.value == "all") {
            almanorPointLayer.definitionExpression = expYear;
        }
        else if (StationIDSelect.value == "all" && depthSelect.value == "all") {
            almanorPointLayer.definitionExpression = expYear + " AND " + expMonth;
        } 
        else if (StationIDSelect.value == "all" && monthSelect.value == "all") {
            almanorPointLayer.definitionExpression = expYear + " AND " + expDepth;
        } 
        else if (monthSelect.value == "all" && depthSelect.value == "all") {
            almanorPointLayer.definitionExpression = expYear + " AND " + expStation;
        } 
        else if (monthSelect.value == "all") {
            almanorPointLayer.definitionExpression = expYear + " AND " + expStation + " AND " + expDepth;
        } 
        else if (StationIDSelect.value == "all") {
            almanorPointLayer.definitionExpression = expYear + " AND " + expMonth + " AND " + expDepth;
        }
        else if (depthSelect.value == "all") {
            almanorPointLayer.definitionExpression = expYear + " AND " + expStation + " AND " + expMonth;
        }
        else {
            almanorPointLayer.definitionExpression = defExp;
        }

        const pointQuery = almanorPointLayer.createQuery();
        return almanorPointLayer.queryFeatures(pointQuery).then(displayResults);

        function displayResults(results) {

            view.popup.close();

            let graphics = [];

            const fragment = document.createDocumentFragment();

            results.features.forEach(function(qualityPoint, index) {
                qualityPoint.popupTemplate = template;

                graphics.push(qualityPoint);

                const attributes = qualityPoint.attributes;
                const name = attributes.Station_Identifier + " \r\nDate: " + attributes.Month + " " + attributes.Year + " \n\Depth:" + attributes.Depth_meters_ + " meters";

                const li = document.createElement("li");
                li.setAttribute('style', 'white-space: pre-line;');
                li.classList.add("panel-result");
                li.tabIndex = 0;
                li.setAttribute("data-result-id", index);
                li.textContent = name;

                fragment.appendChild(li);
            });

            listNode.innerHTML = "";
            listNode.appendChild(fragment);

            map.removeAll();

            const selLayer = new FeatureLayer({
                source: graphics,
                fields: almanorPointLayer.fields,
                objectIdField: "OBJECTID",
                renderer: waterQualityRenderer,
                popupTemplate: template
            });

            map.add(selLayer);

            const legend = new Legend({
                view: view,
                layerInfos: [{
                    layer: selLayer,
                    title: "Dissolved Oxygen Levels"
                }]
            });

            view.ui.empty("bottom-left");
            view.ui.add(legend, "bottom-left");
            selLayer.queryFeatureCount().then(function(numFeatures) {
                document.getElementById("message").innerHTML = "Found " + numFeatures + " water quality points meeting your criteria";
            });

            selLayer.queryExtent().then(function(results) {
                var featureSet = results || {};
                var features = featureSet.features || [];
                var extent = esri.graphicsExtent(features);
                if (!extent && features.length == 1) {
                    var pointExtent = features[0].geometry.getExtent().expand(1.5);
                    map.setExtent(pointExtent);
                } else {
                    map.setExtent(extent);
                    //view.goTo(results.extent);
                }
            });

            listNode.addEventListener("click", onListClickHandler);


            function onListClickHandler(event) {
                const target = event.target;
                const resultId = target.getAttribute("data-result-id");

                const result = resultId && graphics && graphics[parseInt(resultId,
                    10)];

                if (result) {
                    view.popup.open({
                        features: [result],
                        location: result.geometry.centroid
                    });
                    view.goTo(result);
                }
            }
        }
    }

    monthSelect.addEventListener("change", function() {
        setAlmanorPointsDefinitionExpression();
    });

    depthSelect.addEventListener("change", function() {
        setAlmanorPointsDefinitionExpression();
    });

    StationIDSelect.addEventListener("change", function() {
        setAlmanorPointsDefinitionExpression();
    });

    yearSlider.on("thumb-drag", function() {
        setAlmanorPointsDefinitionExpression();
    });


    let homeWidget = new Home({
        view: view
    });

    const fullscreen = new Fullscreen({
        view: view
    })

    view.ui.add(homeWidget, "top-left");
    view.ui.add(fullscreen, "top-left");

});
