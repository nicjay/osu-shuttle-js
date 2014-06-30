//Campus Shuttle Tracking 

//NOTE: OFFICAL ROAD-LIKE COMMENT BLOCK
//===================================================================
//-------------------------------------------------------------------
//===================================================================
// Gradients : [TopMenu, BottomMenu]
var color1 = [['#113a7c', '#082b62'],['#006151', '#00463B']];
var color2 = [['#011431', '#000917'],['#002f27', '#001612']];
var color = color2;
//Ti.API.info("COLOR : " + color[0][0]);

if (Titanium.Network.networkType === Titanium.Network.NETWORK_NONE) {
   Titanium.API.info(' no connection ');
   alert('no connection');
} else {
   Titanium.API.info(' connection present ');
}

var props = [];
initProperties();
//Ti.API.info("Properties init to : " + props.toString());


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

var settings;
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
		colors:[{color:color[0][0], position:0.0},{color:color[0][1], position: 1.0}]
	
		//colors:[{color:'#3b3b3b', position:0.0},{color:'#1e1e1e', position: 1.0}]
	},
	height: '15%',
	layout: 'vertical',	
});

var UstopNameLabel = Ti.UI.createLabel({
	minimumFontSize: '12sp',
	font: { fontSize:'20sp' },
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
		colors:[{color:color[1][0], position:0.0},{color:color[1][1], position: 1.0}]
		//colors:[{color:'#3b3b3b', position:0.0},{color:'#1e1e1e', position: 1.0}]
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
	message: 'Retrieving shuttle data...',
	top: '45%',
	height: Ti.UI.SIZE,
	weight: Ti.UI.SIZE,
	visible: true
});

