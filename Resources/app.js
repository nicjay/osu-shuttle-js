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

var userGPS = [0, 0];
var deviceGPSOn = false;
var gpsOffPhrase = "GPS: Off";
var gpsOnPhrase = "GPS: On";

var win2 = Ti.UI.createWindow({
    backgroundColor:'#c34500',
    navBarHidden:true,
    softKeyboardOnFocus: Titanium.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS,
});

//===================================================================
//------------------------------------------------------------------- 
//===================================================================

//Create webview of map.html

var localWebview = Titanium.UI.createWebView({
	url:'map.html',
    top:0,
    left:0,
    right:0,
    //html:textContent,
    height:'71%',
    width:'auto',
    backgroundColor:'#373737',
    touchEnabled:true,
    borderColor: '#111111',
    borderWidth: 0,
    borderRadius: 0,
    //borderColor: '#080808',
    //borderWidth: '8px'
});


var userGPSStatusLabel = Titanium.UI.createLabel({
	color:'#334C61',
	text: '',
	font:{fontSize:15,fontFamily:'Helvetica Neue', fontWeight: 'bold'},
	textAlign:'left',
	top: 3,
	left: 10,
	backgroundColor: 'transparent',
});

//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Slide menu
var bottomMenuHeight = '28%';
var bottomMenu = Ti.UI.createView({
    width:'auto',
    height:bottomMenuHeight,
    bottom:3,
    left: 3,
    right: 3,
    backgroundColor:'#373737',
    borderColor: '#111111',
    borderWidth: 5,
    borderRadius: 0,
});

var slideLabel = Titanium.UI.createLabel({
	color:'#334C61',
	text: '',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	bottom: 0,
	width: 'auto',
	height:'auto',
	backgroundImage: 'GeneralUI/slideBar.png'
});

/*var slideMenuUp = true;
slideLabel.addEventListener('touchend', function(e){
    if (slideMenuUp == true) {
        bottomMenu.animate({bottom:-bottomMenuHeight,duration:250});
        slideLabel.animate({bottom:0, duration:250});
        slideMenuUp = false;
    } else {
        bottomMenu.animate({bottom:0,duration:250});
        slideLabel.animate({bottom:bottomMenuHeight, duration:250});
        slideMenuUp = true;
    }
});*/

//Array of nearest stops
var nearestArray = [];
var routeEstTable = Ti.UI.createTableView({
  left: 70,
  maxRowHeight: 50,
  data: nearestArray,
  scrollable: true,
  color: '#ffffff',
  separatorColor: 'transparent',
  
});

//Route visibility toggle checkboxes
var routeCheckboxA, routeCheckBoxB, routeCheckboxC;

createRouteCheckBox();

//Add objects to window
bottomMenu.add(routeEstTable);
win2.add(localWebview);
win2.add(bottomMenu);
win2.add(slideLabel);
win2.add(userGPSStatusLabel);


