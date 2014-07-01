//Campus Shuttle Tracking 

//NOTE: OFFICAL ROAD-LIKE COMMENT BLOCK
//===================================================================
//-------------------------------------------------------------------
//===================================================================

var firstTime = true;
var baseTime;
var firstIntervalUpdate = true;

// Gradients : [TopMenu, BottomMenu]
var color1 = [['#113a7c', '#082b62'],['#006151', '#00463B']];
var color2 = [['#011431', '#000917'],['#002f27', '#001612']];
var color = color2;
//Ti.API.info("COLOR : " + color[0][0]);

info("Test---------------------");

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

//url[0]:updateRouteEstimates , url[1]:setStops , url[2]:shuttleLocRequest
var url = ["http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates", 
	"http://www.osushuttles.com/Services/JSONPRelay.svc/GetRoutesForMapWithSchedule","http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapVehiclePoints"];

var userGPS = [44.565, -123.277];
var deviceGPSOn = false, gpsOffPhrase = "GPS: Off", gpsOnPhrase = "GPS: On";

var settings;
var toggleMenuOn = false;
var loadedHTTP = false;

//Array of nearest stops
var stopsArray = [], diffArray = [];
//var nearestArray = [];

//Variables and function for shuttle coordinates data
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
  	data: [],
	scrollable: true,
	color: '#ffffff',
	separatorColor: '#838383',
	showVerticalScrollIndicator: true,
	allowsSelection: true,
});

var zoomButtonView = Ti.UI.createView({
	left: 5,
	width: '15%',
	height: Ti.UI.SIZE,
	top: '65%',
	layout: 'vertical',
});

/*var zoomInButton = Ti.UI.createButton({
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
zoomButtonView.add(zoomOutButton);*/

zoomButtonView.add(Ti.UI.createButton({
	title: '+',
	font:{fontSize:25},
	width: '100%',
	height: '50%'
}));

zoomButtonView.add(Ti.UI.createButton({
	title: '-',
	font:{fontSize:25},
	width: '100%',
	height: '50%'
}));

//zoomButtonView.add(zoomInButton);
//zoomButtonView.add(zoomOutButton);

bottomMenu.add(bottomMenuView);
bottomMenu.add(routeEstTable);

webviewContainer.add(localWebview);
webviewContainer.add(zoomButtonView);


