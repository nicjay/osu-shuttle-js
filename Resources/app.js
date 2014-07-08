//Campus Shuttle Tracking 

//NOTE: OFFICAL ROAD-LIKE COMMENT BLOCK
//===================================================================
//-------------------------------------------------------------------
//===================================================================
// Gradients : [TopMenu, BottomMenu]
var color1 = [['#113a7c', '#082b62'],['#006151', '#00463B']];
var color2 = [['#011431', '#000917'],['#002f27', '#001612']];
var color3 = [['#3b3b3b','#1e1e1e'],['#1e1e1e','#5e2e0d']];
var color4 = [['#1e1e1e','#5e2e0d'],['#3b3b3b','#1e1e1e']];
var color5 = [['#1e1e1e','#5e2e0d'],['#5e2e0d','#1e1e1e']];

var color6 = [['#3b3b3b','#1e1e1e'],['#3b3b3b','#1e1e1e']];//++

var color = color6;
//Ti.API.info("COLOR : " + color[0][0]);

if (Titanium.Network.networkType === Titanium.Network.NETWORK_NONE) {
   Titanium.API.info(' no connection ');
   alert('No network connection.\nPlease close and restart App.');
} else {
   Titanium.API.info(' connection present ');
}	


var props = [];
initProperties();


Titanium.UI.setBackgroundImage('#fff');
Ti.UI.Android.hideSoftKeyboard();
Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

//url[0]:updateRouteEstimates , url[1]:setStops , url[2]:shuttleLocRequest
var url = ["http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates", 
	"http://www.osushuttles.com/Services/JSONPRelay.svc/GetRoutesForMapWithSchedule","http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapVehiclePoints"];

//var userGPS = [44.565, -123.277];
var userGPS = [], lastGPS = [];
var deviceGPSOn = false, gpsOffPhrase = "GPS: Off", gpsOnPhrase = "GPS: On";

var firstTime = true, firstIntervalUpdate = true, initialLaunch = true;
var fullMapViewOn = true;
var baseTime;

var settings;
var fullMapViewBool = false;


//Array of nearest stops
var stopsArray = [], diffArray = [], shuttleLocs;

var lastClickedChildren, lastClickedStopName;

//Number of milliseconds between update calls
var updateInterval = 4000;
//Number of update cycles between getting GPS     4 * 4 = 16 seconds
var getGPSInterval = 4;
var gpsCounter = getGPSInterval;

//Create main window
var win = Ti.UI.createWindow({
    //backgroundImage: 'GeneralUI/blurBackground.9.png',
    backgroundColor:'#000000',
    navBarHidden:true,
    //windowSoftInputMode: Titanium.UI.Android.SOFT_INPUT_STATE_ALWAYS_HIDDEN,
    layout: 'vertical',
    orientationModes: [Titanium.UI.PORTRAIT],
    windowSoftInputMode: Titanium.UI.Android.SOFT_INPUT_STATE_ALWAYS_HIDDEN,
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
	height: '17%',
	width: '100%',
	opacity: .9,
	top: 0,
	//left: 5,
	//right: 5,
	layout: 'vertical',	
});

var UstopNameLabel = Ti.UI.createLabel({
	minimumFontSize: '12sp',
	font: { fontSize:'22sp' },
	text: '',
	color: '#FFFFFF',
	left: 10,
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
   	
viewTopSeg1 = Ti.UI.createView({
	width: '85%',
});

viewTopSeg2 = Ti.UI.createView({
	width: '15%',
});
   	
viewTopSeg1.add(UstopNameLabel);
viewTopSeg2.add(settingsButton);
viewTopSection.add(viewTopSeg1);
viewTopSection.add(viewTopSeg2);
	
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
		font: { fontSize:'30sp' },
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
	height: '100%',
});

var localWebview = Titanium.UI.createWebView({
	url:'map.html',
    backgroundColor:'#373737',
    touchEnabled:true,
    //height: '100%',
    //width: '20%',
    //contentWidth: '20%',
    //contentHeight: Ti.UI.FILL,
});

var bottomMenu = Ti.UI.createView({
	layout: 'vertical',
	height: '25%',
	width: '100%',
	//left: 5,
	bottom: 0,
	//right: 5,
	borderColor: '#000000',
	borderWidth: '2',
	opacity: .9,
	backgroundGradient: {
		type:'linear',
		colors:[{color:color[1][0], position:0.0},{color:color[1][1], position: 1.0}]
	},
});

