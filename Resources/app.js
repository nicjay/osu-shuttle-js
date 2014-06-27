//Campus Shuttle Tracking 

//NOTE: OFFICAL ROAD-LIKE COMMENT BLOCK
//===================================================================
//-------------------------------------------------------------------
//===================================================================

if (Titanium.Network.networkType === Titanium.Network.NETWORK_NONE) {
   Titanium.API.info(' no connection ');
   alert('no connection');
} else {
   Titanium.API.info(' connection present ');
}

var props = [];
initProperties();
Ti.API.info("Properties init to : " + props.toString());

Titanium.UI.setBackgroundColor('#fff');
Ti.UI.Android.hideSoftKeyboard();
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

var initialLaunch = true;

var url = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates";
var url2 = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetRoutesForMapWithSchedule";
var url3 = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapVehiclePoints";

var userGPS = [44.565, -123.277];
var deviceGPSOn = false;
var gpsOffPhrase = "GPS: Off";
var gpsOnPhrase = "GPS: On";

var settingsWin, settings;
var toggleMenuOn = false;
var loadedHTTP = false;

//Array of nearest stops
var nearestArray = [];
var stopsArray = [], diffArray = [];

//Variables and function for shuttle coordinates data
var shuttleData = [], shuttleTmpData = [];
var shuttleLocs;

//Number of milliseconds between update calls
var updateInterval = 4000;
//Number of update cycles between getting GPS     4 * 4 = 16 seconds
var getGPSInterval = 4;

//Create main window
var win = Ti.UI.createWindow({
    backgroundColor:'#000000',
    navBarHidden:true,
    windowSoftInputMode: Titanium.UI.Android.SOFT_INPUT_STATE_ALWAYS_HIDDEN,
    layout: 'vertical',
});

//===================================================================
//-------------------------------------------------------------------
//===================================================================
//Init everything for selectedStopView


var selectedStopView = Ti.UI.createView({
	backgroundGradient: {
		type:'linear',
		//colors:[{color:'#656968', position:0.0},{color:'#3a3c3b', position: 1.0}]
		colors:[{color:'#3b3b3b', position:0.0},{color:'#1e1e1e', position: 1.0}]
	},
	height: '15%',
	layout: 'vertical',	
});

var UstopNameLabel = Ti.UI.createLabel({
	minimumFontSize: '12sp',
	font: { fontSize:'22sp' },
	text: '',//stopsArray[0][0],
	color: '#FFFFFF',
	left: 10,
	//height: '10%',
	//verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
	//textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
});
	
var distanceLabel = Ti.UI.createLabel({
	color: '#C0C0C0',
	textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
	top: 9,
	width: Ti.UI.FILL,
});

var settingsButton = Ti.UI.createButton({
	height: 36,
	width: 36,
	backgroundImage: 'GeneralUI/settingsGear.png',
	backgroundSelectedImage: 'GeneralUI/settingsGearPressed.png',
	
});

var viewTopSection = Ti.UI.createView({
   	height: '50%',
	width: '100%',
	layout: 'horizontal',
});
   	
var viewTopSegs = new Array(3);
   	
for (var i=0;i<3;i++){
   		viewTopSegs[i] = Ti.UI.createView({
   		});
   		
   		viewTopSection.add(viewTopSegs[i]);
}
  
viewTopSegs[0].setWidth('65%');
viewTopSegs[1].setWidth('20%');
viewTopSegs[2].setWidth('15%');
   	
viewTopSegs[0].add(UstopNameLabel);
viewTopSegs[1].add(distanceLabel);
viewTopSegs[2].add(settingsButton);
	
var viewBottomSection = Ti.UI.createView({
		height: '50%',
		width: '100%',
		layout: 'horizontal',
   	});
   	
   	
var viewBottomSegs = new Array(4);
var stopTimingLabels = new Array(4); 
	