var activityIndicator = Ti.UI.createActivityIndicator({
	color: '#FFFFFF',
	font: {fontSize: 22},
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
Ti.App.addEventListener('doneLoading', doneLoading);

//Make sure map.html is loaded into the window before beginning the chain

setStops();

localWebview.addEventListener('load',function(e){
	info("localWebview.addEvent(load)");
	Ti.API.info("FIRST! WEBLOAD");
	setWebViewListener();
	setTableClickListener();
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
					Ti.App.fireEvent('updatemap', {id: 6, routeBool: propsChanged[0]});
					break;
				case 1:
					//Ti.API.info("Firing bbox");
					props[1] = propsChanged[1];
					Ti.App.fireEvent('updatemap', {id: 5, routeBool: propsChanged[1]});
					break;
				case 2:
					//Ti.API.info("Firing cbox");
					props[2] = propsChanged[2];
					Ti.App.fireEvent('updatemap', {id: 4, routeBool:propsChanged[2]});
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
	//Ti.API.info("FUNC: setWebViewListener");
	//localWebview.addEventListener('load',function(){
	
	if(props[4]){
		getUserGPS();
		Ti.App.fireEvent("updatemap", {id: 0, userGPS: userGPS, props: props});
		if(deviceGPSOn){
			diffArray = findNearest(userGPS);
			var index = diffArray[0][1];
			updateSelected(stopsArray[index]);
		}	
	}else {
		Ti.App.fireEvent("updatemap", {id: 0, userGPS: userGPS, props: props});
		updateSelected(stopsArray[0]);
	}
	
	setTimeout(function(){
		intervalUpdate();
		setInterval(intervalUpdate, updateInterval);
	}, 1000);
}

var gpsCounter = getGPSInterval;
function intervalUpdate(){
	//Ti.API.info("FUNC: intervalUpdate");
	var lastGPS; 
	var shuttleData = shuttleLocRequest();
	updateRouteEstimates();
	
	info("GPS COUNTER: " + gpsCounter);
	if(gpsCounter >= getGPSInterval){ //if(gpsEnabled)
		if(props[4]){
			lastGPS = userGPS;
			userGPS.length = 0;
			getUserGPS();
			if(lastGPS[0] == userGPS[0] && lastGPS[1] == userGPS[1]){
				//Ti.API.info("getUserGPS returned same data as last. Skipping findNearest");
				if(firstIntervalUpdate){
					updateTable(diffArray);
				}
			} else {
				//Ti.API.info("Got diff array: " + diffArray.toString() + "starting updateTable...");
				diffArray = findNearest(userGPS);
				updateTable(diffArray);
			}
			gpsCounter = 0;
		} else {
			updateTable(-1);
			gpsCounter = 0;
		}
	}else{
		gpsCounter++;
	}
	
	Ti.App.fireEvent("updatemap", {id: 1,shuttleData: shuttleData});
	
	for(var i = 0, len = stopsArray.length; i < len; i++){
		if (stopsArray[i] == UstopNameLabel.getText()){
			updateSelectedTimes(stopsArray[i][3],stopsArray[i][4],stopsArray[i][5],stopsArray[i][6]);
		}
	}
}


/*function setTableClickListener(){
	Ti.API.info("FUNC: setTableClickListener");
	
	routeEstTable.addEventListener('click', function(e){
		if(e.source == '[object Button]'){
			var childViews = e.row.getChildren();
			childViews = childViews[0].getChildren();
			childViews[0].color = '#FFA94C';
			childViews[1].setColor = '#FFA94C';
			e.source.setBackgroundImage = 'GeneralUI/stopSelectButton3.png';
			setTimeout(function() {
        		childViews[0].setColor = '#FFFFFF';
				childViews[1].setColor = '#C0C0C0';
        		e.source.setBackgroundImage = 'GeneralUI/stopSelectButton.png';
    		}, 800);
			
			var stopsArray = e.row.stopsArray, distance = e.row.distance;
			updateSelected(stopsArray);

			Ti.App.fireEvent("centerMap", {latitude: stopsArray[1], longitude: stopsArray[2]});
		}
	});
	Ti.API.info("setTableClick");
	if(loadBar != null){
		loadBar.setValue(loadBar.getValue()+1);
	}
	//Ti.API.info("Load tblClick: " + loadBar.getValue());
}*/
var lastClickedRow, lastClickedChildren, lastClickedStopName;
function setTableClickListener(){
	routeEstTable.addEventListener('click', function(e){
		if(e.source == '[object Button]'){
			info("TableClicked, lastClickedRow: " + lastClickedRow + ", lastClickedStopName : " + lastClickedStopName);
			if(lastClickedRow != null){
				lastClickedChildren[0].color = '#FFFFFF';
				lastClickedChildren[1].color = '#C0C0C0';
				lastClickedRow.backgroundImage = 'GeneralUI/stopSelectButton.png';
			}
			var childViews = e.row.getChildren();
			childViews = childViews[0].getChildren();
			
			childViews[0].color = '#FFA94C';
			childViews[1].color = '#FFA94C';
			e.source.backgroundImage = 'GeneralUI/stopSelectButton3.png';
			
			var stopsRow = e.row.stopsArray, distance = e.row.distance;
			updateSelected(stopsRow);

			lastClickedChildren = childViews;
			lastClickedRow = e.source;
			lastClickedStopName = stopsRow[0];

			Ti.App.fireEvent("updatemap", {id: 2, latitude: stopsRow[1], longitude: stopsRow[2]});
		}
	});
	Ti.API.info("setTableClick");
	if(loadBar != null){
		loadBar.setValue(loadBar.getValue()+1);
	}
	//Ti.API.info("Load tblClick: " + loadBar.getValue());
	info("END setTableClickListener");
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================

//Updates selected stop text
function updateSelected(stop){	
	UstopNameLabel.setText(stop[0]);
	//distanceLabel.setText()
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
	var nearestArray = [];
	if(loadBar != null){
		loadBar.setValue(loadBar.getValue()+1);
	}
	var selectedRowScheme = ['#FFA94C', '#FFA94C', 'GeneralUI/stopSelectButton3.png'];
	var normalRowScheme = ['#FFFFFF', '#C0C0C0', 'GeneralUI/stopSelectButton.png'];
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
				color: currentScheme[0],
				//left: 15,
				//top: 10,
			});
		    var distanceLabel = Ti.UI.createLabel({
				//color: '#C0C0C0',
				//right: 0,
			});
			
			var selectButton = Ti.UI.createButton({
	   			backgroundImage: currentScheme[2],
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
	   		
	   		if(lastClickedStopName == stopsArray[j][0]){
	   			lastClickedRow = selectButton;
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
				info("Table Update");
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
				color: currentScheme[0],
				left: 15,
				top: 10,
			});
			if(props[5] == 'false' || !props[5]){
				var distanceLabel = Ti.UI.createLabel({
					font: { fontSize:16 },
					text: distance.toFixed(2.2) + " km",
					color: currentScheme[1],
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
					color: currentScheme[1],
					right: 0,
					top: 10,
				});
			}
			var selectButton = Ti.UI.createButton({
	   			backgroundImage: currentScheme[2],
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
	   		
	   		if(lastClickedStopName == stopsArray[j][0]){
	   			lastClickedRow = selectButton;
	   			var childViews = tableRow.getChildren();
				childViews = childViews[0].getChildren();
				lastClickedChildren = childViews;
	   		}
		}
	}
	
	if(loadBar != null){
		loadBar.setValue(loadBar.getValue()+1);
	}
	//Ti.API.info("Load updateTbl : " + loadBar.getValue());
	//Ti.API.info("updateTable");
	routeEstTable.setData(nearestArray);

	//Ti.API.info("Set Table in updateTable");
	
	if(initialLaunch){
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
			
	
			if(loadBar != null){
				loadBar.setValue(loadBar.getValue()+1);
			}
			//Ti.API.info("Load setStops: " + loadBar.getValue());
			//Ti.API.info("setStops");
			//stopTimer();
			updateRouteEstimates();
		}
	});
	xhr.open("GET", url[1]);
	xhr.send();
	
	
}
function updateRouteEstimates(){
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
			
		//Ti.API.info("Load routeESt : " + loadBar.getValue());
		//Ti.API.info("UpdateRouteEstimates");
		},
		onerror: function(e){
			Ti.API.info("UPDATE ROUTE EST ERROR: "+e);
		},
		timeout : 3000
	});
	xhr.open("GET", url[0]);
	xhr.send();
}
function shuttleLocRequest(){
	var shuttleData = [];
	var xhr = Ti.Network.createHTTPClient({
		onload: function() {
			shuttleLocs = JSON.parse(this.responseText);
			
			if(shuttleLocs.length == 0){
				//Ti.API.info("No shuttles active...");
			}

			Ti.API.info("WHAT IS SHUTTLEDATA :" + shuttleData);
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
	Ti.App.removeEventListener('doneLoading', doneLoading);
	
	activityIndicator.visible = false;
	webviewContainer.remove(activityIndicator);
	webviewContainer.remove(loadBar);
	activityIndicator = loadBar = null;
	
	zoomButtonView.visible = true;
	selectedStopView.visible = true;
	bottomMenu.visible = true;
	localWebview.visible = true;

	initialLaunch = false;
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

