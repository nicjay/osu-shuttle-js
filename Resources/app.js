//Campus Shuttle Tracking 

//NOTE: OFFICAL ROAD-LIKE COMMENT BLOCK
//===================================================================
//-------------------------------------------------------------------
//===================================================================

Titanium.UI.setBackgroundColor('#fff');
Ti.UI.Android.hideSoftKeyboard();
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

//Create set of tabs
var tabGroup = Titanium.UI.createTabGroup();

var url = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates";
var url2 = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetRoutesForMapWithSchedule";
var url3 = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapVehiclePoints";

var userGPS = [44.565, -123.277];
var deviceGPSOn = false;
var gpsOffPhrase = "GPS: Off";
var gpsOnPhrase = "GPS: On";

//Array of nearest stops
var nearestArray = [];

var stopsArray = [], diffArray = [];

//Number of milliseconds between update calls
var updateInterval = 4000;
//Number of update cycles between getting GPS     4 * 4 = 16 seconds
var getGPSInterval = 4;

//Route visibility toggle checkboxes
var routeCheckboxA, routeCheckBoxB, routeCheckboxC;

//Create main window
var win = Ti.UI.createWindow({
    backgroundColor:'#000000',
    navBarHidden:true,
    windowSoftInputMode: Titanium.UI.Android.SOFT_INPUT_STATE_ALWAYS_HIDDEN,
    layout: 'vertical',
});

var topMenu = Ti.UI.createView({
	width: 'auto',
	height: Ti.UI.SIZE,
	top: 0,
});


//Create webview of map.html
var localWebview = Titanium.UI.createWebView({
	url:'map.html',
    //bottom: bottomMenu.toImage().height,
    left:0,
    right:0,
    top: 0,
    //html:textContent,
    height:'55%',
    //width:'auto',
    backgroundColor:'#373737',
    touchEnabled:true,
    borderColor: '#c34500',
    borderWidth: 0,
    borderRadius: 0,
    //layout: 'vertical',
   // layout: 'composite'
});


var selectedStopView = Ti.UI.createView({
	backgroundImage: 'GeneralUI/selectedStopBackground.png',
	width: 'auto',
	height: Ti.UI.SIZE,
	borderColor: '#9D9C9C',
	borderRadius: 5,
	borderWidth: 3,
	//layout: 'horizontal',
	
});


var bottomMenu = Ti.UI.createView({
    width:'auto',
    height: 'auto',
    bottom:0,
    left: 0,
    right: 0,
    backgroundImage: 'GeneralUI/selectedStopBackground.png',
});

var userGPSStatusLabel = Titanium.UI.createLabel({
	color:'#334C61',
	text: '',
	font:{fontSize:15,fontFamily:'Helvetica Neue', fontWeight: 'bold'},
	textAlign:'left',
	top: '90px',
	left: 10,
	backgroundColor: 'transparent',
});



var toggleMenu = Ti.UI.createView({
    width:'auto',
    height:'auto',
    bottom:0,
    left: 0,
    right: 0,
    backgroundColor:'#373737',
    borderColor: '#111111',
    borderWidth: 5,
    borderRadius: 0,
    //visible: false,
});



var toggleMenu1 = Ti.UI.createView({
    width:'50%',
    height:'50%',
    //bottom:0,
    top: 0,
    left: 0,
    //right: 0,
    backgroundImage: 'GeneralUI/toggleBgOrange.png',
    borderColor: '#111111',
    borderWidth: 5,
    borderRadius: 0,
    //visible: false,
});

var toggleMenu2 = Ti.UI.createView({
    width:'50%',
    height:'50%',
    //bottom:0,
    top: 0,
    //left: 0,
    right: 0,
    backgroundImage: 'GeneralUI/toggleBgBlue.png',
    borderColor: '#111111',
    borderWidth: 5,
    borderRadius: 0,
    //visible: false,
});

var toggleMenu3 = Ti.UI.createView({
    width:'50%',
    height:'50%',
    bottom:0,
    //top: 0,
    left: 0,
    //right: 0,
    backgroundImage: 'GeneralUI/toggleBgGreen.png',
    borderColor: '#111111',
    borderWidth: 5,
    borderRadius: 0,
    //visible: false,
});

