//Campus Shuttle Tracking

//NOTE: OFFICAL ROAD-LIKE COMMENT BLOCK
//===================================================================
//-------------------------------------------------------------------
//===================================================================
// Gradients : [TopMenu, BottomMenu]
var color1 = [['#113a7c', '#082b62'], ['#006151', '#00463B']];
var color2 = [['#011431', '#000917'], ['#002f27', '#001612']];
var color3 = [['#3b3b3b', '#1e1e1e'], ['#1e1e1e', '#5e2e0d']];
var color4 = [['#1e1e1e', '#5e2e0d'], ['#3b3b3b', '#1e1e1e']];
var color5 = [['#1e1e1e', '#5e2e0d'], ['#5e2e0d', '#1e1e1e']];

var color6 = [['#3b3b3b', '#1e1e1e'], ['#3b3b3b', '#1e1e1e']];
var color7 = [['#3b3b3b', '#3b3b3b'], ['#3b3b3b', '#3b3b3b']];
var color8 = [['#1e1e1e', '#3b3b3b'], ['#3b3b3b', '#3b3b3b']];
var color8 = [['#2D2D2D', '#3b3b3b'], ['#2D2D2D', '#2D2D2D']];
//++

var color = color8;
//Ti.API.info("COLOR : " + color[0][0]);

// Opacity for [topMenu, zoom, locateUser, slideTab, bottomMenu]
var opacityArray = [.95, .95, .95, .95, .85];



if (Titanium.Network.networkType === Titanium.Network.NETWORK_NONE) {
	Titanium.API.info(' no connection ');
	alert('No network connection.\nPlease close and restart App.');
} else {
	Titanium.API.info(' connection present ');
}

var props = [];
initProperties();

var customFont = 'icomoon';
var normalFont = 'OpenSans-Regular';
var boldFont = 'OpenSans-Semibold';
//var normalFont = 'Roboto-Regular';
//var normalFont = 'Cantarell-Regular';

//Choices: streets | satellite | hybrid | topo | gray | oceans | national-geographic | osm
var chosenBaseMap = props[7];


Titanium.UI.setBackgroundImage('#fff');
Ti.UI.Android.hideSoftKeyboard();
Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

//url[0]:updateRouteEstimates , url[1]:setStops , url[2]:shuttleLocRequest
var url = ["http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates", "http://www.osushuttles.com/Services/JSONPRelay.svc/GetRoutesForMapWithSchedule", "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapVehiclePoints"];

//var userGPS = [44.565, -123.277];
var userGPS = [], lastGPS = [];

var firstTime = true;
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
	backgroundColor : '#000000',
	navBarHidden : true,
	//windowSoftInputMode: Titanium.UI.Android.SOFT_INPUT_STATE_ALWAYS_HIDDEN,
	layout : 'vertical',
	orientationModes : [Titanium.UI.PORTRAIT],
	windowSoftInputMode : Titanium.UI.Android.SOFT_INPUT_STATE_ALWAYS_HIDDEN,
});

//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Init everything for selectedStopView
var selectedStopView = Ti.UI.createView({
	backgroundGradient : {
		type : 'linear',
		colors : [{
			color : color[0][0],
			position : 0.0
		}, {
			color : color[0][1],
			position : 1.0
		}]

		//colors:[{color:'#3b3b3b', position:0.0},{color:'#1e1e1e', position: 1.0}]
	},
	height : '17%',
	width : '100%',
	opacity : opacityArray[0],
	top : 0,
	//left: 5,
	//right: 5,
	layout : 'vertical',
});

var UstopNameLabel = Ti.UI.createLabel({
	minimumFontSize : '12sp',
	font : {
		fontSize : '22sp', fontFamily : boldFont
	},
	text : '',
	color : '#E0E0E0',
	left : 10,
});

var distanceLabel = Ti.UI.createLabel({
	color : '#C0C0C0',
	textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
	top : 9,
	width : Ti.UI.FILL,
});

