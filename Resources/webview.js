
//===================================================================
//Set up variables and event listeners
 
var exString = "Can't believe I can reach this";
var map, pt, symbol;
var selectStop;
var GS1, GS2, GS3;
var heading = new Array(3);
var lastGraphicClicked;

var ExprRouteGraphic;
var NorthRouteGraphic;
var SouthRouteGraphic;
var userGraphic;

var allStopGraphics = [];
var ExprStopGraphics = [];
var NorthStopGraphics = [];
var SouthStopGraphics = [];


//TODO: expand to set this array
var enabledRouteIDs = [4, 5];


Ti.App.addEventListener('updatemap', function(event){
	switch(event.id){
		case 0:		//createMap(userGPS, props)
			Ti.API.info("------------------EVENT: createMap");
			createMap(event.userGPS, event.props, event.baseMap);
			break;
		case 1:		//updateMap(shuttleData)
			Ti.API.info("------------------EVENT: updateMap");
			updateMap(event.shuttleData, event.userGPS);
			break;
		case 2:
			Ti.API.info("------------------EVENT: centerMap");
			centerMap(event.latitude, event.longitude, event.landmarkId, event.userBool);
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
		case 8:
			changeBasemap(event.basemap);
			break;
	}
	
});
	
//===================================================================	

//===================================================================

function changeBasemap(newBaseMap){
	require(["esri/map"],
		function(Map) {
			map.setBasemap(newBaseMap);
		});
}