//===================================================================
//-------------------------------------------------------------------
//===================================================================

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
				else{
					
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


function getUserGPS(){
	Titanium.Geolocation.getCurrentPosition(function(e)
		{
			if (!e.success || e.error)
			{
				Ti.API.info("Failed to get UserGPS, error: " + e);
				deviceGPSOn = false;
				userGPSStatusLabel.text = gpsOffPhrase;
				return;
			}
			else{
				userGPS[0] = e.coords.latitude;
				userGPS[1] = e.coords.longitude;
				userGPS[2] = e.coords.timestamp;
				deviceGPSOn = true;
				userGPSStatusLabel.text = gpsOnPhrase;
			}

		});
}
//===================================================================
//-------------------------------------------------------------------
//===================================================================


var tmpGPSData = [44.567635, -123.278518];
var stopsArray = [];
function findNearest(userLocation){
	var diffArray = [];
	nearestArray = [];
	
	updateRouteEstimates();
	
	//Calculate differences between stops and UserGPS
	for(var i = 0; i < stopsArray.length; i++){
		var tmpStop = stopsArray[i];
		var latitude = tmpStop[1];
		var longitude = tmpStop[2];
		//var diff = Math.sqrt(Math.pow(Math.abs(userLocation[0] - latitude),2) + Math.pow(Math.abs(userLocation[1] - longitude),2));
		var diff = getDistanceFromLatLonInKm(userLocation[0],userLocation[1],latitude,longitude);
		
		//var diff = Math.sqrt(Math.abs(userLocation[0] - latitude)^2 + Math.abs(userLocation[1] - longitude)^2);
		diffArray.push([diff, i]);
	}
	
	//Sort the new array by distance, with [0] being the smallest
	diffArray.sort(function(a,b){
		return a[0] - b[0];
	});
	
	var routeColor, baseLeft = 70, labelArray = [];
	for(var j = 0; j < diffArray.length; j++){
		var index = diffArray[j][1], distance = diffArray[j][0];
		var baseRow = Ti.UI.createTableViewRow({
	    	height:'auto',
	    });
	    
	    labelArray = [];
	    var leftIncrement = 70;
		for(var i = 0; i < 3; i++){
			if(i==0){
				var distanceLabel = Ti.UI.createLabel({
					font: { fontSize:14 },
					text: distance.toFixed(2.2) + " mi",
					color: '#C0C0C0',
					left: 10,
					top: 28,
				});
				labelArray.push(distanceLabel);
			}
			
			if(stopsArray[index][i+3] != -1){
				switch(i+3){
					case 3:
						//routeColor = '#576fff';
						routeColor = '#7084ff';
						break;
					case 4:
						routeColor = '#36c636';
						break;
					case 5:
						routeColor = '#ff6600';
						break;
					default:
						Ti.API.info("ALERT, wrong index Stops Array");
				}
				var eta = stopsArray[index][i+3].toString();
				if(eta > 59){
					var minutes = Math.round(eta % 60);
					var hours = Math.round(eta / 60);
					if(minutes < 10)
						eta = hours + ":0" + minutes;
					else
						eta = hours + ":" + minutes;
				}
				else{
					if(eta < 10)
						eta = "0:0"+eta;
					else
						eta = "0:"+eta;
				}
				if(eta == '0:00'){
					eta = 'Arrived';
				}
				var stopTiming = Ti.UI.createLabel({
					font: { fontSize:20 },
					text: eta,
					color: routeColor,
					top: 25,
					left: baseLeft+(leftIncrement*i)
				});
				labelArray.push(stopTiming);
			}
		}
		
		var secondaryRow = Ti.UI.createTableViewRow({
	    	height:'auto',
	    	textAlign: 'left',
	    });
	   	
	   	var stopNameLabel = Ti.UI.createLabel({
			font: { fontSize:16 },
			text: stopsArray[index][0],
			color: '#FFFFFF',
			left: 0,
			top: 6
		});
		secondaryRow.add(stopNameLabel);
	    
	    for(var i = 0; i < labelArray.length; i++){
			secondaryRow.add(labelArray[i]);
		}
		//1D1D1D
	
		/*secondaryRow.addEventListener('click', function(e){
			Ti.API.info("Clicked! e.row: " + e.row + " diffArray[e.row]: " + diffArray[e.row]);
			var index = diffArray[e.index][1];
			var val1 = stopsArray[index][1];
			var val2 = stopsArray[index][2];
			Ti.App.fireEvent("centerMap", {latitude: val1, longitude: val2});
		});*/
		nearestArray.push(secondaryRow);
		//nearestArray.push(baseRow);
		
	}
	
	
	routeEstTable.setData(nearestArray);
	routeEstTable.addEventListener('touchend', function(e){
		Ti.API.info("Clicked! e.row: " + e.row + " diffArray[e.row]: " + diffArray[e.row]);
		var index = diffArray[e.index][1];
		var val1 = stopsArray[index][1];
		var val2 = stopsArray[index][2];
		Ti.App.fireEvent("centerMap", {latitude: val1, longitude: val2});
	});
	
	//Event listener triggered on map click on stop. Starts function that scrolls the table.
	Ti.App.addEventListener('adjustTable', function(event){
		adjustTable(event);		
	});
}


//set stopsArray
var xhr2 = Ti.Network.createHTTPClient({
	onload: function() {
		var routesArray = [];
		var id = 0;
		
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
						break;
					}	
				}
		
				if(!skip){
					var tmpArray = [];
					tmpArray.push(cur[0], cur[1], cur[2], -1, -1, -1, id++);
					stopsArray.push(tmpArray);
				}
			}
			
		}
		//Ti.API.info("ROUTES ARRAY v2: " + stopsArray.toString());
		
		  /*      		var StopPtsSouthCentral = [
					[44.55832, -123.28162, 1],
					[44.560524, -123.282411, 2],
					[44.56344, -123.27964, 3],
					[44.564578, -123.279934, 4],
					[44.56675, -123.27719, 5],
					[44.56673, -123.273, 6],
					[44.55901, -123.27962, 7]];
					
        		var StopPtsNorthCentral = [
                    [44.564578, -123.279934, 4],
                    [44.56344, -123.27964, 3],
                    [44.56458, -123.28654, 8],
                    [44.56785, -123.28934, 9],
                    [44.56792, -123.28146, 10],
                    [44.56675, -123.27719, 5],
                    [44.56673, -123.273, 6],
                    [44.562588, -123.274155, 11]];
                    
        		var StopPtsExpress = [
                    [44.564578, -123.279934, 4],
                    [44.568107, -123.279461, 12],
                    [44.55901, -123.27962, 7],
                    [44.55832, -123.28162, 1],
                    [44.560524, -123.282411, 2],
                    [44.56344, -123.27964, 3]];
				*/        

		/* ----------------ARRAY INFO-----------------------
		 * stopsArray STRUCTURE
		 * 		[Stop Name, Latitude, Longitude, SouthCentralBusFlag, NorthCentralBusFlag, ExpressBusFlag]
		 * 	
		 * 		Example
		 * 			[LaSells Stewart Center,44.55901,-123.27962,1,0,1]		*/

	}
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
//


