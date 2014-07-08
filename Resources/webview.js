
//===================================================================
//Set up variables and event listeners
 
var map, pt, symbol;
var selectStop;
var GS1, GS2, GS3;
var heading = new Array(3);

var ExprRouteGraphic;
var NorthRouteGraphic;
var SouthRouteGraphic;
var userGraphic;

var ExprStopGraphics = [];
var NorthStopGraphics = [];
var SouthStopGraphics = [];


//TODO: expand to set this array
var enabledRouteIDs = [4, 5];


Ti.App.addEventListener('updatemap', function(event){
	switch(event.id){
		case 0:		//createMap(userGPS, props)
			Ti.API.info("------------------EVENT: createMap");
			createMap(event.userGPS, event.props);
			break;
		case 1:		//updateMap(shuttleData)
			Ti.API.info("------------------EVENT: updateMap");
			updateMap(event.shuttleData, event.userGPS);
			break;
		case 2:
			Ti.API.info("------------------EVENT: centerMap");
			centerMap(event.latitude, event.longitude, event.userBool);
			break;
		case 3:
			Ti.API.info("------------------EVENT: zoomMap");
			zoomMap(event.zoomBool);
			break;
		case 4:
			showNorth(event.routeBool);
			break;
		case 5:
			showSouth(event.routeBool);
			break;
		case 6:
			showExpress(event.routeBool);
			break;
		case 7: //TODO: add in 4th route
			break;
	}
	
});
	
//===================================================================	

//===================================================================