for (var i=0; i<4; i++){
	viewBottomSegs[i] = Ti.UI.createView({
		width: '25%'
	});

	stopTimingLabels[i] = Ti.UI.createLabel({
		font: { fontSize:30 },
		text: '---',//timeConversion(times[i]),
		width: Ti.UI.SIZE,
		height: Ti.UI.SIZE,
		textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
	});
	
	viewBottomSegs[i].add(stopTimingLabels[i]);
	viewBottomSection.add(viewBottomSegs[i]);
}

selectedStopView.add(viewTopSection);
selectedStopView.add(viewBottomSection);
	
stopTimingLabels[0].setColor('#7084ff');
stopTimingLabels[1].setColor('#36c636');
stopTimingLabels[2].setColor('#ff6600');
stopTimingLabels[3].setColor('#ffd119');
	
	
for (var i=0;i<4;i++){
	selectedStopView.add(stopTimingLabels[i]);
}


//===================================================================
//-------------------------------------------------------------------
//===================================================================


var webviewContainer = Ti.UI.createView({
	height: '55%',
});

var localWebview = Titanium.UI.createWebView({
	url:'map.html',
    backgroundColor:'#373737',
    touchEnabled:true,
});

var bottomMenu = Ti.UI.createView({
    backgroundColor: '#323031',
    //backgroundImage: 'GeneralUI/selectedStopBackground.png',
	backgroundGradient: {
		type:'linear',
		colors:[{color:'#3b3b3b', position:0.0},{color:'#1e1e1e', position: 1.0}]
	},
});

var bottomMenuView = Ti.UI.createView({
	layout: 'horizontal',
});

var routeEstTable = Ti.UI.createTableView({
  	minRowHeight: 50,
  	maxRowHeight: 50,
  	data: nearestArray,
	scrollable: true,
	color: '#ffffff',
	separatorColor: '#838383',
	showVerticalScrollIndicator: true,
	//softKeyboardOnFocus: Titanium.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS,
});

var zoomButtonView = Ti.UI.createView({
	left: 5,
	width: '15%',
	height: Ti.UI.SIZE,
	top: '65%',
	layout: 'vertical',
});

var zoomInButton = Ti.UI.createButton({
	title: '+',
	font:{fontSize:25},
	width: '100%',
	height: '50%'
});

var zoomOutButton = Ti.UI.createButton({
	title: '-',
	font:{fontSize:25},
	width: '100%',
	height: '50%'
});

zoomButtonView.add(zoomInButton);
zoomButtonView.add(zoomOutButton);

bottomMenu.add(bottomMenuView);
bottomMenu.add(routeEstTable);

webviewContainer.add(localWebview);
webviewContainer.add(zoomButtonView);


var activityIndicator = Ti.UI.createActivityIndicator({
	color: 'blue',
	message: 'Loading...',
	top: '45%',
	height: Ti.UI.SIZE,
	weight: Ti.UI.SIZE,
	visible: true
});



win.add(selectedStopView);
win.add(webviewContainer);
win.add(bottomMenu);
win.open();

//Hide elements temporarily for load indicator

zoomButtonView.visible = false;
selectedStopView.visible = false;
bottomMenu.visible = false;
localWebview.visible = false;

webviewContainer.add(activityIndicator);

//Show elements when done loading
Ti.App.addEventListener('doneLoading', function(e){
	Ti.API.info("recieved doneLoading event");

	activityIndicator.visible = false;
	webviewContainer.remove(activityIndicator);
	zoomButtonView.visible = true;
	selectedStopView.visible = true;
	bottomMenu.visible = true;
	localWebview.visible = true;

	initialLaunch = false;
	
	e.source.removeEventListener('doneLoading', arguments.callee);
	
});



//Make sure map.html is loaded into the window before beginning the chain
localWebview.addEventListener('load',function(e){
	setStops();
});



