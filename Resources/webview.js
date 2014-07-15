
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
var allStopGraphicsVisible;
var ExprStopGraphics = [];
var NorthStopGraphics = [];
var SouthStopGraphics = [];

var ShuttleMarkerSymbols = []; //preset symbols
var ShuttlePoints = []; //coordinates
var ShuttleGraphics = []; //specific symbol


//TODO: expand to set this array
var enabledRouteIDs = [4, 5];

Ti.App.addEventListener('updatemap', function(event){
	switch(event.id){
		case 0:		//createMap(userGPS, props)
			Ti.API.info("------------------EVENT: createMap");
			createMap(event.userGPS, event.props, event.baseMap, event.landmarkId);
			break;
		case 1:		//updateMap(shuttleData)
			Ti.API.info("------------------EVENT: updateMap");
			Ti.API.info("updateMap received: "+event.shuttleData);
			updateMap(event.shuttleData, event.userGPS, event.initialUpdate);
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
		case 9:
			toggleStopVisibility();
			break;
	}
	
});
	
//===================================================================	

//===================================================================

function changeBasemap(newBaseMap){
	require(["esri/map"],
		function(Map) {
			if (newBaseMap == "natural") {
				newBaseMap = "national-geographic";
			}
			map.setBasemap(newBaseMap);
		});
}

function toggleStopVisibility(){
 	require([
 		"esri/map", "esri/graphic", "dojo/_base/array"
 	],
 	function(Map, Graphic, arrayUtils){
 		if(allStopGraphicsVisible == true || allStopGraphicsVisible == "true"){
	 		arrayUtils.forEach(allStopGraphics, function(stopGraphic){
 				map.graphics.remove(stopGraphic);
 			});
 			allStopGraphicsVisible = false;
 		}else{
	 		arrayUtils.forEach(allStopGraphics, function(stopGraphic){
 				map.graphics.add(stopGraphic);
 			});
 			allStopGraphicsVisible = true;
 		}

 	});
}