function createMap(userGPS, props){
	require([
		"esri/map", "esri/graphic", "dojo/_base/array", 
		"esri/geometry/Point", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol"], 
		function(Map, Graphic, arrayUtils, Point, PictureMarkerSymbol, SimpleLineSymbol) {
  			Ti.API.info("YAHHHHH : " + userGPS + ", " + props);
  			map = new Map("mapDiv", {
    			center: [-123.280, 44.562],
    			zoom: 15,
    			basemap: "osm",
    			minZoom: 12,
    			slider: false,
    			showAttribution:false,
    			logo: false,
    			displayGraphicsOnPan: true,
    			optimizePanAnimation: true,
    			showAttribution: false,
    			autoResize: true,
   			});
   		
			var UserMarkerSymbol = new PictureMarkerSymbol('GeneralUI/userMarker2.png', 22, 22);
    		var StopMarkerSymbol = new PictureMarkerSymbol('GeneralUI/orangeDot.png', 15, 15);
    			
 			dojo.connect(map, "onExtentChange", showExtent);
 			function showExtent(ext){
 				Ti.API.info("This is the extent. XMin: " + ext.xmin + ", YMin: " + ext.ymin + ", XMax: " + ext.xmax + ", YMax: " + ext.ymax);
 			}
    		//Hardcoded stops for one route
    		var StopPtsSouthCentral = [
				[44.55832, -123.28162, 0],
				[44.560524, -123.282411, 1],
				[44.56344, -123.27964, 2],
				[44.564578, -123.279934, 3],
				[44.56675, -123.27719, 4 ],
				[44.56673, -123.273, 5],
				[44.55901, -123.27962, 6]];
				
    		var StopPtsNorthCentral = [
                [44.564578, -123.279934, 3],
                [44.56344, -123.27964, 2],
                [44.56458, -123.28654, 7],
                [44.56785, -123.28934, 8],
                [44.56792, -123.28146, 9],
                [44.56675, -123.27719, 4],
                [44.56673, -123.273, 5],
                [44.562588, -123.274155, 10]];
                
    		var StopPtsExpress = [
                [44.564578,-123.279934, 3],
                [44.568107, -123.279461, 11],
                [44.55901, -123.27962, 6],
                [44.55832, -123.28162, 0],
                [44.560524, -123.282411, 1],
                [44.56344, -123.27964, 2]];
    
   
    		//When the map loads, load in user and stops graphics
    		map.on("load", loadUserAndStops);
    		
    		function loadUserAndStops(){
    			var ExpressRoute = [
	        		[-123.279941,44.567899],
        			[-123.279925,44.568082],
        			[-123.278972,44.568080],
        			[-123.278948,44.567910],
        			[-123.278970,44.567910],
        			[-123.279941,44.567899],
        			[-123.279925,44.566813],
        			[-123.279927,44.564193],
        			[-123.279619,44.563330],
        			[-123.279600,44.562070],
        			[-123.279630,44.561896],
        			[-123.279624,44.560423],
        			[-123.279691,44.560283],
        			[-123.279697,44.558999],
        			[-123.280711,44.558405],
        			[-123.281620,44.558320],
        			[-123.282811,44.558928],
        			[-123.283133,44.559555],
        			[-123.282934,44.560071],
        			[-123.282411,44.560524],
        			[-123.281993,44.560645],
        			[-123.279631,44.560708]
        		];
        				
	        	var NorthRoute = [
        			[-123.279962,44.567940],
					[-123.279919,44.566794],
					[-123.272396,44.566737],
					[-123.274016,44.564612],
					[-123.275786,44.564558],
					[-123.275850,44.561952],
					[-123.279601,44.561970],
					[-123.279612,44.563323],
					[-123.279955,44.564179],
					[-123.279955,44.564561],
					[-123.289707,44.564592],
					[-123.289718,44.567855],
					[-123.279962,44.567940]
        		];
        		
        		var SouthRoute = [
        			[-123.279565,44.560802],
					[-123.281916,44.560664],
					[-123.282957,44.560014],
					[-123.283054,44.559303],
					[-123.282260,44.558722],
					[-123.282013,44.558478],
					[-123.280511,44.558478],
					[-123.279663,44.559013],
					[-123.279631,44.561420],
					[-123.279556,44.563347],
					[-123.279867,44.564020],
					[-123.279899,44.564547],
					[-123.279889,44.566741],
					[-123.272507,44.566718],
					[-123.274095,44.564669],
					[-123.274068,44.564511],
					[-123.275731,44.564511],
					[-123.275844,44.561887],
					[-123.279567,44.561956]
        		];
      			
      			var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#576fff"), 3); 
      			var runningRoute = new esri.geometry.Polyline(ExpressRoute);
      			ExprRouteGraphic = new esri.Graphic(runningRoute,polylineSymbol);
      			map.graphics.add(ExprRouteGraphic);
      			
      			var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#FF6600"), 3); 
      			var runningRoute = new esri.geometry.Polyline(NorthRoute);
      			NorthRouteGraphic = new esri.Graphic(runningRoute,polylineSymbol);
      			map.graphics.add(NorthRouteGraphic);

      			var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#36c636"), 3); 
      			var runningRoute = new esri.geometry.Polyline(SouthRoute);
      			SouthRouteGraphic = new esri.Graphic(runningRoute,polylineSymbol);
      			map.graphics.add(SouthRouteGraphic);
      			
      			
      			if(userGPS != null){
    			    User = new esri.geometry.Point({
							latitude: userGPS[0],
							longitude: userGPS[1]
					});
					userGraphic = new Graphic(User, UserMarkerSymbol);
					map.graphics.add(userGraphic);		
    			}
    			
    			arrayUtils.forEach(StopPtsSouthCentral, function(StopPt) {
    			  	var tempStop = new Graphic(new esri.geometry.Point({latitude: StopPt[0], longitude: StopPt[1]}), StopMarkerSymbol, {"StopId":StopPt[2]} , null);
    				SouthStopGraphics.push(tempStop);
    			    map.graphics.add(tempStop);
    			});
    			
    			arrayUtils.forEach(StopPtsNorthCentral, function(StopPt) {
    			    var tempStop = new Graphic(new esri.geometry.Point({latitude: StopPt[0], longitude: StopPt[1]}), StopMarkerSymbol, {"StopId":StopPt[2]} , null);
    				NorthStopGraphics.push(tempStop);
    			    map.graphics.add(tempStop);
    			});
    			
    			arrayUtils.forEach(StopPtsExpress, function(StopPt) {
    				var tempStop = new Graphic(new esri.geometry.Point({latitude: StopPt[0], longitude: StopPt[1]}), StopMarkerSymbol, {"StopId":StopPt[2]} , null);
    				ExprStopGraphics.push(tempStop);
    			    map.graphics.add(tempStop);
      			});
      			
      			for(var i = 0; i < 4; i++){
      				if(props[i] == 'false' || props[i] == false){
      					switch(i){
      						case 0:
      							showNorth(false);
      							break;
      						case 1:
      							showSouth(false);
      							break;
      						case 2:
      							showExpress(false);
      							break;
      						case 3:
      							
      					}
      				}
      			}
      			
      			

      			
      				
      		}	
			
		}
    		
	);
}
    
//===================================================================

function updateMap(shuttleData, userGPS){
	require(["esri/map", "esri/geometry/Point","esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/graphic"], 
		function(Map, Point, SimpleMarkerSymbol, PictureMarkerSymbol, Graphic) {
			
			if(userGPS != null){
				var UserMarkerSymbol = new PictureMarkerSymbol('GeneralUI/userMarker2.png', 22, 22);
				
				map.graphics.remove(userGraphic);
	  			
			    User = new esri.geometry.Point({
						latitude: userGPS[0],
						longitude: userGPS[1]
				});
				userGraphic = new Graphic(User, UserMarkerSymbol);
				map.graphics.add(userGraphic);		
			}	
			
			if(map.getLayer(shuttleLayer) != null){
				map.removeLayer(shuttleLayer);
			}
			map.graphics.remove(GS3);
			var shuttleLayer = new esri.layers.GraphicsLayer();
			
			var ShuttleMarkerSymbol1 = new PictureMarkerSymbol('Shuttle/bluetriangle.png', 20, 20); //south central
			var ShuttleMarkerSymbol2 = new PictureMarkerSymbol('Shuttle/greentriangle.png', 20, 20); //*north central
			var ShuttleMarkerSymbol3 = new PictureMarkerSymbol('Shuttle/orangetriangle.png', 20, 20); //express
			
			if(shuttleData != null){
				for(var i = 0; i < shuttleData.length; i++){
					var shuttleGraphic;
					
					//Check if route is enabled, if not, don't display shuttle graphic.
					if(enabledRouteIDs.indexOf(shuttleData[i][0]) == -1){
						continue;
					}
					
					//Assign graphic based on RouteID
					switch(shuttleData[i][0]){
						case 4: //Express
							shuttleGraphic = ShuttleMarkerSymbol1;
							break;
						case 5:	//South-Central
							shuttleGraphic = ShuttleMarkerSymbol2;
					}
					shuttleGraphic.setAngle(shuttleData[i][3]);
					var newShuttle = new esri.geometry.Point({
						latitude: shuttleData[i][1],
						longitude: shuttleData[i][2],
					});
					var newGraphic = new Graphic(newShuttle, shuttleGraphic);
					shuttleLayer.add(newGraphic);
				}
				map.addLayer(shuttleLayer);
			}
  		});
   }
       
function showExpress(enableExpress){
	require(["dojo/_base/array"], 
    	function(arrayUtils) {
			if (enableExpress == true){
	      		ExprRouteGraphic.show();
	      		
	      		arrayUtils.forEach(ExprStopGraphics, function(StopGraphic) {
					StopGraphic.show();
	  			});	
	  		}
	  		else{
	  			ExprRouteGraphic.hide();
	  			
	  			arrayUtils.forEach(ExprStopGraphics, function(StopGraphic) {
					StopGraphic.hide();
	  			});
	  			
	  		}
	
        });
}
       
function showNorth(enableNorth){
	require(["dojo/_base/array"], 
    	function(arrayUtils) {
			if (enableNorth == true){
	  			
	      		NorthRouteGraphic.show();
	      		
	      		arrayUtils.forEach(NorthStopGraphics, function(StopGraphic) {
					StopGraphic.show();
	  			});
	  		}
	  		else{
	  			NorthRouteGraphic.hide();
	  			
	  			arrayUtils.forEach(NorthStopGraphics, function(StopGraphic) {
					StopGraphic.hide();
	  			});
	  			
	  		}
        });
}
function showSouth(enableSouth){
	require(["dojo/_base/array"], 
    	function(arrayUtils) {
			if (enableSouth == true){
	
	      		SouthRouteGraphic.show();
	      		
	      		arrayUtils.forEach(SouthStopGraphics, function(StopGraphic) {
					StopGraphic.show();
	  			});
	  		}
	  		else{
	  			SouthRouteGraphic.hide();
	  			
	  			arrayUtils.forEach(SouthStopGraphics, function(StopGraphic) {
					StopGraphic.hide();
	  			});
	  		}	
       });
}
function centerMap(lat, lon, userBool){
	require(["esri/map", "esri/geometry/Point", "esri/graphic", "esri/symbols/PictureMarkerSymbol"], 
		function(Map, Point, Graphic, PictureMarkerSymbol) {
			
			var centerPoint = new esri.geometry.Point({
				latitude: lat,
				longitude: lon
			});
			
			map.centerAt(centerPoint);
			if(userBool == false){
				map.graphics.remove(selectStop);
				var selectStopSymbol = new PictureMarkerSymbol('GeneralUI/orangeDotSelected2.png', 45, 45);
				selectStop = new Graphic(centerPoint, selectStopSymbol);
				map.graphics.add(selectStop);	
			}
    	});
}   
function zoomMap(zoom){
	require(["esri/map"], 
    	function(Map) {
			if (zoom == true){
				map.setZoom(map.getZoom()+1);
			}
			else if (zoom == false){
				map.setZoom(map.getZoom()-1);
			}	
       });
}
//===================================================================