//===================================================================
//-------------------------------------------------------------------
//===================================================================
Ti.App.addEventListener('settingsChanged', function(e){
	settingsWin = null;
	var propsChanged = e.data;
	for(var i = 0, len = propsChanged.length; i < len; i++){
		if(propsChanged[i] != -1){
			switch(i){
				case 0:
					props[0] = propsChanged[0];
					Ti.App.fireEvent('abox', {data: [propsChanged[0]]});
					break;
				case 1:
					props[1] = propsChanged[1];
					Ti.App.fireEvent('bbox', {data: [propsChanged[1]]});
					break;
				case 2:
					props[2] = propsChanged[2];
					Ti.App.fireEvent('cbox', {data: [propsChanged[2]]});
					break;
				case 3:
					
					break;
				case 4:
					props[4] = propsChanged[4];
					break;
				case 5:
					props[5] = propsChanged[5];
			}
		}
	}
});

settingsButton.addEventListener('click', function(e){

	settings = require('settings');
	/*settingsWin = settings.createSettingsWin(props);
	if(settings == null)
		settings = require('settings');
	Ti.API.info("Sending props : " + props.toString());
	settingsWin = settings.createSettingsWin(props);

	Ti.API.info(settingsWin);
	settingsWin.open();
	*/
	
	settings.createSettingsWin(props);
});

zoomInButton.addEventListener('click',function(e)
{
	Ti.App.fireEvent("zoomMap", {data: [true]});
});

zoomOutButton.addEventListener('click',function(e)
{
	Ti.App.fireEvent("zoomMap", {data: [false]});
});


win.addEventListener('android:back',function(e) {
});


function setWebViewListener(){
	Ti.API.info("Starting webviewlistener");
	
	//Event listener to start when webview loads
	var lastGPS;
//	localWebview.addEventListener('load',function(){
	
		
		var gpsCounter = getGPSInterval, nearestCounter = 0;
		var stops = [];
		//Start the create map event
		
		if(props[4]){
			Ti.API.info("initialSetWebView: Props[4] : " + props[4] + ", and deviceGPSOn : " + deviceGPSOn);
			getUserGPS();
			if(deviceGPSOn){
				diffArray = findNearest(userGPS);
			}	
		}
		
		if (stopsArray.length > 0)
			updateSelected(stopsArray[0]);
		else 
			updateSelected(["No selection", 0,0,0,0,0,0]);
		
		Ti.App.fireEvent("startmap", {data: [stops, userGPS]});
		
		
		//Request the shuttle data, and start the update event, repeats every 5 seconds
		setInterval(function() {
			Ti.API.info("--Interval Function--");
			shuttleLocRequest();
			updateRouteEstimates();
			
			if(props[4]){ 
				Ti.API.info("SetInterval: Props[4] : " + props[4] + ", and deviceGPSOn : " + deviceGPSOn);
				if(deviceGPSOn){
					if(gpsCounter == getGPSInterval){
						lastGPS = userGPS;
						userGPS.length = 0;
						getUserGPS();
						
						if(lastGPS[0] == userGPS[0] && lastGPS[1] == userGPS[1]){
							Ti.API.info("getUserGPS returned same data as last. Skipping findNearest");
							updateTable(diffArray);
						} else {
							Ti.API.info("Got diff array: " + diffArray.toString() + "starting updateTable...");
							diffArray = findNearest(userGPS);
							updateTable(diffArray);
						}
						gpsCounter = 0;
						
					} else {
						gpsCounter++;
					}
				} else {
					updateTable(-1);
				}
			} else {
				Ti.API.info("Device GPS off");
				updateTable(-1);
			}


			Ti.App.fireEvent("updatemap", {data: [shuttleData]});
			
			for(var i = 0; i < stopsArray.length; i++){
				if (stopsArray[0] == UstopNameLabel.getText()){
					updateSelectedTimes(stopsArray[i][3],stopsArray[i][4],stopsArray[i][5],stopsArray[i][6]);
				}
			}
		}, updateInterval);
		
	
//	});	
	
	Ti.API.info("end of webview listener function");
}