var toggleMenu4 = Ti.UI.createView({
    width:'50%',
    height:'50%',
    bottom:0,
    //top: 0,
    //left: 0,
    right: 0,
    backgroundImage: 'GeneralUI/toggleBgYellow.png',
    borderColor: '#111111',
    borderWidth: 5,
    borderRadius: 0,
    //visible: false,
});

toggleMenu.add(toggleMenu1);
toggleMenu.add(toggleMenu2);
toggleMenu.add(toggleMenu3);
toggleMenu.add(toggleMenu4);

var toggleMenuOn = false;

var toggleButton = Ti.UI.createButton({
	top:0,
	right: 0,
	width: 100,
	title: 'Toggle',
	zIndex: 1
});

var zoomInButton = Ti.UI.createButton({
	top:toggleButton.getHeight(),
	right:0,
	width: 50,
	title: '+',
	zIndex: 1
});

var zoomOutButton = Ti.UI.createButton({
	top:0,
	right: 100,
	width: 100,
	title: '-',
});


createRouteCheckBox();

/*var slideLabel = Titanium.UI.createLabel({
	color:'#334C61',
	text: '',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	bottom: 0,
	width: 'auto',
	height:'auto',
	backgroundImage: 'GeneralUI/slideBar.png'
});*/



var routeEstTable = Ti.UI.createTableView({
  	minRowHeight: 50,
  	maxRowHeight: 50,
  	data: nearestArray,
	scrollable: true,
	color: '#ffffff',
	separatorColor: 'white',
	showVerticalScrollIndicator: true,
	softKeyboardOnFocus: Titanium.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS,
});



var scrollArrows = Ti.UI.createImageView({
	image:'GeneralUI/scrollarrow.png',
	right:10
});



//selectedStopView.add(toggleButton);




//Add objects to window
win.add(localWebview);



win.add(zoomInButton);
//childWebview.add(zoomOutButton)
win.add(toggleButton);



win.add(selectedStopView);
win.add(bottomMenu);

win.add(userGPSStatusLabel);

bottomMenu.add(selectedStopView);
bottomMenu.add(routeEstTable);

//bottomMenu.add(scrollArrows);


SetStops();

setAdjustTableListener();
setWebViewListener();
setLongPressListener();

win.open();

//===================================================================
//-------------------------------------------------------------------
//===================================================================

function createRouteCheckBox(){
	routeCheckboxB = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  font:{fontSize:16,fontFamily:'Helvetica Neue'},
	  value:true,
	  width: '100%',
	  height: '100%',
	  titleOff: 'Express',
	  titleOn: 'Express',
	  borderRadius: 5,
	  verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	});
	
	routeCheckboxA = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  font:{fontSize:16,fontFamily:'Helvetica Neue'},
	  value:true,
	  width: '100%',
	  height: '100%',
	  titleOff: 'South Central',
	  titleOn: 'South Central',
	  borderRadius: 5,
	  verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	});
	
	routeCheckboxC = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  font:{fontSize:16,fontFamily:'Helvetica Neue'},
	  value:true,
	  width: '100%',
	  height: '100%',
	  titleOff: 'Norst Central',
	  titleOn: 'North Central',
	  borderRadius: 5,
	  verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	});
	
	routeCheckboxD = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  font:{fontSize:16,fontFamily:'Helvetica Neue'},
	  value:true,
	  width: '100%',
	  height: '100%',
	  titleOff: 'Central Campus',
	  titleOn: 'Central Campus',
	  borderRadius: 5,
	  verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	});

	
	toggleMenu1.add(routeCheckboxA);
	toggleMenu2.add(routeCheckboxB);
	toggleMenu3.add(routeCheckboxC);
	toggleMenu4.add(routeCheckboxD);
	

	setCheckBoxEventListeners();
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================

//set stopsArray
function SetStops(){
	var xhr = Ti.Network.createHTTPClient({
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
			/* ----------------ARRAY INFO-----------------------
			 * stopsArray STRUCTURE
			 * 		[Stop Name, Latitude, Longitude, SouthCentralBusFlag, NorthCentralBusFlag, ExpressBusFlag]
			 * 	
			 * 		Example
			 * 			[LaSells Stewart Center,44.55901,-123.27962,1,0,1]		*/
		}
	});
	xhr.open("GET", url2);
	xhr.send();
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================


zoomInButton.addEventListener('click',function(e)
{
	Ti.App.fireEvent("zoomMap", {data: [true]});
});

