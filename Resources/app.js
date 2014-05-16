//Campus Shuttle Tracking 

//NOTE: OFFICAL ROAD-LIKE COMMENT BLOCK
//===================================================================
//-------------------------------------------------------------------
//===================================================================

Titanium.UI.setBackgroundColor('#fff');

// create set of tabs
var tabGroup = Titanium.UI.createTabGroup();

var url = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates";
var url2 = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetRoutesForMapWithSchedule";
var url3 = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapVehiclePoints";


//Tab 1/Window 1: contains table for stops
/*var win1 = Ti.UI.createWindow({
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Shuttle Stops',
    window:win1
});
*/
//Tab 2/Window 2: contains webview w/ map
var win2 = Ti.UI.createWindow({
    backgroundColor:'#fff',
    navBarHidden:true
});
/*var tab2 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Map',
    window:win2
});

//Tab 3/Window 3: contains User GPS test
var win3 = Ti.UI.createWindow({
    backgroundColor:'#fff'
});
var tab3 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'user GPS test',
    window:win3
});
*/

//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Variables and function for filling the table with route and arrival info

var table = Ti.UI.createTableView();
var tableData = [];
var shuttles, shuttle, i, j, row, nameLabel, idLabel, stopsText;

function dataRequest(){
	var xhr = Ti.Network.createHTTPClient({
    	onload: function() {
     
     		//Clear the table at start of new request
    		tableData = [];
			table.setData(tableData);
     
    		shuttles = JSON.parse(this.responseText);
    
    		for (i = 0; i < shuttles.length; i++) {
        
	        	shuttle = shuttles[i]; //an individual route
	        
	        	row = Ti.UI.createTableViewRow({
	            	height:'60dp'
	        	});
	        
	        	nameLabel = Ti.UI.createLabel({ //name of route
	            				text:shuttle.Description,
	            				font:{
	                				fontSize:'24dp',
	                				fontWeight:'bold'
	            				},
	        					height:'auto',
	        					left:'10dp',
	        					top:'5dp',
	        					color:'#000',
	        					touchEnabled:true
	        					});
	        
	        	idLabel = Ti.UI.createLabel({ // ID of route
	            				text:'Route ID: ' + shuttle.RouteID,
	            				font:{
	                			fontSize:'16dp'
	            				},
	        					height:'auto',
	        					left:'15dp',
	        					top:'30dp',
	        					color:'#000',
	        					touchEnabled:false
	        					});
	        
	        	row.add(nameLabel);
	        	row.add(idLabel);
	        
	        	tableData.push(row);
	        
	        	//Look at locations along route
	        	for (j = 0; j < shuttle.RouteStops.length; j++) {
	        
	            	var innerRow = Ti.UI.createTableViewRow({
	                	height:'16dp'
	            	});
	            
	            	var eta = shuttle.RouteStops[j].Estimates[0].SecondsToStop;
	            
	            	if (eta == 0) {
	               		eta = '>>>Arrived<<<';
	            	}
	            	else eta = eta + ' seconds';
	            
	            	stopsText = Ti.UI.createLabel({ 
	                				text:'Location: ' + shuttle.RouteStops[j].Description + ', ETA: ' + eta,
	                				font:{
	                    				fontSize:'14dp'
	                				},
	            					height:'auto',
	            					left:'15dp',
	            					color:'#000',
	            					touchEnabled:false  
	            					});
	            
	            	innerRow.add(stopsText);
	            	tableData.push(innerRow);
	        	}
    		}
 
    		table.setData(tableData);
    		//Ti.API.info("TABLE DATA: " + tableData);
    
    	},
    
    onerror: function(e) {
    	Ti.API.debug("STATUS: " + this.status);
    	Ti.API.debug("TEXT:   " + this.responseText);
    	Ti.API.debug("ERROR:  " + e.error);
    	//alert('There was an error retrieving the remote data. Try again.');
    },
    timeout:5000
	});

	xhr.open("GET", url);
	xhr.send();

}

//win1.add(table);

//initial request to fill table
//-----------------Moved to Update functions below----------------
/*dataRequest();
 
//repeat every 5 seconds
setInterval(function() {
	dataRequest();
}, 3000);
*/