function createMap(userGPS, props, baseMap, landmarkId){
	require([
		"esri/map", "esri/graphic", "dojo/_base/array", "esri/config",
		"esri/geometry/Point", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/geometry/Extent"], 
		function(Map, Graphic, arrayUtils, esriConfig, Point, PictureMarkerSymbol, SimpleLineSymbol, Extent) {
  			esriConfig.defaults.map.zoomDuration = 100; //default is 250
  			esriConfig.defaults.map.zoomRate = 10; //default is 25
  			esriConfig.defaults.map.panDuration = 100; 
  			esriConfig.defaults.map.panRate = 10; 
  			
  			var initExtent = new Extent({"xmin":-13725004.134997085,"ymin":5552112.499779742,"xmax":-13722324.061692765,"ymax":5553794.11440206,"spatialReference":{"wkid":102100}});
	  		var maxExtent = initExtent;
  			
  			if(baseMap == "natural"){
  				baseMap = "national-geographic";
  			}
  			
  			map = new Map("mapDiv", {
    			center: [-123.280, 44.562],
    			zoom: 15,
    			basemap: baseMap,
    			minZoom: 14,
    			slider: false,
    			showAttribution:false,
    			logo: false,
    			displayGraphicsOnPan: true,
    			optimizePanAnimation: true,
    			autoResize: true,
    			//extent: initExtent,
   			});
   			
   			//Setting up a new graphics layer for shuttle graphics
   			var shuttleLayer = new esri.layers.GraphicsLayer();
   			shuttleLayer.id = "shuttleLayer";
   			map.addLayer(shuttleLayer);
   			ShuttleMarkerSymbols.push(new PictureMarkerSymbol('Shuttle/bluetriangle.png', 20, 20)); //south central
			ShuttleMarkerSymbols.push(new PictureMarkerSymbol('Shuttle/greentriangle.png', 20, 20)); //*north central
			ShuttleMarkerSymbols.push(new PictureMarkerSymbol('Shuttle/orangetriangle.png', 20, 20)); //express
   			
   			

			var UserMarkerSymbol = new PictureMarkerSymbol('GeneralUI/userMarker2.png', 22, 22);
    		var StopMarkerSymbol = new PictureMarkerSymbol('GeneralUI/greenPin.png', 40, 40);
    		StopMarkerSymbol.yoffset = StopMarkerSymbol.height/2;
			var selectStopSymbol = new PictureMarkerSymbol('GeneralUI/orangePin.png', 65, 65);
			selectStopSymbol.yoffset = selectStopSymbol.height/2;
 
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
        		var NorthRoute = [
        		[-123.289718, 44.566792],
        		[-123.284842, 44.566783],
        		[-123.284738, 44.566799],
        		[-123.284360, 44.566798],
        		[-123.284354, 44.567408],
        		[-123.284553, 44.567685],
        		[-123.284555, 44.567904],
        		[-123.279962, 44.567957],
        		[-123.279930, 44.566784],
        		[-123.272398, 44.566765],
        		[-123.272961, 44.565833],
        		[-123.274050, 44.564669],
        		[-123.275300, 44.564643],
        		[-123.279935, 44.564635], //26TH and Jefferson
        		[-123.284575, 44.564650], //30th
        		[-123.289720, 44.564590],
        		[-123.289718, 44.566792]];
        		
        		var SouthRoute = [
        		[-123.274058, 44.564507], //14th and jefferson
        		[-123.275318, 44.564489],
        		[-123.280051, 44.564495], //26th and Jefferson
        		[-123.280016, 44.564158],
        		[-123.279917, 44.563829],
        		[-123.279700, 44.563401],
        		[-123.279686, 44.563371],
        		[-123.279700, 44.561972],
        		[-123.279700, 44.560713],
        		[-123.281585, 44.560713],
        		[-123.282356, 44.560538],
        		[-123.282962, 44.559992],
        		[-123.283010, 44.559296],
        		[-123.281948, 44.558409],
        		[-123.280609, 44.558455],
        		[-123.279740, 44.559033],
        		[-123.279679, 44.557859],
        		[-123.276646, 44.559460],
        		[-123.273996, 44.559873],
        		[-123.274318, 44.561578],
        		[-123.274114, 44.562113],
        		[-123.274058, 44.564507]];
        		
        		var ExpressRoute = [
        		[-123.279550, 44.558993],
        		[-123.279550, 44.561972],
        		[-123.279526, 44.563391],//--
        		[-123.279520, 44.563401],
        		[-123.279737, 44.563829],
        		[-123.279826, 44.564158], //--
        		[-123.279901, 44.564495], //26th and Jefferson  --
        		[-123.284775, 44.564500],
        		[-123.284775, 44.562234],
        		[-123.284625, 44.561965],
        		[-123.284625, 44.560529],
        		[-123.282576, 44.560538], // --
        		[-123.283142, 44.560012],
        		[-123.283160, 44.559246],
        		[-123.281967, 44.558254],
        		[-123.280559, 44.558305],
        		[-123.279550, 44.558993]];

      			
      			var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#e04726"), 3); 
      			var runningRoute = new esri.geometry.Polyline(ExpressRoute);
      			ExprRouteGraphic = new esri.Graphic(runningRoute,polylineSymbol);
      			map.graphics.add(ExprRouteGraphic);
      			
      			var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#79b140"), 3); 
      			var runningRoute = new esri.geometry.Polyline(NorthRoute);
      			NorthRouteGraphic = new esri.Graphic(runningRoute,polylineSymbol);
      			map.graphics.add(NorthRouteGraphic);

      			var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#1a4db9"), 3); 
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
    			
    			
    			Ti.API.info("props[7] : " + props[7]);
    			if(props[7] == true || props[7] == "true"){
    				allStopGraphicsVisible = true;
	       			arrayUtils.forEach(allStopPts, function(stopPt){
	    				if(landmarkId == stopPt[2]){
	    					lastGraphicClicked = new Graphic(new esri.geometry.Point({latitude: stopPt[0], longitude: stopPt[1]}), selectStopSymbol, {"landmarkId":stopPt[2], "lat":stopPt[0], "lon":stopPt[1]} , null);
	    					allStopGraphics.push(lastGraphicClicked);
	    					map.graphics.add(lastGraphicClicked);
	    				}
	    				else{
	    					var tempStop = new Graphic(new esri.geometry.Point({latitude: stopPt[0], longitude: stopPt[1]}), StopMarkerSymbol, {"landmarkId":stopPt[2], "lat":stopPt[0], "lon":stopPt[1]} , null);
		    				allStopGraphics.push(tempStop);
							map.graphics.add(tempStop);
	    				}
	    			});
    			}else{
    				allStopGraphicsVisible = false;
	       			arrayUtils.forEach(allStopPts, function(stopPt){
	    				if(landmarkId == stopPt[2]){
	    					lastGraphicClicked = new Graphic(new esri.geometry.Point({latitude: stopPt[0], longitude: stopPt[1]}), selectStopSymbol, {"landmarkId":stopPt[2], "lat":stopPt[0], "lon":stopPt[1]} , null);
	    					allStopGraphics.push(lastGraphicClicked);
	    				}
	    				else{
	    					var tempStop = new Graphic(new esri.geometry.Point({latitude: stopPt[0], longitude: stopPt[1]}), StopMarkerSymbol, {"landmarkId":stopPt[2], "lat":stopPt[0], "lon":stopPt[1]} , null);
		    				allStopGraphics.push(tempStop);
	    				}
	    			});
    			}
    			Ti.API.info("allStopGraphicsVisible : " + allStopGraphicsVisible);
    			
    			
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
      			
      			for(var i = 0; i < 3; i++){
      				if(props[i] == 'false' || props[i] == false){
      					switch(i){
      						case 0:
      							showExpress(false);
      							break;
      						case 1:
      							showSouth(false);
      							break;
      						case 2:
      							showNorth(false);
      							break;
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
						obj.setSymbol(selectStopSymbol);
						Ti.App.fireEvent('adjustTable', {
							data : [attr.landmarkId]
						});
		
						var centerPoint = new esri.geometry.Point({
							latitude : attr.lat,
							longitude : attr.lon
						});
		
						//map.centerAt(centerPoint); 
					}
				}   
				
				
	
				var timer;
				var shiftExtent = initExtent;
				
				dojo.connect(map, "onExtentChange", constrainExtent);
				
				
				function constrainExtent(extent, delta, levelChange, lod) {
					if (extent.intersects(maxExtent)){
						shiftExtent = extent;
					} else {
						map.setExtent(shiftExtent);
					}
				
				}
			
      		}		
		}
    		
	);
}
 

  
//===================================================================

function updateMap(shuttleData, userGPS, initialUpdate){
	require(["esri/map", "esri/geometry/Point","esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/graphic"], 
		function(Map, Point, SimpleMarkerSymbol, PictureMarkerSymbol, Graphic) {
			var shuttleLayer = map.getLayer("shuttleLayer");
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
			if (initialUpdate){
				Ti.API.info("updateMap INITIAL: ");
				//Set up the first grab of data
				for (var i = 0; i < shuttleData.length; i++){
					Ti.API.info("iteration: "+i);
					ShuttlePoints[i] = new esri.geometry.Point({
						latitude: shuttleData[i][1],
						longitude: shuttleData[i][2],
					});
					
				//Assign specifc symbols depending on Route ID
				switch(shuttleData[i][0]){
					case 1: 
						ShuttleGraphics[i] = ShuttleMarkerSymbols[0];
						break;
					case 2:	
						ShuttleGraphics[i] = ShuttleMarkerSymbols[1];
						break;
					case 3:	
						ShuttleGraphics[i] = ShuttleMarkerSymbols[2];
						break;
					default: 
						ShuttleGraphics[i] = ShuttleMarkerSymbols[0];
				}
				
				ShuttleGraphics[i].setAngle(shuttleData[i][3]);
					
				shuttleLayer.add(new Graphic(ShuttlePoints[i], ShuttleGraphics[i]));
	
				}
	
			}
			else{
				Ti.API.info("updateMap UPDATE");
				//Update with new data
				for (var i = 0; i < shuttleData.length; i++){				
						ShuttlePoints[i].setLatitude(shuttleData[i][1]);
						ShuttlePoints[i].setLongitude(shuttleData[i][2]);
						ShuttleGraphics[i].setAngle(shuttleData[i][3]);					
				}

				//Refresh all graphics on this layer
				shuttleLayer.redraw();	
			}
		
			/*
			if(shuttleData != null){
				
					
					//Check if route is enabled, if not, don't display shuttle graphic.
<<<<<<< HEAD
					// if(enabledRouteIDs.indexOf(shuttleData[i][0]) == -1){
						// continue;
					// }
					Ti.API.info("shuttleData[i][0] = " + shuttleData[i][0]);
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
=======
					if(enabledRouteIDs.indexOf(shuttleData[i][0]) == -1){
						continue;
					}
					
					
			*/
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
	require(["esri/map", "esri/geometry/Point", "esri/graphic", "esri/symbols/PictureMarkerSymbol", "esri/SpatialReference"], 
		function(Map, Point, Graphic, PictureMarkerSymbol) {
			
			
			var centerPoint = new esri.geometry.Point({
				latitude: lat,
				longitude: lon,
			});
			
// 
		// var sr = new SpatialReference(102100);
// 
		// var centerPoint = new esri.geometry.Point(lat, lon, sr); 

		
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