zoomOutButton.addEventListener('click',function(e)
{
	Ti.App.fireEvent("zoomMap", {data: [false]});
});

toggleButton.addEventListener('click',function(e)
{
   Titanium.API.info("You clicked the toggle visibility button");
   if (!toggleMenuOn){
   		bottomMenu.remove(routeEstTable);
   		bottomMenu.add(toggleMenu);
   		toggleMenuOn = true;
   }
   else{
   		bottomMenu.remove(toggleMenu);
   		bottomMenu.add(routeEstTable);
   		toggleMenuOn = false;
   	
   }
});


win.addEventListener('android:back',function(e) {
});

function setAdjustTableListener(){
	//Event listener triggered on map click on stop. Starts function that scrolls the table.
	Ti.App.addEventListener('adjustTable', function(event){
		adjustTable(event);		
		});
}


function setCheckBoxEventListeners(){
	routeCheckboxA.addEventListener('change',function(){
		Ti.App.fireEvent("abox", {data: [routeCheckboxA.value]});
		if(routeCheckboxA.value == false){
			toggleMenu1.setBackgroundImage('GeneralUI/toggleBgOrangeOffD.png');
		}
		else{
			toggleMenu1.setBackgroundImage('GeneralUI/toggleBgOrange.png');
		}
	});
	
	routeCheckboxB.addEventListener('change',function(){
		Ti.App.fireEvent("bbox", {data: [routeCheckboxB.value]});
		if(routeCheckboxB.value == false){
			toggleMenu2.setBackgroundImage('GeneralUI/toggleBgBlueOffD.png');
		}
		else{
			toggleMenu2.setBackgroundImage('GeneralUI/toggleBgBlue.png');
		}
	});
	
	routeCheckboxC.addEventListener('change',function(){
		Ti.App.fireEvent("cbox", {data: [routeCheckboxC.value]});
		if(routeCheckboxC.value == false){
			toggleMenu3.setBackgroundImage('GeneralUI/toggleBgGreenOffD.png');
		}
		else{
			toggleMenu3.setBackgroundImage('GeneralUI/toggleBgGreen.png');
		}
	});
	
	//'dbox' event not caught yet in webview.js
	routeCheckboxD.addEventListener('change',function(){
		Ti.App.fireEvent("dbox", {data: [routeCheckboxD.value]});
		if(routeCheckboxD.value == false){
			toggleMenu4.setBackgroundImage('GeneralUI/toggleBgYellowOffD.png');
		}
		else{
			toggleMenu4.setBackgroundImage('GeneralUI/toggleBgYellow.png');
		}
	});
	
	/*toggleMenu1.addEventListener('click', function(){
		if(routeCheckboxA.value == false){
			toggleMenu1.setBackgroundImage('GeneralUI/toggleBgOrangeOff.png');
			routeCheckboxA.value = true;
		}
		else{
			toggleMenu1.setBackgroundImage('GeneralUI/toggleBgOrange.png');
			routeCheckboxA.value = false;
		}
	});
	toggleMenu2.addEventListener('click', function(){
		if(routeCheckboxB.value == false){
			toggleMenu2.setBackgroundImage('GeneralUI/toggleBgBlueOff.png');
			routeCheckboxB.value = true;
		}
		else{
			toggleMenu2.setBackgroundImage('GeneralUI/toggleBgBlue.png');
			routeCheckboxB.value = false;
		}
	});
	toggleMenu3.addEventListener('click', function(){
		if(routeCheckboxC.value == false){
			toggleMenu3.setBackgroundImage('GeneralUI/toggleBgGreenOff.png');
			routeCheckboxC.value = true;
		}
		else{
			toggleMenu3.setBackgroundImage('GeneralUI/toggleBgGreen.png');
			routeCheckboxD.value = false;
		}
	});
	toggleMenu4.addEventListener('click', function(){
		if(routeCheckboxD.value == false){
			toggleMenu4.setBackgroundImage('GeneralUI/toggleBgYellowOff.png');
			routeCheckboxD.value = true;
		}
		else{
			toggleMenu4.setBackgroundImage('GeneralUI/toggleBgYellow.png');
			routeCheckboxD.value = false;
		}
	});*/
}