function setTableClickListener(){
	Ti.API.info("Starting settableclicklistener");

	
	routeEstTable.addEventListener('click', function(e){
		if(e.source == '[object Button]'){
			//e.row.backgroundColor = '#42a6ca';
			var childViews = e.row.getChildren();
			childViews = childViews[0].getChildren();
			childViews = childViews[0].getChildren();
			childViews[0].color = '#FFA94C';
			childViews[1].color = '#FFA94C';
			//e.row.backgroundColor = '#337a94';
			e.source.backgroundImage = 'GeneralUI/stopSelectButton3.png';
			setTimeout(function() {
        		childViews[0].color = '#FFFFFF';
				childViews[1].color = '#C0C0C0';
        		//e.row.backgroundColor = "transparent";
        		e.source.backgroundImage = 'GeneralUI/stopSelectButton.png';
    		}, 1200);
			var stopsArray = e.row.stopsArray;

			Ti.API.info(stopsArray);
			
			
			var distance = e.row.distance;
			updateSelected(stopsArray);//Does this include seconds to stop for each shuttle?

			Ti.App.fireEvent("centerMap", {latitude: stopsArray[1], longitude: stopsArray[2]});
			Ti.API.info("StopsArray[0] = " + stopsArray[6] + ", and distance: " + distance);
			//UstopNameLabel.text = stopsArray[0];
		}
	});
	
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Updates selected stop text
function updateSelected(stop){	
	
	UstopNameLabel.setText(stop[0]);
	//distanceLabel.setText()
	
	Ti.API.info(stop[3]+''+stop[4]+''+stop[5]);
	
	updateSelectedTimes(stop[3], stop[4], stop[5], stop[6]);
	
	
	
}

//Takes in 4 times, updates label
//Should be called when selectedStop is changed, and when new data is pulled
function updateSelectedTimes(t0, t1, t2, t3){
	Ti.API.info("TimeA:"+ t0);
	var times = new Array(4);
	times[0] = t0;
	times[1] = t1;
	times[2] = t2;
	times[3] = t3;
	
	//change this back to 4 iterations after stopsArray modified to include 4th ETA
	for (var i=0;i<3;i++){
		if (times[i] > 0 && times[i] != null){
			stopTimingLabels[i].setText(timeConversion(times[i]));
		}
		else 
			stopTimingLabels[i].setText('---');
	}
	
}


//Converts seconds to a minute:second string
function timeConversion(time){
	var timeOutput;
	var min = Math.floor(time / 60);
	var sec = time%60;

	if (sec < 10)
		timeOutput = min+':0'+sec;
	else
		timeOutput = min+':'+sec;
	
	return timeOutput;
}


//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Organize table based on proximity to user
function findNearest(userLocation){
	diffArray = [];
	
	//Calculate differences between stops and UserGPS
	for(var i = 0; i < stopsArray.length; i++){
		var tmpStop = stopsArray[i];
		var latitude = tmpStop[1];
		var longitude = tmpStop[2];
		var diff = getDistanceFromLatLon(userLocation[0],userLocation[1],latitude,longitude);
		diffArray.push([diff, i]);
	}
	
	//Sort the new array by distance, with [0] being the smallest
	diffArray.sort(function(a,b){
		return a[0] - b[0];
	});
	return diffArray;
}
	
function updateTable(diffArray){
	nearestArray = [];
	
	if(diffArray == -1){
		//User GPS disabeled
		for(var j = 0, len = stopsArray.length; j < len; j++){
			var tableRow = Ti.UI.createTableViewRow({
				className: 'Stops',
				layout: 'horizontal',
			});
			tableRow.stopsArray = stopsArray[j];
			tableRow.distance = -1;
			var rowView = Ti.UI.createView({
				width: Ti.UI.SIZE,
				height: Ti.UI.SIZE,
				layout: 'horizontal',
			});
			var rowViewSeg1 = Ti.UI.createView({
				width: '80%',
				height: Ti.UI.SIZE,
				top: 0,
			});
			var rowViewSeg2 = Ti.UI.createView({
				width: '20%',
				//height: Ti.UI.SIZE,
				//top: 0,
			});
			
		   	var stopNameLabel = Ti.UI.createLabel({
				font: { fontSize:18 },
				text: stopsArray[j][0],
				color: '#FFFFFF',
				//left: 15,
				//top: 10,
			});
		    var distanceLabel = Ti.UI.createLabel({
				//color: '#C0C0C0',
				//right: 0,
			});
			
			var selectButton = Ti.UI.createButton({
	   			backgroundImage:'GeneralUI/stopSelectButton.png',
	   			width: '50',
	   			height:'50',
	   			right: 0,
	   			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
	   		});
	   	
	   		rowViewSeg1.add(stopNameLabel);
	   		rowViewSeg1.add(distanceLabel);
	   		rowViewSeg2.add(selectButton);
	   		
	   		rowView.add(rowViewSeg1);
	   		rowView.add(rowViewSeg2);
	   		
	   		tableRow.add(rowView);
	   		nearestArray.push(tableRow);			
		}
		
	} else {
		for(var j = 0; j < diffArray.length; j++){
			var index = diffArray[j][1], distance = diffArray[j][0];
		   	
			var tableRow = Ti.UI.createTableViewRow({
				className: 'Stops',
				layout: 'horizontal',
			});
		   	tableRow.stopsArray = stopsArray[index];
			tableRow.distance = distance;
		 
			
			var rowView = Ti.UI.createView({
				width: Ti.UI.SIZE,
				height: Ti.UI.SIZE,
				layout: 'horizontal',
			});
			var rowViewSeg1 = Ti.UI.createView({
				width: '80%',
				height: Ti.UI.SIZE,
				top: 0,
			});
			var rowViewSeg2 = Ti.UI.createView({
				width: '20%',
				//height: Ti.UI.SIZE,
				//top: 0,
			});
			
		   	var stopNameLabel = Ti.UI.createLabel({
				font: { fontSize:18 },
				text: stopsArray[index][0],
				color: '#FFFFFF',
				left: 15,
				top: 10,
			});
			
			var distanceLabel = Ti.UI.createLabel({
				font: { fontSize:16 },
				text: distance.toFixed(2.2) + " mi",
				color: '#C0C0C0',
				right: 0,
				top: 10,
			});
			
			if(props[5] == 'true'){
				distanceLabel.text = distance.toFixed(2.2) + " mi";
			} else {
				distanceLabel.text = distance.toFixed(2.2) + " km";
			}
			var selectButton = Ti.UI.createButton({
	   			backgroundImage:'GeneralUI/stopSelectButton.png',
	   			width: '50',
	   			height:'50',
	   			right: 10,
	   			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
	   		});
	   		
			
	   		rowViewSeg1.add(stopNameLabel);
	   		rowViewSeg1.add(distanceLabel);
	   		rowViewSeg2.add(selectButton);
	   		
	   		rowView.add(rowViewSeg1);
	   		rowView.add(rowViewSeg2);
	   		
	   		tableRow.add(rowView);
	   		nearestArray.push(tableRow);
		}
	}
	
	routeEstTable.setData(nearestArray);

	Ti.API.info("Set Table in updateTable");
	
	if(initialLaunch){
		Ti.API.info("firing doneloading event 1");
		Ti.App.fireEvent('doneLoading');
		
		Ti.API.info("firing doneloading event 2 TEST");
			Ti.App.fireEvent('doneLoading');
		
	}

}


//====================================================================================================================================
//------------------------------------------------------------------------------------------------------------------------------------
//====================================================================================================================================


//====================================================================================================================================
//------------------------------------------------------------------------------------------------------------------------------------
//====================================================================================================================================

//Set stopsArray
function setStops(){
	shuttleLocRequest();

	var xhr = Ti.Network.createHTTPClient({
		onload: function() {
			Ti.API.info("got to onload in setstops");
			var routeNames = new Array(3);
			var routesArray = [];
			var id = 0;
			
			//Retrieve initial route info
			var routes = JSON.parse(this.responseText);
			var routeArray = [], landmarkArray = [], route, data;
			for(var i = 0; i < routes.length; i++){
				route = routes[i];
				routeArray = [];
				
				routeNames[i] = route.Description;

		
				for (var j = 0; j < route.Landmarks.length; j++){
					landmarkArray = [];
					data = route.Landmarks[j];
					landmarkArray.push(data.Label, data.Latitude, data.Longitude);
					routeArray.push(landmarkArray);
				}
				routesArray.push(routeArray);
			}
			Ti.API.info("ROUTES Names: " + routeNames);
	
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
			/* ----------------ARRAY INFO-----------------------
			 * stopsArray STRUCTURE
			 * 		[Stop Name, Latitude, Longitude, SouthCentralBusFlag, NorthCentralBusFlag, ExpressBusFlag]
			 * 	
			 * 		Example
			 * 			[LaSells Stewart Center,44.55901,-123.27962,1,0,1]		*/
			
			Ti.API.info("LOADED HTTP");
	
			
			updateRouteEstimates();


			setWebViewListener();
			setTableClickListener();


		}
	});
	xhr.open("GET", url2);
	xhr.send();
	
	
}
function updateRouteEstimates(){
	var xhr = Ti.Network.createHTTPClient({
		onload: function() {
			var shuttles = JSON.parse(this.responseText);
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
	xhr.open("GET", url);
	xhr.send();
}
function shuttleLocRequest(){
	var xhr = Ti.Network.createHTTPClient({
		onload: function() {
			shuttleData = [];
			shuttleTmpData = [];
			shuttleLocs = JSON.parse(this.responseText);
			
			if(shuttleLocs.length == 0){
				Ti.API.info("No shuttles active...");
			}

			for (var x = 0; x < shuttleLocs.length; x++){
				shuttleTmpData.push(shuttleLocs[x].RouteID);
				shuttleTmpData.push(shuttleLocs[x].Latitude);
				shuttleTmpData.push(shuttleLocs[x].Longitude);
				shuttleTmpData.push(shuttleLocs[x].Heading);
				shuttleData.push(shuttleTmpData);
			}
		},
		onerror : function(e) {
     		Ti.API.info("ShuttleLocRequest function failed.");
     	}
	});
	xhr.open("GET", url3);
	xhr.send();
}
function getUserGPS(){
	Titanium.Geolocation.getCurrentPosition(function(e)
		{
			if (!e.success || e.error)
			{
				Ti.API.info("Failed to get UserGPS, error: " + e);
				deviceGPSOn = false;
				return;
			}
			else{
				userGPS[0] = e.coords.latitude;
				userGPS[1] = e.coords.longitude;
				userGPS[2] = e.coords.timestamp;
				deviceGPSOn = true;
				Ti.API.info("Got userGPS. Lat: " + e.coords.latitude + ", Long: " + e.coords.longitude + ", at " + e.coords.timestamp);
			}
		});
}

function initProperties(){
	var tmp = Ti.App.Properties.getString('showExpress', [true]);
	props.push(tmp);
	tmp = Ti.App.Properties.getString('showSouthCentral', [true]);
	props.push(tmp);
	tmp = Ti.App.Properties.getString('showNorthCentral', [true]);
	props.push(tmp);
	tmp = Ti.App.Properties.getString('showCentralCampus', [true]);
	props.push(tmp);
	tmp = Ti.App.Properties.getString('gpsEnabled', [true]);
	props.push(tmp);
	tmp = Ti.App.Properties.getString('unitMi', [true]);
	props.push(tmp);
}

function getDistanceFromLatLon(lat1,lon1,lat2,lon2) {
  var miConversion = 0.621371;
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  if(props[5]){
 	var d = R * c * miConversion; // Distance in km
  } else {
  	var d = R * c;
  }
  return d;
}


function deg2rad(deg) {
  return deg * (Math.PI/180);
}