//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Create webview of map.html
var localWebview = Titanium.UI.createWebView({
	url:'map.html',
    top:0,
    left:10,
    right:10,
    //html:textContent,
    height:'100%',
    width:'auto',
    backgroundColor:'transparent',
    touchEnabled:true
});

//===================================================================
//-------------------------------------------------------------------
//===================================================================
//Slide menu

var bottomMenu = Ti.UI.createView({
    width:'100%',
    height:150,
    bottom:-150,
    backgroundColor:'#334C61'
});

var slideLabel = Titanium.UI.createLabel({
	color:'#334C61',
	text: 'View Details',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	bottom: 0,
	width:'auto',
	height:'auto'
});

var slideMenuUp = false;
slideLabel.addEventListener('click', function(e){
    if (slideMenuUp == true) {
        bottomMenu.animate({bottom:-150,duration:250});
        slideLabel.animate({bottom:0, duration:250});
        slideMenuUp = false;
    } else {
        bottomMenu.animate({bottom:0,duration:250});
        slideLabel.animate({bottom:150, duration:250});
        slideMenuUp = true;
    }
});


var routeCheckboxA = Ti.UI.createSwitch({
  style: Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
  title:'Route A',
  value:true,
  left: 10,
  top: 0,
  width: 100
});

var routeCheckboxB = Ti.UI.createSwitch({
  style: Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
  title:'Route B',
  value:true,
  left: 10,
  width: 100
});

var routeCheckboxC = Ti.UI.createSwitch({
  style: Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
  title:'Route C',
  value:true,
  left: 10,
  bottom: 0,
  width: 100
});

routeCheckboxA.addEventListener('change',function(){
	Ti.App.fireEvent("abox", {data: [routeCheckboxA.value]});
});

routeCheckboxB.addEventListener('change',function(){
	Ti.App.fireEvent("bbox", {data: [routeCheckboxB.value]});
});

routeCheckboxC.addEventListener('change',function(){
	Ti.App.fireEvent("cbox", {data: [routeCheckboxC.value]});
});

//var routeEstTableData = [ {title: 'Test:'}, {title: '8:08 : Ralph Miller Way'}, {title: '10:08 : Dixon Rec Center'}, {title: '12:08 : 26th & Jefferson'}, {title: '0:08 : Campus Way at Gilkey'} ];
var nearestArray = [];

var routeEstTable = Ti.UI.createTableView({
  left: 120,
  maxRowHeight: 40,
  data: nearestArray,
  scrollable: true,
  
});

/*var picker = Ti.UI.createPicker({ 
	left: 0,
	bottom:0, 
	width: '30%',
	height: 'auto' 
	
}); 


var pickerData = []; 
pickerData.push(Titanium.UI.createPickerRow({title:'Route A'})); 
pickerData.push(Titanium.UI.createPickerRow({title:'Route B'})); 
pickerData.push(Titanium.UI.createPickerRow({title:'Route C'})); 
pickerData.push(Titanium.UI.createPickerRow({title:'Route D'})); 
picker.add(pickerData);


var pickerTextField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  color: '#336699',
  bottom: 0, left: '30%',
  width: '70%', height: '30%'
}); */



//bottomMenu.add(picker);
//bottomMenu.add(pickerTextField);
bottomMenu.add(routeCheckboxA);
bottomMenu.add(routeCheckboxB);
bottomMenu.add(routeCheckboxC);
bottomMenu.add(routeEstTable);
win2.add(localWebview);
win2.add(bottomMenu);
win2.add(slideLabel);