function setWebViewListener(){
	//Event listener to start when webview loads
	var diffArray, lastGPS;
	localWebview.addEventListener('load',function(){
		var gpsCounter = getGPSInterval, nearestCounter = 0;
		var stops = [];
		//Start the create map event
		
		getUserGPS();
		if(deviceGPSOn){
			diffArray = findNearest(userGPS);
		}
		
		updateRouteEstimates();
		updateSelected();
		
		Ti.App.fireEvent("startmap", {data: [stops, userGPS]});
		//Want to wait until map is started and ready before doing this stuff
		/*localWebview.addEventListener('maploaded', function(){
			Ti.API.info("--Map Loaded--");
			updateRouteEstimates();
			ShuttleLocRequest();
			
			if(deviceGPSOn){
				diffArray = findNearest(userGPS);
				updateTableGPSOn(diffArray);
			} else{
				updateTable();
			}
			updateSelected();
			setBackupShuttleData();
			Ti.App.fireEvent("updatemap", {data: [shuttlecoords, heading]});
		});*/
	
		//Request the shuttle data, and start the update event, repeats every 5 seconds
		setInterval(function() {
			Ti.API.info("--Interval Function--");
			ShuttleLocRequest();
			updateRouteEstimates();
			
			if(deviceGPSOn){
				if(gpsCounter == getGPSInterval){
					lastGPS = userGPS;
					userGPS.length = 0;
					getUserGPS();
					
					if(lastGPS[0] == userGPS[0] && lastGPS[1] == userGPS[1]){
						Ti.API.info("getUserGPS returned same data as last. Skipping findNearest");
						updateTableGPSOn(diffArray);
					} else {
						Ti.API.info("Got diff array: " + diffArray.toString() + "starting updateTable...");
						diffArray = findNearest(userGPS);
						updateTableGPSOn(diffArray);
					}
					gpsCounter = 0;
					
				} else {
					gpsCounter++;
				}
			} else {
				Ti.API.info("Device GPS off");
				updateTable();
			}

			Ti.App.fireEvent("updatemap", {data: [shuttlecoords, heading]});
		}, updateInterval);
		
	});	
}