var bottomMenuSlide = Ti.UI.createButton({
	opacity: .9,
	width: '100%',
	height: '5%',
	bottom: '25%',
	backgroundImage: 'GeneralUI/slideBar.png'
});

var routeEstTable = Ti.UI.createTableView({
  	minRowHeight: 50,
  	maxRowHeight: 50,
  	data: [],
	scrollable: true,
	color: '#ffffff',
	separatorColor: '#838383',
	showVerticalScrollIndicator: true,
});


bottomMenu.add(routeEstTable);

var customFont = 'icomoon';

var zoomButtonView = Ti.UI.createView({
	layout: 'vertical',
	opacity: .9,
	left: 5,
	bottom: '27%',
	width: 60,//'13%',
	height: 120,//'26%',
	//height: '10%',
	//top: '65%',
});

zoomButtonView.add(Ti.UI.createButton({
	//color: '#d66518',
	//color: '#1e1e1e',
	//backgroundColor: 'transparent',
	font:{fontSize: '30sp', fontFamily: customFont},
	title: '+',
	//width: '100%',
	height: '50%'
}));

zoomButtonView.add(Ti.UI.createButton({
	//color: '#d66518',
	//color: '#1e1e1e',
	//backgroundColor: 'transparent',
	font:{fontSize: '30sp', fontFamily: customFont},
	title: '-',
	//font:{fontSize:25},
	//width: '100%',
	height: '50%'
}));

webviewContainer.add(localWebview);
webviewContainer.add(bottomMenuSlide);
webviewContainer.add(zoomButtonView);

var locateUserView = Ti.UI.createView({
	opacity: .9,
	//right: 5,
	width: 60,
	height: 60,
	//height: Ti.UI.SIZE,
	bottom: '27%',
	right: 5,
});

var locateUserButton = Ti.UI.createButton({
	//backgroundColor: 'transparent',
	//color: '#1e1e1e',
	//color: '#d66518',
	font:{fontSize: '30sp', fontFamily: customFont},
	title: '=',
	height: '100%',
});

locateUserView.add(locateUserButton);
webviewContainer.add(locateUserView);