//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Set up label to hold User GPS test
var labelgps = Titanium.UI.createLabel({
	color:'#999',
	text:'test',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

//Get User GPS, place in label
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
Titanium.Geolocation.getCurrentPosition(function(e)
			{
				if (!e.success || e.error)
				{
					labelgps.text = 'error code:' + JSON.stringify(e.code);
					//Ti.API.info("Code translation: "+translateErrorCode(e.code));
					//alert('error ' + JSON.stringify(e.error));
					//alert('Could not find mobile GPS unit');
					return;
				}
				var longitude = e.coords.longitude;
				var latitude = e.coords.latitude;
				var altitude = e.coords.altitude;
				var heading = e.coords.heading;
				var accuracy = e.coords.accuracy;
				var speed = e.coords.speed;
				var timestamp = e.coords.timestamp;
				var altitudeAccuracy = e.coords.altitudeAccuracy;
				Ti.API.info('speed ' + speed);
				labelgps.text = 'long:' + longitude + ' lat: ' + latitude;

				Titanium.API.info('geo - current location: ' + new Date(timestamp) + ' long ' + longitude + ' lat ' + latitude + ' accuracy ' + accuracy);
			});
			
//Place in label	
//win3.add(labelgps);


//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Variables and function for stop positions data
/*var routes, route;
var stops = new Array(7); //Hold list of stops
for (var i=0;i<7;i++){
	stops[i]=new Array(3); //Hold stop info: label, latitude, longitude
}*/
var tmpGPSData = [44.5657, -123.2789];
var stopsArray = [];
var nearestArray = [];
function findNearest(userLocation){
	var diffArray = [];
	nearestArray = [];
	
	updateRouteEstimates();
	for(var i = 0; i < stopsArray.length; i++){
		var tmpStop = stopsArray[i];
		var latitude = tmpStop[1];
		var longitude = tmpStop[2];
		var diff = Math.sqrt(Math.pow(Math.abs(userLocation[0] - latitude),2) + Math.pow(Math.abs(userLocation[1] - longitude),2));
		//var diff = Math.sqrt(Math.abs(userLocation[0] - latitude)^2 + Math.abs(userLocation[1] - longitude)^2);
		diffArray.push([diff, i]);
	}
	
	diffArray.sort(function(a,b){
		return a[0] - b[0];
	});
	
	
	for(var j = 0; j < diffArray.length; j++){
		var index = diffArray[j][1];
		//Ti.API.info("SORTED DIFF ARRAY: " + diffArray[j]);
		//Ti.API.info("diffArray index:" + index);
		var baseString = "   ";
		for(var i = 0; i < 3; i++){
			//Ti.API.info("made it 1 " + index + " , " + stopsArray[index][i+3]);
			if(stopsArray[index][i+3] != -1){
				baseString += "  " + stopsArray[index][i+3].toString() + "  ";
			}
			else{
				baseString += "       ";
			}
		}
		//Ti.API.info("baseString: " + baseString);
		nearestArray.push({title: stopsArray[index][0]});
		nearestArray.push({title: baseString});
		
	}
	routeEstTable.setData(nearestArray);
}

var xhr2 = Ti.Network.createHTTPClient({
	onload: function() {
		var routesArray = [];

		
		//Retrieve initial route info
		routes = JSON.parse(this.responseText);
		for(var i = 0; i < routes.length; i++){
			var routeArray = [];
			var route = routes[i];
	
			for (var j = 0; j < route.Landmarks.length; j++){
				var landmarkArray = [];
				var data = route.Landmarks[j];
				landmarkArray.push(data.Label, data.Latitude, data.Longitude);
				routeArray.push(landmarkArray);
				
			}
			routesArray.push(routeArray);
		}
		Ti.API.info("ROUTES ARRAY: " + routesArray.toString());

		//Sort and remove duplicates. Add flags for which shuttles stop at each stop.
		for(var k = 0; k < routesArray.length; k++){
			for(var l = 0; l < routesArray[k].length; l++){
				var cur = routesArray[k][l];
				var skip = 0;
				
				
				for(var i = 0; i < stopsArray.length; i++){
					if(stopsArray[i][0] == cur[0]){
						skip = 1;
						flag.push(i, k);
						break;
					}	
				}
				
			

				if(!skip){
					var tmpArray = [];
					tmpArray.push(cur[0], cur[1], cur[2], -1, -1, -1);
					stopsArray.push(tmpArray);
					//Ti.API.info("stops array status: " + stopsArray.toString());
				}
				/*else {
					Ti.API.info("FLAG Status: " + flag[0] + ", " + flag[1]);
					switch(flag[1]){
						case 0:
							stopsArray[flag[0]][3] = 1;
							break;
						case 1:
							stopsArray[flag[0]][4] = 1;
							break;
						case 2: 
							stopsArray[flag[0]][5] = 1;
							break;
						
					}
					
				}*/
			}
			
		}
		/* ----------------ARRAY INFO-----------------------
		 * 
		 * stopsArray STRUCTURE
		 * 		[Stop Name, Latitude, Longitude, SouthCentralBusFlag, NorthCentralBusFlag, ExpressBusFlag]
		 * 		
		 * 		Example
		 * 			[LaSells Stewart Center,44.55901,-123.27962,1,0,1]
		 * 
		 * 
		 */
		
		//Ti.API.info("FINAL STOPS ARRAY: " + stopsArray.toString());
		//Ti.API.info("Newly stopsArray: " + stopsArray.toString());
	}
	
	//Should include onerror here
	
});

xhr2.open("GET", url2);
xhr2.send();

function updateRouteEstimates(){
	//Ti.API.info("Starting updateRouteEst function");
	var shuttles = [];
	var xhr4 = Ti.Network.createHTTPClient({
		onload: function() {
			shuttles = JSON.parse(this.responseText);
			for(var i = 0; i < shuttles.length; i++){
				var shuttle = shuttles[i];
				for(var j = 0; j < stopsArray.length; j++){
					for(var k = 0; k < shuttle.RouteStops.length; k++){
						if(shuttle.RouteStops[k].Description == stopsArray[j][0]){
							stopsArray[j][i+3] = shuttle.RouteStops[k].Estimates[0].SecondsToStop;
						}
					}
				}
			}
		},
		onerror: function(e){
			Ti.API.info("UPDATE ROUTE EST ERROR: "+e);
		},
		timeout : 5000
		
	});
	
	xhr4.open("GET", url);
	xhr4.send();

	

}
<<<<<<< HEAD
=======

>>>>>>> 66a367c87dd912cc5b611f2a617c93740c386305


//===================================================================
//-------------------------------------------------------------------
//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Variables and function for shuttle coordinates data

var shuttleloc, shuttlelocs;
var shuttlecoords = new Array(3); //Hold all shuttle data
for (var i=0;i<3;i++){
	shuttlecoords[i]=new Array(2); //Hold latitude, longitude
}
var heading = new Array(3);

function ShuttleLocRequest(){
	var xhr3 = Ti.Network.createHTTPClient({
		onload: function() {
		
			//Get all info
			shuttlelocs = JSON.parse(this.responseText);
		
			for (var x=0;x<shuttlelocs.length;x++){
				shuttleloc = shuttlelocs[x];
				shuttlecoords[x][0] = shuttleloc.Latitude;
				shuttlecoords[x][1] = shuttleloc.Longitude;
				
				heading[x] = shuttleloc.Heading;
			}
		},
		onerror : function(e) {
         	try{
         		Ti.API.info("Get Object from backup");
         		shuttlecoords = Ti.App.Properties.getObject('backupShuttleCoords');
         		heading = Ti.App.Properties.getObject('backupHeading');
         		
         	}catch(err){
         		Ti.API.info("Failed to retrieve backup shuttle data: " + err);
         	}
         	
     	}
		
	});
	xhr3.open("GET", url3);
	xhr3.send();
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================

var dummyUser = ["dummy User GPS data", 44.567135, -123.278918];

//Event listener to start when webview loads
localWebview.addEventListener('load',function(){
	var stops = [];
	//Start the create map event

	
	Ti.App.fireEvent("startmap", {data: [stops, dummyUser]});

	setTimeout(function() {
		dataRequest();
		ShuttleLocRequest();
		setBackupShuttleData();
		Ti.App.fireEvent("updatemap", {data: [shuttlecoords, heading]});
	}, 1500);
	

	//Request the shuttle data, and start the update event, repeats every 5 seconds
	setInterval(function() {
		dataRequest();
		ShuttleLocRequest();
		findNearest(tmpGPSData);
		Ti.App.fireEvent("updatemap", {data: [shuttlecoords, heading]});
	}, 5000);
	
});

//===================================================================
//-------------------------------------------------------------------
//===================================================================

function setBackupShuttleData(){
	Ti.App.Properties.setObject('backupShuttleCoords', shuttlecoords);
	Ti.App.Properties.setObject('backupHeading', heading);
	
}


win2.open();
//Start the tabs
/*tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);
tabGroup.addTab(tab3);
tabGroup.open();*/