function setLongPressListener(){
	routeEstTable.addEventListener('click', function(e){
		if(e.source == '[object Button]'){
			//e.row.backgroundColor = '#42a6ca';
			e.row.backgroundColor = '#337a94';
			e.source.backgroundImage = 'GeneralUI/stopSelectButton2.png';
			setTimeout(function() {
        		e.row.backgroundColor = "transparent";
        		e.source.backgroundImage = 'GeneralUI/stopSelectButton.png';
    		}, 500);
			var stopsArray = e.row.stopsArray;
			Ti.App.fireEvent("centerMap", {latitude: stopsArray[1], longitude: stopsArray[2]});
		}
	});
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================

function getUserGPS(){
	Titanium.Geolocation.getCurrentPosition(function(e)
		{
			if (!e.success || e.error)
			{
				Ti.API.info("Failed to get UserGPS, error: " + e);
				deviceGPSOn = false;
				userGPSStatusLabel.text = gpsOffPhrase;
				Ti.API.info("Failed to get userGPS...");
				return;
			}
			else{
				userGPS[0] = e.coords.latitude;
				userGPS[1] = e.coords.longitude;
				userGPS[2] = e.coords.timestamp;
				deviceGPSOn = true;
				userGPSStatusLabel.text = gpsOnPhrase;
				Ti.API.info("Got userGPS. Lat: " + e.coords.latitude + ", Long: " + e.coords.longitude + ", at " + e.coords.timestamp);
			}
		});
}


function updateSelected(){
   	var stopNameLabel = Ti.UI.createLabel({
		font: { fontSize:16 },
		text: stopsArray[0][0],
		color: '#FFFFFF',
		left: 10,
		top: 0,
		//height: '10%',
		verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
	});
	var distanceLabel = Ti.UI.createLabel({
		color: '#C0C0C0',
		textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
		top: 9,
		width: Ti.UI.FILL,
	});
	
	selectedStopView.add(stopNameLabel);
	selectedStopView.add(distanceLabel);
	

	//Examples for # seconds. 
	//Need to replace label text when new real data is called
	var times = new Array(4);
	times[0] = 13;
	times[1] = 623;
	times[2] = 350;
	times[3] = 461;
	
	var stopTimingLabels = new Array(4); 
	
	for (var i=0; i<4; i++){
		stopTimingLabels[i] = Ti.UI.createLabel({
			font: { fontSize:30 },
			text: timeConversion(time1),
			//color: '#7084ff',
			left:(20+(i*20)).toString()+'%',
			//width: '25%',
			height: Ti.UI.SIZE,
			textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		});
		
	}
	
	stopTimingLabels[0].setColor('#7084ff');
	stopTimingLabels[1].setColor('#36c636');
	stopTimingLabels[2].setColor('#ff6600');
	stopTimingLabels[3].setColor('#ffd119');

	setInterval(function(){
			for (var i=0;i<4;i++){
				if (times[i]-- <= 0){
					stopTimingLabels[i].setText("0:00");
					stopTimingLabels[i].visible = !stopTimingLabels[i].visible ;
				}
				else{
					stopTimingLabels[i].setText(timeConversion(times[i]));
				}
			}		 
		},1000);
	
	for (var i=0;i<4;i++){
		selectedStopView.add(stopTimingLabels[i]);
	}
	
}

//Converts seconds to a minute:second string
function timeConversion(time){
	var timeOutput;
	var min = Math.floor(time / 60);
	var sec = time - min * 60;

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
	
function updateTable(){
	nearestArray = [];
	Ti.API.info("-- updateTable -- function starting...");
	
	//Iterate through stopsArray and create rows for ALL stops.
	for(var index = 0; index < stopsArray.length; index++){
		//Initalize row elements. Two child views within an overall rowView that is added to the row element. 
		var tableRow = Ti.UI.createTableViewRow({
			layout: 'horizontal',
		});
		
		tableRow.stopsArray = stopsArray[index];
		
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
			font: { fontSize:16 },
			text: stopsArray[index][0],
			color: '#FFFFFF',
		});
	    var distanceLabel = Ti.UI.createLabel({
			color: '#C0C0C0',
			right: 0,
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
	//Set row data to newly set nearestArray
	routeEstTable.setData(nearestArray);
	Ti.API.info("Set Table in updateTable");
}
	
function updateTableGPSOn(diffArray){
	nearestArray = [];
	Ti.API.info(diffArray + ", diffArray.toString() = " + diffArray.toString());
	for(var j = 0; j < diffArray.length; j++){
		var index = diffArray[j][1], distance = diffArray[j][0];
	   
		var tableRow = Ti.UI.createTableViewRow({
			layout: 'horizontal',
		});
		
		tableRow.stopsArray = stopsArray[index];
		
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
			font: { fontSize:16 },
			text: stopsArray[index][0],
			color: '#FFFFFF',
			left: 15,
			top: 10,
		});
		var distanceLabel = Ti.UI.createLabel({
			font: { fontSize:14 },
			text: distance.toFixed(2.2) + " mi",
			color: '#C0C0C0',
			right: 0,
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
	routeEstTable.setData(nearestArray);
	Ti.API.info("Set Table in updateTableGPSOn");
}




function updateRouteEstimates(){
	var shuttles = [];
	var xhr = Ti.Network.createHTTPClient({
		onload: function() {
			shuttles = JSON.parse(this.responseText);
			for(var i = 0; i < shuttles.length; i++){
				var shuttle = shuttles[i];
				for(var j = 0; j < stopsArray.length; j++){
					for(var k = 0; k < shuttle.RouteStops.length; k++){
						if(shuttle.RouteStops[k].Description == stopsArray[j][0]){
							stopsArray[j][i+3] = shuttle.RouteStops[k].Estimates[0].SecondsToStop;
							Ti.API.info(stopsArray[j][i+3]);
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
	var xhr = Ti.Network.createHTTPClient({
		onload: function() {
		
			//Get all info
			shuttlelocs = JSON.parse(this.responseText);
			
			if(shuttlelocs.length == 0){
				Ti.API.info("No shuttles active...");
			}
			
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
	xhr.open("GET", url3);
	xhr.send();
}

//===================================================================
//-------------------------------------------------------------------
//===================================================================

function setBackupShuttleData(){
	Ti.App.Properties.setObject('backupShuttleCoords', shuttlecoords);
	Ti.App.Properties.setObject('backupHeading', heading);
	
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
  var d = R * c * miConversion; // Distance in km
  return d;
}


function deg2rad(deg) {
  return deg * (Math.PI/180);
}

	/*//Disabled empty check for testing -- Change this back!!
	//if(stopsArray[index][i+3] != -1){
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
		*/