var settingsButton = Ti.UI.createButton({
	height : 36,
	width : 36,
	backgroundImage : 'GeneralUI/settingsGear.png',
	backgroundSelectedImage : 'GeneralUI/settingsGearPressed.png',

});

var viewTopSection = Ti.UI.createView({
	height : '50%',
	width : '100%',
	layout : 'horizontal',
});

var viewTopSegs = new Array(3);

viewTopSeg1 = Ti.UI.createView({
	width : '85%',
});

viewTopSeg2 = Ti.UI.createView({
	width : '15%',
});

viewTopSeg1.add(UstopNameLabel);
viewTopSeg2.add(settingsButton);
viewTopSection.add(viewTopSeg1);
viewTopSection.add(viewTopSeg2);

var viewBottomSection = Ti.UI.createView({
	height : '50%',
	width : '100%',
	layout : 'horizontal',
});

var viewBottomSegs = new Array(4);
var stopTimingLabels = new Array(4);

for (var i = 0; i < 4; i++) {
	viewBottomSegs[i] = Ti.UI.createView({
		width : '25%'
	});

	stopTimingLabels[i] = Ti.UI.createLabel({
		font : {
			fontSize : '30sp'
		},
		text : '---', //timeConversion(times[i]),
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
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

for (var i = 0; i < 4; i++) {
	selectedStopView.add(stopTimingLabels[i]);
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================

var webviewContainer = Ti.UI.createView({
	opacity: 1,
	height : '100%',
});

var containerFadeIn = Ti.UI.createAnimation({
	opacity: 1,
	duration: 500,
});

var localWebview = Titanium.UI.createWebView({
	url : 'map.html',
	backgroundColor : '#373737',
	touchEnabled : true,
	//height: '100%',
	//width: '20%',
	//contentWidth: '20%',
	//contentHeight: Ti.UI.FILL,
});

var bottomContainer = Ti.UI.createView({
	//backgroundColor: '#000',
	//opacity: .5,
	height : '50%',
	bottom: 0,
});

var bottomMenu = Ti.UI.createView({
	layout : 'vertical',
	height : '27%',
	width : '100%',
	//left: 5,
	bottom : 0,
	//right: 5,
	//borderColor : '#000000',
	//borderWidth : '1px',
	opacity : opacityArray[4],
	backgroundGradient : {
		type : 'linear',
		colors : [{
			color : color[1][0],
			position : 0.0
		}, {
			color : color[1][1],
			position : 1.0
		}]
	},
});

var bottomMenuSlide = Ti.UI.createButton({
	opacity : opacityArray[3],
	width : '100%',
	height : '5%',
	bottom : '27%',
	backgroundImage : 'GeneralUI/slideBar.png'
});

var routeEstTable = Ti.UI.createTableView({
	minRowHeight : 50,
	maxRowHeight : 50,
	data : [1, 2, 3],
	scrollable : true,
	color : '#ffffff',
	separatorColor : '#838383',
	showVerticalScrollIndicator : true,
});

bottomMenu.add(routeEstTable);

var zoomButtonView = Ti.UI.createView({
	layout : 'vertical',
	opacity : opacityArray[1],
	left : 5,
	bottom : '28%',
	//bottom: '54%',
	//top: 0,
	width : 60,
	height : 120,
});

zoomButtonView.add(Ti.UI.createButton({
	color: '#E0E0E0',
	font : {
		fontSize : '25sp',
		fontFamily : customFont
	},
	title : '+',
	height : '50%',
	//borderColor: '#000000',
	//borderWidth: 0,
	//borderRadius: 10,
}));

zoomButtonView.add(Ti.UI.createButton({
	color: '#E0E0E0',
	font : {
		fontSize : '25sp',
		fontFamily : customFont
	},
	title : '-',
	height : '50%',
	// borderColor: '#000000',
	// borderWidth: 0,
	// borderRadius: 10,
}));

webviewContainer.add(localWebview);

//**
webviewContainer.add(bottomMenuSlide);
webviewContainer.add(zoomButtonView);
//bottomContainer.add(bottomMenuSlide);
//bottomContainer.add(zoomButtonView);
//**

var locateUserView = Ti.UI.createView({
	opacity : opacityArray[2],
	width : 60,
	height : 60,
	//height: Ti.UI.SIZE,
	bottom : '28%',
	//bottom: '54%',
	//top: 0,
	right : 5,
});

var locateUserButton = Ti.UI.createButton({
	color: '#E0E0E0',
	font : {
		fontSize : '25sp',
		fontFamily : customFont
	},
	title : '=',
	height : '100%',
	// borderColor: '#000000',
	// borderWidth: 0,
	// borderRadius: 30,
});

locateUserView.add(locateUserButton);

//**
//bottomContainer.add(locateUserView);
webviewContainer.add(locateUserView);
//**

var activityIndicator = Ti.UI.createActivityIndicator({
	color : '#FFFFFF',
	font : {
		fontSize : '22sp'
	},
	message : 'Retrieving shuttle data...',
	top : '45%',
	height : Ti.UI.SIZE,
	weight : Ti.UI.SIZE,
	visible : true
});

var loadBar = Ti.UI.createProgressBar({
	top : '60%',
	min : 0,
	max : 4,
	value : 0,
	height : '10%',
	width : '80%',
	style : 3
});

webviewContainer.add(activityIndicator);
webviewContainer.add(loadBar);
// win.add(loadingContainer);

webviewContainer.add(selectedStopView);

//**
webviewContainer.add(bottomMenu);
//bottomContainer.add(bottomMenu);
//**


//webviewContainer.add(bottomContainer);
//win.add(selectedStopView);
win.add(webviewContainer);
//win.add(localWebview);
//win.add(bottomMenu);


//Hide elements temporarily for load indicator
zoomButtonView.visible = selectedStopView.visible = bottomMenu.visible = localWebview.visible = locateUserView.visible = bottomMenuSlide.visible = false;
//webviewContainer.visible = false;


// setInterval(function(){
	// var bottomMenuHeight3 = bottomMenu.toImage().height;
	// info("bottomMenuHeight3: " + bottomMenuHeight3);
// }, 200);

win.open();

loadBar.show();

setStops();

//===================================================================
//-------------------------------------------------------------------
//===================================================================

Ti.App.addEventListener('settingsChanged', function(e) {
	info("eventListener : settingsChanged");
	var propsChanged = e.data;
	for (var i = 0, len = propsChanged.length; i < len; i++) {
		if (propsChanged[i] != -1) {
			switch(i) {
				case 0:
					props[0] = propsChanged[0];
					Ti.App.fireEvent('updatemap', {
						id : 6,
						routeBool : propsChanged[0]
					});
					break;
				case 1:
					props[1] = propsChanged[1];
					Ti.App.fireEvent('updatemap', {
						id : 5,
						routeBool : propsChanged[1]
					});
					break;
				case 2:
					props[2] = propsChanged[2];
					Ti.App.fireEvent('updatemap', {
						id : 4,
						routeBool : propsChanged[2]
					});
					break;
				case 3:

					break;
				case 4:
					props[4] = propsChanged[4];
					if (props[4] == true || props[4] == "true") {
						getUserGPS();
						diffArray = findNearest(userGPS);
						Ti.API.info("This is diffArray: " + diffArray.toString());
						updateTable(diffArray);
						gpsCounter = 0;
					} else {
						userGPS = [];
						updateTable(-1);
						gpsCounter = 0;
					}
					break;
				case 5:
					props[5] = propsChanged[5];
					diffArray = findNearest(userGPS);
					updateTable(diffArray);
					break;
				case 6:
					
					break;
				case 7:
					props[7] = propsChanged[7];
					Ti.API.info("YOYO map changed!");
					Ti.App.fireEvent('updatemap', {
						id: 8,
						basemap: props[7],
					});
					break;
			
			}
		}
	}
});

locateUserView.addEventListener('click', function(e) {

	if (props[4] == true || props[4] == "true" && userGPS.length != 0) {
		Ti.App.fireEvent("updatemap", {
			id : 2,
			latitude : userGPS[0],
			longitude : userGPS[1],
			userBool : true
		});
	} else
		alert("User GPS is currently disabled.");

});

bottomMenuSlide.addEventListener('click', function(e) {
	if (fullMapViewBool) {
		bottomMenu.visible = true;
		bottomMenuSlide.bottom = '27%', zoomButtonView.bottom = locateUserView.bottom = '28%';
		fullMapViewBool = false;
	} else {
		bottomMenu.visible = false;
		bottomMenuSlide.bottom = '0%', zoomButtonView.bottom = locateUserView.bottom = '1%';
		fullMapViewBool = true;
	}
});

settingsButton.addEventListener('click', function(e) {
	if (settings == null) {
		settings = require('settings');
	}
	settings.createSettingsWin(props);
});

zoomButtonView.addEventListener('click', function(e) {
	var children = zoomButtonView.getChildren();
	if (e.source == children[0]) {
		Ti.App.fireEvent("updatemap", {
			id : 3,
			zoomBool : true
		});
	} else if (e.source == children[1]) {
		Ti.App.fireEvent("updatemap", {
			id : 3,
			zoomBool : false
		});
	}
});

win.addEventListener('android:back', function(e) {
});

Ti.App.addEventListener('adjustTable', function(e){
	var dataToChange = routeEstTable.getData();
	info("DataToChange Pre: " + dataToChange.toString());
	dataToChange = dataToChange[0].getRows();
	info("DataToChange Pre: " + dataToChange.toString());
	var landmarkId = e.data[0];
	info("landmarkId = " + landmarkId);
	var id, j;
	for ( i = 0; i < dataToChange.length; i++) {
		id = dataToChange[i].landmarkId;
		if(id == landmarkId){
			routeEstTable.scrollToTop(i);
			if (lastClickedStopName != null) {
				lastClickedChildren[0].color = '#FFEEDB';
				lastClickedChildren[1].color = '#C0C0C0';
			}
			var children = dataToChange[i].getChildren();
			children = children[0].getChildren();
			children[0].color = children[1].color = '#FFA94C';
			var stopInfo = dataToChange[i].stopsArray;

			lastClickedChildren = children;
			lastClickedStopName = stopInfo[0];
			// Ti.App.fireEvent("updatemap", {
				// id : 2,
				// latitude : stopInfo[1],
				// longitude : stopInfo[2],
				// landmarkId : stopsRow[7],
				// userBool : false
			// }); 

			updateSelected(stopInfo);
			info("These are the children... " + children.toString());

			break;
		}
	}

});

function setWebViewListener() {
	info("FUNC: setWebViewListener");
	//localWebview.addEventListener('load',function(){
	
	if (props[4] == true || props[4] == "true") {
		getUserGPS();
		Ti.App.fireEvent("updatemap", {
			id : 0,
			userGPS : userGPS,
			props : props,
			baseMap : chosenBaseMap,
		});

		if (userGPS.length != 0) {
			diffArray = findNearest(userGPS);
			var index = diffArray[0][1];
			updateSelected(stopsArray[index]);
			lastClickedStopName = stopsArray[index][0];
		} else {
			updateSelected(stopsArray[0]);
			lastClickedStopName = stopsArray[0][0];
		}
	} else {
		Ti.App.fireEvent("updatemap", {
			id : 0,
			userGPS : userGPS,
			props : props,
			baseMap : chosenBaseMap,
		});
		updateSelected(stopsArray[0]);
		lastClickedStopName = stopsArray[0][0];
	}

	setTimeout(function() {
		intervalUpdate();
		setInterval(intervalUpdate, updateInterval);
	}, 1000);
}

function intervalUpdate() {
	info("FUNC: intervalUpdate");
	var shuttleData = shuttleLocRequest();
	updateRouteEstimates();

	//info("GPS COUNTER: " + gpsCounter);
	if (gpsCounter >= getGPSInterval) {//if(gpsEnabled)
		if (props[4] == true || props[4] == "true") {
			getUserGPS();
			if (userGPS.length != 0) {
				if (lastGPS[0] == userGPS[0] && lastGPS[1] == userGPS[1]) {
					updateTable(diffArray);
				} else {
					diffArray = findNearest(userGPS);
					updateTable(diffArray);
				}
			} else {
				updateTable(-1);
			}
		} else {
			updateTable(-1);
		}
		gpsCounter = 0;
	} else {
		gpsCounter++;
	}

	Ti.App.fireEvent("updatemap", {
		id : 1,
		shuttleData : shuttleData,
		userGPS : userGPS
	});

	for (var i = 0, len = stopsArray.length; i < len; i++) {
		if (stopsArray[i] == UstopNameLabel.getText()) {
			updateSelectedTimes(stopsArray[i][3], stopsArray[i][4], stopsArray[i][5], stopsArray[i][6]);
		}
	}
}


function setTableClickListener() {
	info("FUNC: setTableClickListener");
	routeEstTable.addEventListener('click', function(e) {
		if (lastClickedStopName != null) {
			lastClickedChildren[0].color = '#FFEEDB';
			lastClickedChildren[1].color = '#C0C0C0';
		}
		var childViews = e.row.getChildren();
		childViews = childViews[0].getChildren();
		childViews[0].color = childViews[1].color = '#FFA94C';

		var stopsRow = e.row.stopsArray, distance = e.row.distance;
		updateSelected(stopsRow);
		
		lastClickedChildren = childViews;
		lastClickedStopName = stopsRow[0];
		
		Ti.App.fireEvent("updatemap", {
			id : 2,
			latitude : stopsRow[1],
			longitude : stopsRow[2],
			landmarkId : stopsRow[7],
			userBool : false
		});
	
	});
	incrementLoadBar("setTableClickListener");
}

function adjustTable(e){
	var landmarkId = e.data[0];
	info("landmarkId = " + landmarkId);
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
		info("XXX: stopName = " + stopName);
		// if(stopName == chosenStop){
			// var row = dataToChange[i];
			// row.backgroundColor = '#000000';
			// routeEstTable.scrollToTop(i);
			// break;
		// }	
	}
	
}
//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Updates selected stop text
function updateSelected(stop) {
	info("FUNC: updateSelected");
	UstopNameLabel.setText(stop[0]);
	//distanceLabel.setText()
	updateSelectedTimes(stop[3], stop[4], stop[5], stop[6]);
	
}

//Takes in 4 times, updates label
//Should be called when selectedStop is changed, and when new data is pulled
function updateSelectedTimes(t0, t1, t2, t3) {
	info("FUNC: updateSelectedTimes");
	//Ti.API.info("TimeA:"+ t0);
	var times = new Array(4);
	times[0] = t0;
	times[1] = t1;
	times[2] = t2;
	times[3] = t3;

	//change this back to 4 iterations after stopsArray modified to include 4th ETA
	for (var i = 0; i < 3; i++) {
		if (times[i] > 0 && times[i] != null) {
			stopTimingLabels[i].setText(timeConversion(times[i]));
		} else
			stopTimingLabels[i].setText('---');
	}

}

//Converts seconds to a minute:second string
function timeConversion(time) {
	info("FUNC: timeConversion");
	var timeOutput;
	var min = Math.floor(time / 60);
	var sec = time % 60;

	if (sec < 10)
		timeOutput = min + ':0' + sec;
	else
		timeOutput = min + ':' + sec;

	return timeOutput;
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Organize table based on proximity to user
function findNearest(userLocation) {
	info("FUNC: findNearest");
	diffArray = [];

	//Calculate differences between stops and UserGPS
	for (var i = 0, len = stopsArray.length; i < len; i++) {
		var tmpStop = stopsArray[i];
		var latitude = tmpStop[1];
		var longitude = tmpStop[2];
		var diff = getDistanceFromLatLon(userLocation[0], userLocation[1], latitude, longitude);
		diffArray.push([diff, i]);
	}

	//Sort the new array by distance, with [0] being the smallest
	diffArray.sort(function(a, b) {
		return a[0] - b[0];
	});
	return diffArray;
}

function updateTable(diffArray) {
	info("FUNC: updateTable");
	var nearestArray = [];
	var selectedRowScheme = ['#FFA94C', '#FFA94C'];
	var normalRowScheme = ['#FFEEDB', '#C0C0C0'];
	var currentScheme;
	
	var count = 0;
	
	if (diffArray == -1) { //User GPS disabled
		for (var j = 0, len = stopsArray.length; j < len; j++) {
			if (lastClickedStopName == stopsArray[j][0]) {
				currentScheme = selectedRowScheme;
			} else {
				currentScheme = normalRowScheme;
			}
			
			var tableRow = Ti.UI.createTableViewRow({
				className : 'Stops',
				layout : 'horizontal',
			});
			var rowView = Ti.UI.createView({});
			
			rowView.add(Ti.UI.createLabel({
				left : 15,
				font : {fontSize : '20sp', fontFamily : normalFont},
				color: currentScheme[0],
				text : stopsArray[j][0],
			})); 
			rowView.add(Ti.UI.createLabel({
				font : {fontSize : '18sp', fontFamily : normalFont},
				right : 10,
			})); 
			tableRow.stopsArray = stopsArray[j];
			tableRow.distance = -1;
			
			tableRow.add(rowView);
			nearestArray.push(tableRow);

			if (lastClickedStopName == stopsArray[j][0]) {
				lastClickedChildren = rowView.getChildren();
			}
		}
	} else {
		for (var j = 0, len = diffArray.length; j < len; j++) {
			var index = diffArray[j][1], distance = diffArray[j][0];
			if (lastClickedStopName == stopsArray[index][0]) {
				count++;
				currentScheme = selectedRowScheme;
			} else {
				currentScheme = normalRowScheme;
			}
			
			var tableRow = Ti.UI.createTableViewRow({
				className : 'Stops',
				layout : 'horizontal',
				landmarkId: stopsArray[index][7],
			});
			var rowView = Ti.UI.createView({});
			
			rowView.add(Ti.UI.createLabel({
				left : 15,
				font : {fontSize : '20sp', fontFamily : normalFont},
				color : currentScheme[0],
				text : stopsArray[index][0],
			})); 

			if (props[5] == 'false' || !props[5]) {
				rowView.add(Ti.UI.createLabel({
					right : 10,
					font : {fontSize : '18sp', fontFamily : normalFont},
					color : currentScheme[1],
					text : distance.toFixed(2.2) + " km",
				}));
			} else {
				rowView.add(Ti.UI.createLabel({
					right : 10,
					font : {fontSize : '18sp'},
					color : currentScheme[1],
					text : distance.toFixed(2.2) + " mi",
				}));
			}
			tableRow.stopsArray = stopsArray[index];
			tableRow.distance = distance;
			
			tableRow.add(rowView);
			nearestArray.push(tableRow);

			if (lastClickedStopName == stopsArray[index][0]) {
				lastClickedChildren = rowView.getChildren();
			}else if(count == 1){
				info("count = " + count + "\nSHOULD NEVER HAPPEN\nSHOULD NEVER HAPPEN\nSHOULD NEVER HAPPEN\nSHOULD NEVER HAPPEN\nSHOULD NEVER HAPPEN\nSHOULD NEVER HAPPEN\nSHOULD NEVER HAPPEN\nSHOULD NEVER HAPPEN\n");	
			}
			count = 0;
		}
	}
	routeEstTable.setData(nearestArray);
	incrementLoadBar("updateTable");
}

//====================================================================================================================================
//------------------------------------------------------------------------------------------------------------------------------------
//====================================================================================================================================

function setStops() {
	info("FUNC: setStops");
		var bottomMenuHeight2 = bottomMenu.toImage().height;
	info("bottomMenuHeight2: " + bottomMenuHeight2);
	incrementLoadBar("setStops");
	var xhr = Ti.Network.createHTTPClient({
		onload : function() {
			var routeNames = new Array(3);
			var id = 0;

			//Retrieve initial route info
			var routes = JSON.parse(this.responseText);
			var landmarkArray = [], routesArray = [];
			var route, data;
			
			for (var i = 0, routesLen = routes.length; i < routesLen; i++) {
				route = routes[i];
				landmarkArray = [];

				routeNames[i] = route.Description;

				for (var j = 0, landmarksLen = route.Landmarks.length; j < landmarksLen; j++) {
					data = route.Landmarks[j];
					landmarkArray.push([data.Label, data.Latitude, data.Longitude, data.LandmarkID]);
				}
				routesArray.push(landmarkArray);
			}

			//Sort and remove duplicates. Add flags for which shuttles stop at each stop.
			for (var k = 0, len = routesArray.length; k < len; k++) {
				for (var l = 0, len1 = routesArray[k].length; l < len1; l++) {
					var cur = routesArray[k][l];
					var skip = 0;

					for (var i = 0, len2 = stopsArray.length; i < len2; i++) {
						if (stopsArray[i][0] == cur[0]) {
							skip = 1;
							break;
						}
					}

					if (!skip) {
						stopsArray.push([cur[0], cur[1], cur[2], -1, -1, -1, -1, cur[3]]);
					}
				}

			}
			/* ----------------ARRAY INFO-----------------------
			 * stopsArray STRUCTURE
			 * 		[Stop Name, Latitude, Longitude, SouthCentralBusFlag, NorthCentralBusFlag, ExpressBusFlag, CampusBusFlag, LandmarkID]
			 *
			 * 		Example
			 * 			[LaSells Stewart Center,44.55901,-123.27962,-1,-1,-1,-1,21]
			*/
			
			updateRouteEstimates();
			
			if(localWebview.loading){
				localWebview.addEventListener('load', function(e) {
					info("localWebview.addEvent(load)");
					setWebViewListener();
					setTableClickListener();
				});
			}
			else{
				info("localWebview.addEvent(load)");
				setWebViewListener();
				setTableClickListener();
			}
	
	

		}
	});
	xhr.open("GET", url[1]);
	xhr.send();
}

var firstUpdateRouteEstimates = true;
function updateRouteEstimates() {
	info("FUNC: updateRouteEstimates");
	var loopCounter = 0;
	var xhr = Ti.Network.createHTTPClient({
		onload : function() {
			var shuttles = JSON.parse(this.responseText);
			for (var i = 0, shuttlesLen = shuttles.length; i < shuttlesLen; i++) {
				var shuttle = shuttles[i];
				for (var j = 0, stopsArrayLen = stopsArray.length; j < stopsArrayLen; j++) {
					for (var k = 0, routeStopsLen = shuttle.RouteStops.length; k < routeStopsLen; k++) {
						loopCounter++;
						if (shuttle.RouteStops[k].Description == stopsArray[j][0]) {
							stopsArray[j][i + 3] = shuttle.RouteStops[k].Estimates[0].SecondsToStop;
							break;
						}
					}
				}
			}
			incrementLoadBar("updateRouteEstimates");
			info("Loop Counter: " + loopCounter);
		},
		onerror : function(e) {
			Ti.API.info("ERROR: updateRouteEstimates() : " + e.toString());
		},
		timeout : 5000
	});
	xhr.open("GET", url[0]);
	xhr.send();
}

function incrementLoadBar(callingFunction) {
	if (loadBar != null) {
		var value = loadBar.getValue();
		loadBar.setValue(++value);
		info("FUNC: incrementLoadBar. newValue --> " + value + ", by " + callingFunction);
		if (value >= 4) {
			doneLoading();
		}
	}
}

function shuttleLocRequest() {
	info("FUNC: shuttleLocRequest");
	var shuttleData = [];
	var xhr = Ti.Network.createHTTPClient({
		onload : function() {
			shuttleLocs = JSON.parse(this.responseText);

			if (shuttleLocs.length == 0) {
				//Ti.API.info("No shuttles active...");
			} else {
				for (var x = 0, len = shuttleLocs.length, loc; x < len; x++) {
					loc = shuttleLocs[x];
					shuttleData.push([loc.RouteID, loc.Latitude, loc.Longitude, loc.Heading]);
				}
			}
			return shuttleData;
		},
		onerror : function(e) {
			Ti.API.info("ERROR: shuttleLocRequest() function failed. error: " + e);
			return shuttleData;
		}
	});
	xhr.open("GET", url[2]);
	xhr.send();
}

function doneLoading() {
	info("FUNC: doneLoading");
	webviewContainer.opacity = 0;
	localWebview.visible = true;
	locateUserView.visible = zoomButtonView.visible = selectedStopView.visible = bottomMenu.visible = bottomMenuSlide.visible = true;

	webviewContainer.remove(activityIndicator);
	webviewContainer.remove(loadBar);
	activityIndicator = loadBar = null;
	
	webviewContainer.animate(containerFadeIn);
}

function getUserGPS() {
	info("FUNC: getUserGPS");
	Titanium.Geolocation.getCurrentPosition(function(e) {
		if (!e.success || e.error) {
			Ti.API.info("ERROR: failed to get UserGPS, error: " + e);
			userGPS = [];
			return;
		} else {
			lastGPS = userGPS;
			userGPS[0] = e.coords.latitude;
			userGPS[1] = e.coords.longitude;
			userGPS[2] = e.coords.timestamp;
			//Ti.API.info("Got userGPS. Lat: " + e.coords.latitude + ", Long: " + e.coords.longitude + ", at " + e.coords.timestamp);
		}
	});
}

function initProperties() {
	info("FUNC: initProperties");

	var defValue = 'osm';
	props = [Ti.App.Properties.getString('showExpress', true), Ti.App.Properties.getString('showSouthCentral', true), Ti.App.Properties.getString('showNorthCentral', true), 
		Ti.App.Properties.getString('showCentralCampus', true), Ti.App.Properties.getString('gpsEnabled', true), Ti.App.Properties.getString('unitMi', true), Ti.App.Properties.getString('showTable', true), 
		Ti.App.Properties.getString('basemap', defValue)];
		
	Ti.API.info("props[7] : " + props[7]);
}

function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
	var miConversion = 0.621371;
	var R = 6371;
	// Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1);
	// deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	if (props[5] == 'true' || props[5]) {
		var d = R * c * miConversion;
		// Distance in km
	} else {
		var d = R * c;
	}
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}

function info(msg) {
	if (firstTime) {
		baseTime = new Date().getTime();
		firstTime = false;
	}
	var time = new Date().getTime();
	time = time - baseTime;
	time = time / 1000;
	Ti.API.info(msg + ", (" + time + ")");
}

var startTime, stopTime, totalTime;
function startTimer() {
	startTime = new Date().getTime();
}

function stopTimer() {
	stopTime = new Date().getTime();
	totalTime = (stopTime - startTime) / 1000;
	info("/_-/_-/_-/_-/_-/_---TotalTime: " + totalTime);
	return totalTime;
}