var loadBar = Ti.UI.createProgressBar({
	top: '60%',
	min: 0,
	max: 4,
	value: 0,
	height: '10%',
	width: '80%',
	style: 3
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
webviewContainer.add(loadBar);
loadBar.show();

//Show elements when done loading
Ti.App.addEventListener('doneLoading', function(e){
	//Ti.API.info("recieved doneLoading event");
	
	activityIndicator.visible = false;
	webviewContainer.remove(activityIndicator);
	webviewContainer.remove(loadBar);
	
	zoomButtonView.visible = true;
	selectedStopView.visible = true;
	bottomMenu.visible = true;
	localWebview.visible = true;

	initialLaunch = false;
	
	e.source.removeEventListener('doneLoading', arguments.callee);
	
});

//Make sure map.html is loaded into the window before beginning the chain

setStops();
updateRouteEstimates();
setTableClickListener();
//setStops();
localWebview.addEventListener('load',function(e){
	Ti.API.info("FIRST! WEBLOAD");
	setWebViewListener();
});

//===================================================================
//-------------------------------------------------------------------
//===================================================================
Ti.App.addEventListener('settingsChanged', function(e){
	var propsChanged = e.data;
	for(var i = 0, len = propsChanged.length; i < len; i++){
		if(propsChanged[i] != -1){
			switch(i){
				case 0:
					props[0] = propsChanged[0];
					//Ti.API.info("Firing abox");
					Ti.App.fireEvent('abox', {data: [propsChanged[0]]});
					break;
				case 1:
					//Ti.API.info("Firing bbox");
					props[1] = propsChanged[1];
					Ti.App.fireEvent('bbox', {data: [propsChanged[1]]});
					break;
				case 2:
					//Ti.API.info("Firing cbox");
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
					diffArray = findNearest(userGPS);
					updateTable(diffArray);
			}
		}
	}
});

settingsButton.addEventListener('click', function(e){
	if(settings == null){
		//Ti.API.info("Settings was null... require statement now.");
		settings = require('settings');
	}
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
	Ti.API.info("FUNC: setWebViewListener");
	//localWebview.addEventListener('load',function(){
	
	if(props[4]){
		getUserGPS();
		if(deviceGPSOn){
			diffArray = findNearest(userGPS);
			var index = diffArray[0][1];
			updateSelected(stopsArray[index]);
		}	
	}else {
		updateSelected(stopsArray[0]);
	}
	
	var stops = [];
	Ti.App.fireEvent("startmap", {data: [stops, userGPS, props]});
	
	setTimeout(function(){
		intervalUpdate();
		setInterval(intervalUpdate, updateInterval);
	}, 1000);
}

function intervalUpdate(){
	Ti.API.info("FUNC: intervalUpdate");
	var gpsCounter = getGPSInterval, nearestCounter = 0, lastGPS;
	shuttleLocRequest();
	updateRouteEstimates();
	var tmp = Ti.Platform.getAvailableMemory();
	var value = tmp/1000000;
	Ti.API.info("MEMORY : " + value.toFixed(.2));
	
	if(props[4]){ 
		if(deviceGPSOn){
			if(gpsCounter == getGPSInterval){
				lastGPS = userGPS;
				userGPS.length = 0;
				getUserGPS();
				if(lastGPS[0] == userGPS[0] && lastGPS[1] == userGPS[1]){
					//Ti.API.info("getUserGPS returned same data as last. Skipping findNearest");
					updateTable(diffArray);
				} else {
					//Ti.API.info("Got diff array: " + diffArray.toString() + "starting updateTable...");
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
		//Ti.API.info("Device GPS off");
		updateTable(-1);
	}


	Ti.App.fireEvent("updatemap", {data: [shuttleData]});
	
	for(var i = 0, len = stopsArray.length; i < len; i++){
		if (stopsArray[i] == UstopNameLabel.getText()){
			updateSelectedTimes(stopsArray[i][3],stopsArray[i][4],stopsArray[i][5],stopsArray[i][6]);
		}
	}
}


function setTableClickListener(){
	//Ti.API.info("Starting settableclicklistener");
	Ti.API.info("FUNC: setTableClickListener");
	
	routeEstTable.addEventListener('click', function(e){
		if(e.source == '[object Button]'){
			//e.row.backgroundColor = '#42a6ca';
			var childViews = e.row.getChildren();
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
    		}, 800);
			var stopsArray = e.row.stopsArray;

			//Ti.API.info(stopsArray);
			
			
			var distance = e.row.distance;
			updateSelected(stopsArray);//Does this include seconds to stop for each shuttle?

			Ti.App.fireEvent("centerMap", {latitude: stopsArray[1], longitude: stopsArray[2]});
			//Ti.API.info("StopsArray[0] = " + stopsArray[6] + ", and distance: " + distance);
			//UstopNameLabel.text = stopsArray[0];
		}
	});
	Ti.API.info("setTableClick");
	loadBar.setValue(loadBar.getValue()+1);
	Ti.API.info("Load tblClick: " + loadBar.getValue());
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Updates selected stop text
function updateSelected(stop){	
	Ti.API.info("FUNC: updateSelected");
	UstopNameLabel.setText(stop[0]);
	//distanceLabel.setText()
	
	//Ti.API.info(stop[3]+''+stop[4]+''+stop[5]);
	
	updateSelectedTimes(stop[3], stop[4], stop[5], stop[6]);
	
	
	
}

//Takes in 4 times, updates label
//Should be called when selectedStop is changed, and when new data is pulled
function updateSelectedTimes(t0, t1, t2, t3){
	Ti.API.info("FUNC: updateSelectedTimes");
	//Ti.API.info("TimeA:"+ t0);
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
	Ti.API.info("FUNC: findNearest");
	diffArray = [];
	
	//Calculate differences between stops and UserGPS
	for(var i = 0, len = stopsArray.length; i < len; i++){
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
	Ti.API.info("FUNC: updateTable");
	nearestArray = [];
	loadBar.setValue(loadBar.getValue()+1);
	
	if(diffArray == -1){
		//User GPS disabeled
		for(var j = 0, len = stopsArray.length; j < len; j++){
			var tableRow = Ti.UI.createTableViewRow({
				className: 'Stops',
				layout: 'horizontal',
			});
			tableRow.stopsArray = stopsArray[j];
			tableRow.distance = -1;
			
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
				font: { fontSize:16 },
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
	   	
	   		
	   		tableRow.add(rowViewSeg1);
	   		tableRow.add(rowViewSeg2);
	   		nearestArray.push(tableRow);			
		}
		
	} else {
		for(var j = 0, len = diffArray.length; j < len; j++){
			var index = diffArray[j][1], distance = diffArray[j][0];
		   	
			var tableRow = Ti.UI.createTableViewRow({
				className: 'Stops',
				layout: 'horizontal',
				selectedBackgroundColor: '#FFFFFF',
			});
		   	tableRow.stopsArray = stopsArray[index];
			tableRow.distance = distance;
		 
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
			if(props[5] == 'false' || !props[5]){
				var distanceLabel = Ti.UI.createLabel({
					font: { fontSize:16 },
					text: distance.toFixed(2.2) + " km",
					color: '#C0C0C0',
					right: 0,
					top: 10,
				});
				
				//Ti.API.info("km set");
				//distanceLabel.setText = distance.toFixed(2.2) + " km";
				//distanceLabel.setText = "yoyo";
			} else {
				var distanceLabel = Ti.UI.createLabel({
					font: { fontSize:16 },
					text: distance.toFixed(2.2) + " mi",
					color: '#C0C0C0',
					right: 0,
					top: 10,
				});
			}
			var selectButton = Ti.UI.createButton({
	   			backgroundImage:'GeneralUI/stopSelectButton.png',
	   			width: '60',
	   			height:'60',
	   			right: 10,
	   			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
	   		});
			
	   		rowViewSeg1.add(stopNameLabel);
	   		rowViewSeg1.add(distanceLabel);
	   		rowViewSeg2.add(selectButton);
	   		
	   		tableRow.add(rowViewSeg1);
	   		tableRow.add(rowViewSeg2);
	   		nearestArray.push(tableRow);
		}
	}
	
	loadBar.setValue(loadBar.getValue()+1);
	Ti.API.info("Load updateTbl : " + loadBar.getValue());
	Ti.API.info("updateTable");
	routeEstTable.setData(nearestArray);

	//Ti.API.info("Set Table in updateTable");
	
	if(initialLaunch){
		//Ti.API.info("firing doneloading event 1");
		//Ti.App.fireEvent('doneLoading');
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
	
	Ti.API.info("FUNC: setStops");
	shuttleLocRequest();

	var xhr = Ti.Network.createHTTPClient({
		onload: function() {
			var routeNames = new Array(3);
			var routesArray = [];
			var id = 0;
			
			//Retrieve initial route info
			var routes = JSON.parse(this.responseText);
			var routeArray = [], landmarkArray = [], route, data;
			for(var i = 0, routesLen = routes.length; i < routesLen; i++){
				route = routes[i];
				routeArray = [];
				
				routeNames[i] = route.Description;

		
				for (var j = 0, landmarksLen = route.Landmarks.length; j < landmarksLen; j++){
					landmarkArray = [];
					data = route.Landmarks[j];
					landmarkArray.push(data.Label, data.Latitude, data.Longitude);
					routeArray.push(landmarkArray);
				}
				routesArray.push(routeArray);
			}
	
			//Sort and remove duplicates. Add flags for which shuttles stop at each stop.
			for(var k = 0, len = routesArray.length; k < len; k++){
				for(var l = 0, len1 = routesArray[k].length; l < len1; l++){
					var cur = routesArray[k][l];
					var skip = 0;
					
					
					for(var i = 0, len2 = stopsArray.length; i < len2; i++){
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
			
	
			loadBar.setValue(loadBar.getValue()+1);
			Ti.API.info("Load setStops: " + loadBar.getValue());
			Ti.API.info("setStops");


		}
	});
	xhr.open("GET", url2);
	xhr.send();
	
	
}
function updateRouteEstimates(){
	Ti.API.info("FUNC: updateRouteEstimates");
	var xhr = Ti.Network.createHTTPClient({
		onload: function() {
			var shuttles = JSON.parse(this.responseText);
			for(var i = 0, shuttlesLen = shuttles.length; i < shuttlesLen; i++){
				var shuttle = shuttles[i];
				for(var j = 0, stopsArrayLen = stopsArray.length; j < stopsArrayLen; j++){
					for(var k = 0, routeStopsLen = shuttle.RouteStops.length; k < routeStopsLen; k++){
						if(shuttle.RouteStops[k].Description == stopsArray[j][0]){
							stopsArray[j][i+3] = shuttle.RouteStops[k].Estimates[0].SecondsToStop;
						}
					}
				}
			}
			
		Ti.API.info("Load routeESt : " + loadBar.getValue());
		Ti.API.info("UpdateRouteEstimates");
		
		},
		onerror: function(e){
			Ti.API.info("UPDATE ROUTE EST ERROR: "+e);
		},
		timeout : 3000
	});
	xhr.open("GET", url);
	xhr.send();
}
function shuttleLocRequest(){
	Ti.API.info("FUNC: shuttleLocRequest");
	var xhr = Ti.Network.createHTTPClient({
		onload: function() {
			shuttleData = [];
			shuttleTmpData = [];
			shuttleLocs = JSON.parse(this.responseText);
			
			if(shuttleLocs.length == 0){
				//Ti.API.info("No shuttles active...");
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
	Ti.API.info("FUNC: getUserGPS");
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
				//Ti.API.info("Got userGPS. Lat: " + e.coords.latitude + ", Long: " + e.coords.longitude + ", at " + e.coords.timestamp);
			}
		});
}

function initProperties(){
	Ti.API.info("FUNC: initProperties");
	var tmp = Ti.App.Properties.getString('showExpress', true);
	props.push(tmp);
	tmp = Ti.App.Properties.getString('showSouthCentral', true);
	props.push(tmp);
	tmp = Ti.App.Properties.getString('showNorthCentral', true);
	props.push(tmp);
	tmp = Ti.App.Properties.getString('showCentralCampus', true);
	props.push(tmp);
	tmp = Ti.App.Properties.getString('gpsEnabled', true);
	props.push(tmp);
	tmp = Ti.App.Properties.getString('unitMi', true);
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
  if(props[5] == 'true' || props[5]){
 	var d = R * c * miConversion; // Distance in km
  } else {
  	var d = R * c;
  }
  return d;
}


function deg2rad(deg) {
  return deg * (Math.PI/180);
}
