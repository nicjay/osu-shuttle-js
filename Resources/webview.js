  	
//===================================================================
  	//Set up variables and event listeners
/*
  	<link rel="stylesheet" href="http://js.arcgis.com/3.8/js/dojo/dijit/themes/claro/claro.css">
  	<link rel="stylesheet" href="http://js.arcgis.com/3.8/js/dojo/dojox/widget/ColorPicker/ColorPicker.css">
  	<link rel="stylesheet" href="http://js.arcgis.com/3.8/js/esri/css/esri.css">
 */

  	var data, UserGPS, map, pt, symbol;
  	var selectStop;
  	var GS1, GS2, GS3;
  	var shuttlecoords;
  	var heading = new Array(3);
  	
  	var ExprRouteGraphic;
  	var NorthRouteGraphic;
  	var SouthRouteGraphic;
  	
  	
  	var ExprStopGraphics = [];
  	var NorthStopGraphics = [];
  	var SouthStopGraphics = [];
  	
  	
  	
  	var enableExpress = true;
  	var enableNorth = true;
  	var enableSouth = true;
  
  	//When this event occurs, fill up variables and create map.
   	Ti.App.addEventListener("startmap", function (event) {
  		data = event.data[0]; //Hold stop info -- not used currently
		UserGPS = event.data[1]; //Holds user GPS data
    	createMap();
    	
    });
    
    Ti.App.addEventListener('centerMap', function(event){
		var pointArray = [event.latitude, event.longitude];
		centerMap(pointArray);
    	
    });
    
    //When this event occurs, fill up shuttle coords and update map.
    Ti.App.addEventListener('updatemap', function(event){
    	shuttlecoords = [];
		shuttlecoords = event.data[0];
		heading = event.data[1];
		updateMap();
		});
		
		
	Ti.App.addEventListener('abox', function(event){
		//Ti.API.info('Switch value: ' + event.data[0]);
		enableNorth = event.data[0]; 
		updateMap();
		ShowNorth();
		
		});
		
	Ti.App.addEventListener('bbox', function(event){
		//Ti.API.info('Switch value: ' + event.data[0]);
		enableSouth = event.data[0]; 
		updateMap();
		ShowSouth();
		
		});
		

	Ti.App.addEventListener('cbox', function(event){
		//Ti.API.info('Switch value: ' + event.data[0]);
		enableExpress = event.data[0]; 
		updateMap();
		ShowExpress();
		});
	//===================================================================	

//===================================================================

    function createMap(){
    	require([
    		"esri/map", "esri/geometry/Point",
    		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic",
    		"dojo/_base/array", "dojo/dom-style", "dojox/widget/ColorPicker", "dojo/Deferred", "dojo/_base/Color",
    		"dojo/domReady!"], 
    		function(Map, Point, SimpleMarkerSymbol, SimpleLineSymbol, Graphic, arrayUtils, domStyle, Color) {
      			
      			map = new Map("mapDiv", {
        			center: [-123.280, 44.562],
        			zoom: 15,
        			basemap: "osm",
        			minZoom: 12,
        			sliderStyle:"large",
        			logo: false
       			});
       		
   				
   				var UserMarkerSymbol = new esri.symbol.PictureMarkerSymbol('GeneralUI/userMarker2.png', 22, 22);
   				//var UserMarkerSymbol = new esri.symbol.SimpleMarkerSymbol();
        		//UserMarkerSymbol.setColor(new dojo.Color("#00FF00"));
        		//UserMarkerSymbol.setOutline(null);
        		
        		var StopMarkerSymbol = new esri.symbol.PictureMarkerSymbol('GeneralUI/stopSign.png', 15, 15);
        		//Cusom picture example for marker
        		//symbol = new PictureMarkerSymbol("images/bluedot.png", 40, 40);
        			
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
        		
        		
        		
        		/*map.on("click", myClickHandler);
  
  				function myClickHandler(evt) {
    				Ti.API.info("Map Clicked!!!");
  				}*/
        		
        		
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
	        		/*
	        		var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#0000FF"), 4); 
	          		var runningRoute = new esri.geometry.Polyline(ExpressRoute);
	          		ExprRouteGraphic = new esri.Graphic(runningRoute,polylineSymbol);
	          		map.graphics.add(ExprRouteGraphic);
          			
          			*/
          			
          			var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#576fff"), 3); 
          			var runningRoute = new esri.geometry.Polyline(ExpressRoute);
          			ExprRouteGraphic = new esri.Graphic(runningRoute,polylineSymbol);
          			map.graphics.add(ExprRouteGraphic);
          			
          			var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#FF6600"), 3); 
          			var runningRoute = new esri.geometry.Polyline(NorthRoute);
          			NorthRouteGraphic = new esri.Graphic(runningRoute,polylineSymbol);
          			map.graphics.add(NorthRouteGraphic);
          			
          			//00FF00
          			var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#36c636"), 3); 
          			var runningRoute = new esri.geometry.Polyline(SouthRoute);
          			SouthRouteGraphic = new esri.Graphic(runningRoute,polylineSymbol);
          			map.graphics.add(SouthRouteGraphic);
          			
          			
          			if(UserGPS[0] != 0 && UserGPS[1] != 0){
        			    User = new esri.geometry.Point({
  								latitude: UserGPS[0],
  								longitude: UserGPS[1]
						});
						map.graphics.add(new Graphic(User, UserMarkerSymbol));		
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
          			
          			
          			map.graphics.on("click", myGraphicsClickHandler);
        		
	        		function myGraphicsClickHandler(evt) {
	    				var obj = evt.graphic.attributes;
	    				var str = JSON.stringify(obj);
	    				Ti.API.info("User clicked on " + str);
	    				Ti.App.fireEvent("adjustTable", {data: [str]});
	    			
	  				}
          			
          			
        		}
        		
        		
        		

        		
        	});
       }
       
       