function createMap(userGPS, props, baseMap){
	require([

		"esri/map", "esri/graphic", "dojo/_base/array", 
		"esri/geometry/Point", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/geometry/Extent"], 
		function(Map, Graphic, arrayUtils, Point, PictureMarkerSymbol, SimpleLineSymbol, Extent) {
  			Ti.API.info("YAHHHHH : " + userGPS + ", " + props);
  			var initExtent = new Extent({"xmin":-13725847.330965368,"ymin":5551137.927669094,"xmax":-13721614.630524082,"ymax":5555169.980911131,"spatialReference":{"wkid":102100}});
	  		var maxExtent = initExtent;
  			map = new Map("mapDiv", {
    			//center: [-123.280, 44.562],
    			zoom: 15,
    			basemap: baseMap,
    			minZoom: 14,
    			slider: false,
    			showAttribution:false,
    			logo: false,
    			displayGraphicsOnPan: true,
    			optimizePanAnimation: true,
    			autoResize: true,
    			extent: initExtent,
   			});

			var UserMarkerSymbol = new PictureMarkerSymbol('GeneralUI/userMarker2.png', 22, 22);
    		var StopMarkerSymbol = new PictureMarkerSymbol('GeneralUI/greenPin.png', 40, 40);
    		StopMarkerSymbol.yoffset = StopMarkerSymbol.height/2;
    			
    		//Hardcoded stops for one route
    		var allStopPts = [
    			[44.55832, -123.28162, 22],
				[44.560524, -123.282411, 10],
				[44.56344, -123.27964, 24],
				[44.564578, -123.279934, 7],
				[44.56675, -123.27719, 25],
				[44.56673, -123.273, 27],
				[44.55901, -123.27962, 21],
				[44.56458, -123.28654, 28],
				[44.56785, -123.28934, 29],
				[44.56792, -123.28146, 30],
				[44.562588, -123.274155, 31],
				[44.568107, -123.279461, 20]];
    		
    		var StopPtsSouthCentral = [
				[44.55832, -123.28162, 22],
				[44.560524, -123.282411, 10],
				[44.56344, -123.27964, 24],
				[44.564578, -123.279934, 7],
				[44.56675, -123.27719, 25],
				[44.56673, -123.273, 27],
				[44.55901, -123.27962, 21]];
				
    		var StopPtsNorthCentral = [
                [44.564578, -123.279934, 7],
                [44.56344, -123.27964, 24],
                [44.56458, -123.28654, 28],
                [44.56785, -123.28934, 29],
                [44.56792, -123.28146, 30],
                [44.56675, -123.27719, 25],
                [44.56673, -123.273, 27],
                [44.562588, -123.274155, 31]];
                
    		var StopPtsExpress = [
                [44.564578,-123.279934, 7],
                [44.568107, -123.279461, 20],
                [44.55901, -123.27962, 21],
                [44.55832, -123.28162, 22],
                [44.560524, -123.282411, 10],
                [44.56344, -123.27964, 24]];
    
   
    		//When the map loads, load in user and stops graphics
    		map.on("load", mapOnLoadHandler);
    		
    		function mapOnLoadHandler(){
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
    			
    			arrayUtils.forEach(allStopPts, function(stopPt){
    				var tempStop = new Graphic(new esri.geometry.Point({latitude: stopPt[0], longitude: stopPt[1]}), StopMarkerSymbol, {"landmarkId":stopPt[2], "lat":stopPt[0], "lon":stopPt[1]} , null);
    				allStopGraphics.push(tempStop);
    				map.graphics.add(tempStop);
    			});
    			
    			/*
    			arrayUtils.forEach(StopPtsSouthCentral, function(StopPt) {
    			  	var tempStop = new Graphic(new esri.geometry.Point({latitude: StopPt[0], longitude: StopPt[1]}), StopMarkerSymbol, {"landmarkId":StopPt[2]} , null);
    				SouthStopGraphics.push(tempStop);
    			    map.graphics.add(tempStop);
    			});
    			
    			arrayUtils.forEach(StopPtsNorthCentral, function(StopPt) {
    			    var tempStop = new Graphic(new esri.geometry.Point({latitude: StopPt[0], longitude: StopPt[1]}), StopMarkerSymbol, {"landmarkId":StopPt[2]} , null);
    				NorthStopGraphics.push(tempStop);
    			    map.graphics.add(tempStop);
    			});
    			
    			arrayUtils.forEach(StopPtsExpress, function(StopPt) {
    				var tempStop = new Graphic(new esri.geometry.Point({latitude: StopPt[0], longitude: StopPt[1]}), StopMarkerSymbol, {"landmarkId":StopPt[2]} , null);
    				ExprStopGraphics.push(tempStop);
    			    map.graphics.add(tempStop);
      			}); */
      			
      			map.graphics.on("click", myGraphicsClickHandler);
      			
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
      			
      			

				function myGraphicsClickHandler(evt) {
					if(lastGraphicClicked != null){
						lastGraphicClicked.setSymbol(StopMarkerSymbol);
					}
					var obj = evt.graphic;
					var attr = obj.attributes;
					if(attr != null){
						lastGraphicClicked = obj;
						//var str = JSON.stringify(obj);
						var selectStopSymbol = new PictureMarkerSymbol('GeneralUI/orangePin.png', 65, 65);
						selectStopSymbol.yoffset = selectStopSymbol.height/2;
						obj.setSymbol(selectStopSymbol);
						Ti.API.info("Map Clicked! str : " + attr.landmarkId);
						Ti.App.fireEvent('adjustTable', {
							data : [attr.landmarkId]
						});
		
						var centerPoint = new esri.geometry.Point({
							latitude : attr.lat,
							longitude : attr.lon
						});
		
						map.centerAt(centerPoint); 
					}
				}   
				
				
	
				Ti.API.info("XXX:");
				var timer;
				var shiftExtent;
				
				dojo.connect(map, "onExtentChange", constrainExtent);

				function constrainExtent(extent, delta, levelChange, lod) {
			
					//Whole view within bounds
					if (extent.contains(maxExtent))
						return;
					//BOTH X bounds extend - this is ok
					if ((maxExtent.xmax < extent.xmax) && (maxExtent.xmin > extent.xmin))
						return;
					//BOTH Y bounds extend - this is ok
					if ((maxExtent.ymax < extent.ymax) && (maxExtent.ymin > extent.ymin))
						return;
						
					var dx, dy;
					
					//Right too far
					if (maxExtent.xmax < extent.xmax){
						dx = extent.xmax - maxExtent.xmax;
					}
					//Left too far
					else if (maxExtent.xmin > extent.xmin){
						dx = extent.xmin - maxExtent.xmin;
					}	
					else 
						dx = 0;
					//Up too far
					if (maxExtent.ymax < extent.ymax){
						dy = extent.ymax - maxExtent.ymax;
					}
					//Down too far
					else if (maxExtent.ymin > extent.ymin){
						dy = extent.ymin - maxExtent.ymin;
					}
					else 
						dy = 0;
					
					if ((dx != 0) || (dy != 0)){	
						shiftExtent = new Extent({"xmin":extent.xmin-dx,"ymin":extent.ymin-dy,"xmax":extent.xmax-dx,"ymax":extent.ymax-dy,"spatialReference":{"wkid":102100}});
						clearTimeout(timer);
						timer = setTimeout(function() {
							if (shiftExtent != null) {
								map.setExtent(shiftExtent);
								
							}
						}, 100);
					}
					
				return true;
				}
      			
      				
      		}		
		}
    		
	);
}
 

  
//===================================================================

function updateMap(shuttleData, userGPS){
	require(["esri/map", "esri/geometry/Point","esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/graphic"], 
		function(Map, Point, SimpleMarkerSymbol, PictureMarkerSymbol, Graphic) {
			
			if(userGPS != null && map.graphics != null){
				var UserMarkerSymbol = new PictureMarkerSymbol('GeneralUI/userMarker2.png', 22, 22);
				if(userGraphic != null){
					map.graphics.remove(userGraphic);
				}
	  			
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
function centerMap(lat, lon, landmarkId, userBool){
	require(["esri/map", "esri/geometry/Point", "esri/graphic", "esri/symbols/PictureMarkerSymbol"], 
		function(Map, Point, Graphic, PictureMarkerSymbol) {
			
			
			var centerPoint = new esri.geometry.Point({
				latitude: lat,
				longitude: lon
			});
		
			map.centerAt(centerPoint);
			if(userBool == false){
				var StopMarkerSymbol = new PictureMarkerSymbol('GeneralUI/greenPin.png', 40, 40);
				StopMarkerSymbol.yoffset = StopMarkerSymbol.height / 2;
				var selectStopSymbol = new PictureMarkerSymbol('GeneralUI/orangePin.png', 65, 65);
				selectStopSymbol.yoffset = selectStopSymbol.height / 2; 

				if(lastGraphicClicked != null){
					lastGraphicClicked.setSymbol(StopMarkerSymbol);
				}
				
				for(var i = 0, len = allStopGraphics.length; i < len; i++){
					
					var tmp = allStopGraphics[i];
					
					if(tmp.attributes.landmarkId == landmarkId){
					
						tmp.setSymbol(selectStopSymbol);
						lastGraphicClicked = tmp;
						break;
					}
				}
			}else {
				Ti.API.info("made it here");
				var normalMarker = new PictureMarkerSymbol('GeneralUI/userMarker2.png', 22, 22);
				var bigMarker = new PictureMarkerSymbol('GeneralUI/userMarker2.png', 32, 32);
				if (userGraphic != null) {
					map.graphics.remove(userGraphic);
				}
				User = new esri.geometry.Point({
					latitude : lat,
					longitude : lon
				});
				userGraphic = new Graphic(User, bigMarker);
				map.graphics.add(userGraphic);
				setTimeout(function(){
					map.graphics.remove(userGraphic);
					userGraphic = new Graphic(User, bigMarker);
					map.graphics.add(userGraphic);
				}, 500);	

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