var activityIndicator = Ti.UI.createActivityIndicator({
	color: '#FFFFFF',
	font: {fontSize: '22sp'},
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

webviewContainer.add(selectedStopView);
webviewContainer.add(bottomMenu);
//win.add(selectedStopView);
win.add(webviewContainer);
//win.add(localWebview);
//win.add(bottomMenu);
win.open();

var activity = Titanium.Android.currentActivity;
info("DIS IS ACTIVITY: " + activity);
activity.finish();

//Hide elements temporarily for load indicator
zoomButtonView.visible = selectedStopView.visible = bottomMenu.visible = localWebview.visible = locateUserView.visible = false;

/*zoomButtonView.visible = false;
selectedStopView.visible = false;
bottomMenu.visible = false;
localWebview.visible = false;*/

webviewContainer.add(activityIndicator);
webviewContainer.add(loadBar);
loadBar.show();

//Show elements when done loading
Ti.App.addEventListener('doneLoading', doneLoading);

setStops();

//===================================================================
//-------------------------------------------------------------------
//===================================================================

Ti.App.addEventListener('settingsChanged', function(e){
	info("eventListener : settingsChanged");
	var propsChanged = e.data;
	for(var i = 0, len = propsChanged.length; i < len; i++){
		if(propsChanged[i] != -1){
			switch(i){
				case 0:
					props[0] = propsChanged[0];
					Ti.App.fireEvent('updatemap', {id: 6, routeBool: propsChanged[0]});
					break;
				case 1:
					props[1] = propsChanged[1];
					Ti.App.fireEvent('updatemap', {id: 5, routeBool: propsChanged[1]});
					break;
				case 2:
					props[2] = propsChanged[2];
					Ti.App.fireEvent('updatemap', {id: 4, routeBool:propsChanged[2]});
					break;
				case 3:
					
					break;
				case 4:
					props[4] = propsChanged[4];
					if(props[4] == true || props[4] == "true"){
						getUserGPS();
						diffArray = findNearest(userGPS);
						Ti.API.info("This is diffArray: " + diffArray.toString());
						updateTable(diffArray);
					}else{
						userGPS = [];
						updateTable(-1);
					}
					break;
				case 5:
					props[5] = propsChanged[5];
					diffArray = findNearest(userGPS);
					updateTable(diffArray);
			}
		}
	}
});

locateUserView.addEventListener('click', function(e){
	if(props[4] == true || props[4] == "true"){
		Ti.App.fireEvent("updatemap", {id: 2, latitude: userGPS[0], longitude: userGPS[1], userBool: true});	
	}else
		alert("User GPS is currently disabeled.")
	
});

bottomMenuSlide.addEventListener('click', function(e){
	if(fullMapViewBool){
		selectedStopView.visible = bottomMenu.visible = true;
		bottomMenuSlide.bottom = '25%',
		zoomButtonView.bottom = locateUserView.bottom = '27%';

		fullMapViewBool = false;
	}else{
		selectedStopView.visible = bottomMenu.visible = false;
		bottomMenuSlide.bottom = '0%',
		zoomButtonView.bottom = locateUserView.bottom = '2%';
		fullMapViewBool = true;
	}
});

settingsButton.addEventListener('click', function(e){
	if(settings == null){
		settings = require('settings');
	}
	settings.createSettingsWin(props);
});

zoomButtonView.addEventListener('click', function(e){
	var children = zoomButtonView.getChildren();
	if(e.source == children[0]){
		Ti.App.fireEvent("updatemap", {id: 3, zoomBool: true});
	}else if(e.source == children[1]){
		Ti.App.fireEvent("updatemap", {id: 3, zoomBool: false});
	}
});


win.addEventListener('android:back',function(e) {
});

function setWebViewListener(){
	info("FUNC: setWebViewListener");
	//localWebview.addEventListener('load',function(){
	
	if(props[4] == true || props[4] == "true"){
		Ti.API.info("SHOULD NOT MAKE IT HERE");
		getUserGPS();
		Ti.App.fireEvent("updatemap", {id: 0, userGPS: userGPS, props: props});
		if(deviceGPSOn){
			diffArray = findNearest(userGPS);
			var index = diffArray[0][1];
			updateSelected(stopsArray[index]);
			lastClickedStopName = stopsArray[index][0];
		}else{
			updateSelected(stopsArray[0]);
			lastClickedStopName = stopsArray[0][0];
		}	
	}else {
		Ti.App.fireEvent("updatemap", {id: 0, userGPS: userGPS, props: props});
		updateSelected(stopsArray[0]);
		lastClickedStopName = stopsArray[0][0];
	}
	
	setTimeout(function(){
		intervalUpdate();
		setInterval(intervalUpdate, updateInterval);
	}, 1000);
}

function intervalUpdate(){
	info("FUNC: intervalUpdate");
	var shuttleData = shuttleLocRequest();
	updateRouteEstimates();
	
	//info("GPS COUNTER: " + gpsCounter);
	if(gpsCounter >= getGPSInterval){ //if(gpsEnabled)
		if(props[4] == true || props[4] == "true"){
			Ti.API.info("XXXXXXXXXXXXXXX Props[4] : " + props[4]);
			getUserGPS();
			if(deviceGPSOn){
				if(lastGPS[0] == userGPS[0] && lastGPS[1] == userGPS[1]){
					//Ti.API.info("getUserGPS returned same data as last. Skipping findNearest");
					if(firstIntervalUpdate){
						updateTable(diffArray);
						firstIntervalUpdate = false;
					}
				} else {
					//Ti.API.info("Got diff array: " + diffArray.toString() + "starting updateTable...");
					diffArray = findNearest(userGPS);
					updateTable(diffArray);
				}	
			}else{
				updateTable(-1);
			}
		} else {
			updateTable(-1);
		}
		gpsCounter = 0;
	}else{
		gpsCounter++;
	}
	
	Ti.App.fireEvent("updatemap", {id: 1, shuttleData: shuttleData, userGPS: userGPS});
	
	for(var i = 0, len = stopsArray.length; i < len; i++){
		if (stopsArray[i] == UstopNameLabel.getText()){
			updateSelectedTimes(stopsArray[i][3],stopsArray[i][4],stopsArray[i][5],stopsArray[i][6]);
		}
	}
}

function setTableClickListener(){
	info("FUNC: setTableClickListener");
	routeEstTable.addEventListener('click', function(e){
		Ti.API.info("Clicked! Source : " + e.source);
		
		if(/*e.source == '[object Button]'*/1){
			if(lastClickedStopName != null){
				lastClickedChildren[0].color = '#FFEEDB';
				lastClickedChildren[1].color = '#C0C0C0';
			}
			var childViews = e.row.getChildren();
			//var button = childViews[1].getChildren();
			childViews = childViews[0].getChildren();
			
			//Ti.API.info("This is button :" + button + ", and this is button[0] : " + button[0]);
			
			childViews[0].color = '#FFA94C';
			childViews[1].color = '#FFA94C';
			
			var stopsRow = e.row.stopsArray, distance = e.row.distance;
			updateSelected(stopsRow);

			lastClickedChildren = childViews;
			lastClickedStopName = stopsRow[0];

			Ti.App.fireEvent("updatemap", {id: 2, latitude: stopsRow[1], longitude: stopsRow[2], userBool: false});
		}
	});
	Ti.API.info("setTableClick");
	if(loadBar != null){
		loadBar.setValue(loadBar.getValue()+1);
		info("tableClick loadBar val: " + loadBar.getValue());
		if (loadBar.getValue() == loadBar.getMax()){
			Ti.App.fireevent("doneLoading");	
		}
	}
	//Ti.API.info("Load tblClick: " + loadBar.getValue());
	info("END setTableClickListener");
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Updates selected stop text
function updateSelected(stop){	
	info("FUNC: updateSelected");
	UstopNameLabel.setText(stop[0]);
	//distanceLabel.setText()
	updateSelectedTimes(stop[3], stop[4], stop[5], stop[6]);
}

//Takes in 4 times, updates label
//Should be called when selectedStop is changed, and when new data is pulled
function updateSelectedTimes(t0, t1, t2, t3){
	info("FUNC: updateSelectedTimes");
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
	info("FUNC: timeConversion");
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
	info("FUNC: findNearest");
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
	info("FUNC: updateTable");
	var nearestArray = [];
	var selectedRowScheme = ['#FFA94C', '#FFA94C'];
	var normalRowScheme = ['#FFEEDB', '#C0C0C0'];
	var currentScheme;
	
	if(diffArray == -1){
		//User GPS disabeled
		for(var j = 0, len = stopsArray.length; j < len; j++){
			if(lastClickedStopName == stopsArray[j][0]){
				currentScheme = selectedRowScheme;
			} else{
				currentScheme = normalRowScheme;
			}
			var tableRow = Ti.UI.createTableViewRow({
				className: 'Stops',
				layout: 'horizontal',
			});
			tableRow.stopsArray = stopsArray[j];
			tableRow.distance = -1;
			
			var rowView = Ti.UI.createView({
				width: '100%',
			});
			
		   	var stopNameLabel = Ti.UI.createLabel({
				font: { fontSize:'20sp' },
				text: stopsArray[j][0],
				color: currentScheme[0],
				left: 15,
				//top: 10,
			});
	   		
			var distanceLabel = Ti.UI.createLabel({
			});
			
	   		rowView.add(stopNameLabel);
	   		rowView.add(distanceLabel);
	   		
	   		tableRow.add(rowView);
	   		nearestArray.push(tableRow);
	   		
	   		if(lastClickedStopName == stopsArray[j][0]){
	   			var childViews = tableRow.getChildren();
				childViews = childViews[0].getChildren();
				lastClickedChildren = childViews;
	   		}		
		}
		
	} else {
		for(var j = 0, len = diffArray.length; j < len; j++){
			var index = diffArray[j][1], distance = diffArray[j][0];
			if(lastClickedStopName == stopsArray[j][0]){
				currentScheme = selectedRowScheme;
			}else{
				currentScheme = normalRowScheme;
			}
			var tableRow = Ti.UI.createTableViewRow({
				className: 'Stops',
				layout: 'horizontal',
				backgroundSelectedColor: '#FFFFFF',
			});
		   	tableRow.stopsArray = stopsArray[index];
			tableRow.distance = distance;
		 
			var rowView = Ti.UI.createView({
				width: '100%',
			});
			
		   	var stopNameLabel = Ti.UI.createLabel({
				font: { fontSize:'20sp' },
				text: stopsArray[index][0],
				color: currentScheme[0],
				left: 15,
				top: 10,
			});
			if(props[5] == 'false' || !props[5]){
				var distanceLabel = Ti.UI.createLabel({
					font: { fontSize:'18sp' },
					text: distance.toFixed(2.2) + " km",
					color: currentScheme[1],
					right: 10,
					top: 10,
				});
			} else {
				var distanceLabel = Ti.UI.createLabel({
					font: { fontSize:'18sp' },
					text: distance.toFixed(2.2) + " mi",
					color: currentScheme[1],
					right: 10,
					top: 10,
				});
			}
			
	   		rowView.add(stopNameLabel);
	   		rowView.add(distanceLabel);
	   		
	   		tableRow.add(rowView);
	   		nearestArray.push(tableRow);
	   		
	   		if(lastClickedStopName == stopsArray[j][0]){
	   			var childViews = tableRow.getChildren();
				childViews = childViews[0].getChildren();
				lastClickedChildren = childViews;
	   		}
		}
	}
	
	
	
	//Ti.API.info("Load updateTbl : " + loadBar.getValue());
	//Ti.API.info("updateTable");
	routeEstTable.setData(nearestArray);

	//Ti.API.info("Set Table in updateTable");
	
	if(initialLaunch){	
		if(loadBar != null){
			loadBar.setValue(loadBar.getValue()+1);
			info("2 loadBar val: " + loadBar.getValue());
			if (loadBar.getValue() == 4){
				Ti.App.fireEvent('doneLoading');	
			}
		}
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
	info("FUNC: setStops");
	if(loadBar != null){
		loadBar.setValue(loadBar.getValue()+1);
		info("4 loadBar val: " + loadBar.getValue());
	}
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
			

							

			//Ti.API.info("Load setStops: " + loadBar.getValue());
			//Ti.API.info("setStops");
			//stopTimer();
			
			updateRouteEstimates();
			
			localWebview.addEventListener('load',function(e){
				info("localWebview.addEvent(load)");
				setWebViewListener();
				setTableClickListener();
			});

		}
	});
	xhr.open("GET", url[1]);
	xhr.send();
	
	
}
function updateRouteEstimates(){
	info("FUNC: updateRouteEstimates");
	//Ti.API.info("FUNC: updateRouteEstimates");
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
			if(loadBar != null){
				loadBar.setValue(loadBar.getValue()+1);
				info("3 loadBar val: " + loadBar.getValue());
				if (loadBar.getValue() == 4){
					Ti.App.fireEvent('doneLoading');	
				}
			}

		},
		onerror: function(e){
			Ti.API.info("ERROR updateRouteEstimates(): "+e.toString());
		},
		timeout : 3000
	});
	xhr.open("GET", url[0]);
	xhr.send();
}
function shuttleLocRequest(){
	info("FUNC: shuttleLocRequest");
	var shuttleData = [];
	var xhr = Ti.Network.createHTTPClient({
		onload: function() {
			shuttleLocs = JSON.parse(this.responseText);
			
			if(shuttleLocs.length == 0){
				//Ti.API.info("No shuttles active...");
			}

			for (var x = 0, len = shuttleLocs.length; x < len; x++){
				var loc = shuttleLocs[x];
				shuttleData.push([loc.RouteID, loc.Latitude, loc.Longitude, loc.Heading]);
			}
			return shuttleData;
		},
		onerror : function(e) {
     		Ti.API.info("ShuttleLocRequest function failed.");
     		return shuttleData;
     	}
	});
	xhr.open("GET", url[2]);
	xhr.send();
}
function doneLoading(){
	info("FUNC: doneLoading");
	initialLaunch = false;
	Ti.App.removeEventListener('doneLoading', doneLoading);
	
	
	activityIndicator.visible = false;
	webviewContainer.remove(activityIndicator);
	webviewContainer.remove(loadBar);
	activityIndicator = loadBar = null;
	
	locateUserView.visible = true;
	zoomButtonView.visible = true;
	selectedStopView.visible = true;
	bottomMenu.visible = true;
	localWebview.visible = true;

}
function getUserGPS(){
	info("FUNC: getUserGPS");
	//Ti.API.info("FUNC: getUserGPS");
	Titanium.Geolocation.getCurrentPosition(function(e)
		{
			if (!e.success || e.error)
			{
				Ti.API.info("Failed to get UserGPS, error: " + e);
				deviceGPSOn = false;
				userGPS = [];
				return;
			}
			else{
				lastGPS = userGPS;
				userGPS[0] = e.coords.latitude;
				userGPS[1] = e.coords.longitude;
				userGPS[2] = e.coords.timestamp;
				deviceGPSOn = true;
				//Ti.API.info("Got userGPS. Lat: " + e.coords.latitude + ", Long: " + e.coords.longitude + ", at " + e.coords.timestamp);
			}
		});
}


function initProperties(){
	info("FUNC: initProperties");
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


function info(msg){
	if(firstTime){
		baseTime = new Date().getTime();
		firstTime = false;
	}
	var time = new Date().getTime();
	time = time-baseTime;
	time = time/1000;
	Ti.API.info(msg + " TIME: " + time);
}

var startTime, stopTime, totalTime;
function startTimer(){
	startTime = new Date().getTime();
}
function stopTimer(){
	stopTime = new Date().getTime();
	totalTime = (stopTime-startTime)/1000;
	info("/_-/_-/_-/_-/_-/_---TotalTime: " + totalTime);
	return totalTime;
}