//Event listener to start when webview loads
localWebview.addEventListener('load',function(){
	var gpsCounter = 0;
	var stops = [];
	//Start the create map event

	getUserGPS();
	Ti.App.fireEvent("startmap", {data: [stops, userGPS]});
	setTimeout(function() {
		ShuttleLocRequest();
		setBackupShuttleData();
		Ti.App.fireEvent("updatemap", {data: [shuttlecoords, heading]});
	}, 1500);
	

	//Request the shuttle data, and start the update event, repeats every 5 seconds
	setInterval(function() {
		if(deviceGPSOn){
			gpsCounter++;
			if(gpsCounter === 10){
				userGPS.length = 0;
				getUserGPS();
				gpsCounter = 0;
			}
		}
		ShuttleLocRequest();
		findNearest(userGPS);
		Ti.App.fireEvent("updatemap", {data: [shuttlecoords, heading]});
	}, 4000);
	
});

//===================================================================
//-------------------------------------------------------------------
//===================================================================
win2.addEventListener('android:back',function(e) {
});

Ti.UI.Android.hideSoftKeyboard();
win2.open();

//===================================================================
//-------------------------------------------------------------------
//===================================================================

function setBackupShuttleData(){
	Ti.App.Properties.setObject('backupShuttleCoords', shuttlecoords);
	Ti.App.Properties.setObject('backupHeading', heading);
	
}

function createRouteCheckBox(){
	routeCheckboxB = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  value:true,
	  left: 10,
	  top: 5,
	  width: 55,
	  height: 50,
	  backgroundImage: 'Checkbox/green_on.png',
	  titleOff: '',
	  titleOn: ''
	});
	
	routeCheckboxA = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  value:true,
	  left: 10,
	  width: 55,
	  height: 50,
	  backgroundImage: 'Checkbox/orange_on.png',
	  titleOff: '',
	  titleOn: ''
	});
	
	
	routeCheckboxC = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  value:true,
	  left: 10,
	  bottom: 5,
	  width: 55,
	  height: 50,
	  backgroundImage: 'Checkbox/blue_on.png',
	  titleOff: '',
	  titleOn: ''
	});
	
	bottomMenu.add(routeCheckboxA);
	bottomMenu.add(routeCheckboxB);
	bottomMenu.add(routeCheckboxC);
	
	setCheckBoxEventListeners();
}

function setCheckBoxEventListeners(){
	routeCheckboxA.addEventListener('change',function(){
		Ti.App.fireEvent("abox", {data: [routeCheckboxA.value]});
		if(routeCheckboxA.value == true){
			routeCheckboxA.setBackgroundImage('Checkbox/orange_on.png');
		}
		else{
			routeCheckboxA.setBackgroundImage('Checkbox/orange_off.png');
		}
	});
	
	routeCheckboxB.addEventListener('change',function(){
		Ti.App.fireEvent("bbox", {data: [routeCheckboxB.value]});
		if(routeCheckboxB.value == true){
			routeCheckboxB.setBackgroundImage('Checkbox/green_on.png');
		}
		else{
			routeCheckboxB.setBackgroundImage('Checkbox/green_off.png');
		}
	});
	
	routeCheckboxC.addEventListener('change',function(){
		Ti.App.fireEvent("cbox", {data: [routeCheckboxC.value]});
		if(routeCheckboxC.value == true){
			routeCheckboxC.setBackgroundImage('Checkbox/blue_on.png');
		}
		else{
			routeCheckboxC.setBackgroundImage('Checkbox/blue_off.png');
		}
	});
}

//FUNCTION : Adjusts tableView upon map click. Scrolls to chosen stop.
function adjustTable(e){
	var stopId = e.data[0];
	
	var dataToChange = routeEstTable.getData();
	dataToChange = dataToChange[0].getRows();
	
	//Find name of chosenStop using stopId passed in
	var chosenStop, i;
	for(i = 0; i < stopsArray.length; i++){
		if(stopsArray[i][6] == stopId){
			chosenStop = stopsArray[i][0];
			break;
		}
	}
	
	//Find row with the same name, scroll to it.
	var stopName, j;
	for(i = 0; i < dataToChange.length; i++){
		stopName = dataToChange[i].children[0].text;
		if(stopName == chosenStop){
			var row = dataToChange[i];
			row.backgroundColor = '#000000';
			routeEstTable.scrollToTop(i);
			break;
		}	
	}
	
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}