//===================================================================

       function updateMap(){
       	require([
    		"esri/map", "esri/geometry/Point",
    		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/PictureMarkerSymbol", "esri/graphic",
    		"dojo/_base/array", "dojo/dom-style", "dojox/widget/ColorPicker", "dojo/_base/Color", "dojo/Deferred",
    		"dojo/domReady!"], 
    		function(Map, Point, SimpleMarkerSymbol, SimpleLineSymbol, PictureMarkerSymbol, Graphic, arrayUtils, domStyle, Color) {

    				//Clear the outdated positions
					map.graphics.remove(GS1);
        			map.graphics.remove(GS2);
   					map.graphics.remove(GS3);
					
					var ShuttleMarkerSymbol1 = new PictureMarkerSymbol('Shuttle/bluetriangle.png', 20, 20); //south central
					var ShuttleMarkerSymbol2 = new PictureMarkerSymbol('Shuttle/greentriangle.png', 20, 20); //*north central
					var ShuttleMarkerSymbol3 = new PictureMarkerSymbol('Shuttle/orangetriangle.png', 20, 20); //express
    				
    				//Set up the point coordinates
       				Shuttle1 = new esri.geometry.Point({
  								latitude: shuttlecoords[0][0],
  								longitude: shuttlecoords[0][1]
								});
										

					Shuttle2 = new esri.geometry.Point({
  								latitude: shuttlecoords[1][0],
  								longitude: shuttlecoords[1][1]
								});
				
					Shuttle3 = new esri.geometry.Point({
  								latitude: shuttlecoords[2][0],
  								longitude: shuttlecoords[2][1]
								});
								
        				
        
        			ShuttleMarkerSymbol1.setAngle(heading[0]);
        			ShuttleMarkerSymbol2.setAngle(heading[1]);
        			ShuttleMarkerSymbol3.setAngle(heading[2]);
        			
       				GS3 = new Graphic(Shuttle1, ShuttleMarkerSymbol1);
       				GS2 = new Graphic(Shuttle2, ShuttleMarkerSymbol2);
					GS1 = new Graphic(Shuttle3, ShuttleMarkerSymbol3);
  
  					if (enableNorth){
       					map.graphics.add(GS1);
       				}
       				
       				if (enableSouth){
       					map.graphics.add(GS2);
       				}
       				
       				if (enableExpress){
       					map.graphics.add(GS3);
       				}

      		});
       }
       
       
       
       function ShowExpress(){
    	require([
    		"esri/map", "esri/geometry/Point",
    		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic",
    		"dojo/_base/array", "dojo/dom-style", "dojox/widget/ColorPicker", "dojo/_base/Color",
    		"dojo/domReady!"], 
    		function(Map, Point, SimpleMarkerSymbol, SimpleLineSymbol, Graphic, arrayUtils, domStyle, Color) {
      			
   				//test
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
       
       function ShowNorth(){
    	require([
    		"esri/map", "esri/geometry/Point",
    		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic",
    		"dojo/_base/array", "dojo/dom-style", "dojox/widget/ColorPicker", "dojo/_base/Color","dojo/Deferred",
    		"dojo/domReady!"], 
    		function(Map, Point, SimpleMarkerSymbol, SimpleLineSymbol, Graphic, arrayUtils, domStyle, Color) {
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
       function ShowSouth(){
    	require([
    		"esri/map", "esri/geometry/Point",
    		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic",
    		"dojo/_base/array", "dojo/dom-style", "dojox/widget/ColorPicker", "dojo/_base/Color","dojo/Deferred",
    		"dojo/domReady!"], 
    		function(Map, Point, SimpleMarkerSymbol, SimpleLineSymbol, Graphic, arrayUtils, domStyle, Color) {
      			
   				//test
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
       
       
       function centerMap(data){
       	 require([
    		"esri/map", "esri/geometry/Point",
    		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic", "esri/symbols/PictureMarkerSymbol",
    		"dojo/_base/array", "dojo/dom-style", "dojox/widget/ColorPicker", "dojo/_base/Color","dojo/Deferred",
    		"dojo/domReady!"], 
    		function(Map, Point, SimpleMarkerSymbol, SimpleLineSymbol, Graphic, PictureMarkerSymbol, arrayUtils, domStyle, Color) {
      			var centerPoint = new esri.geometry.Point({
					latitude: data[0],
					longitude: data[1]
				});
      			
      			map.graphics.remove(selectStop);
      			
      			map.centerAt(centerPoint);
      			
      			var selectStopSymbol = new PictureMarkerSymbol('GeneralUI/select.png', 15, 15);

      			selectStop = new Graphic(centerPoint, selectStopSymbol);
      			map.graphics.add(selectStop);
   				
        	});
       }
       
       
     
//===================================================================

