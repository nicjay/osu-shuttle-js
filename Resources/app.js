//Campus Shuttle Tracking 


Titanium.UI.setBackgroundColor('#fff');

// create set of tabs
var tabGroup = Titanium.UI.createTabGroup();

var url = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates";
var url2 = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetRoutesForMapWithSchedule";
var url3 = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapVehiclePoints";


//Tab 1/Window 1: contains table for stops
var win1 = Ti.UI.createWindow({
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Shuttle Stops',
    window:win1
});

//Tab 2/Window 2: contains webview w/ map
var win2 = Ti.UI.createWindow({
    backgroundColor:'#fff'
});
var tab2 = Titanium.UI.createTab({  
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

win1.add(table);

//initial request to fill table
dataRequest();
 
//repeat every 5 seconds
setInterval(function() {
	dataRequest();
}, 3000);


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

//Slide menu
var bottomMenu = Ti.UI.createView({
    width:'100%',
    height:100,
    bottom:-100,
    backgroundColor:'#334C61'
});

var slideLabel = Titanium.UI.createLabel({
	color:'#999',
	text:'Toggle Map Settings',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	bottom: 0,
	width:'auto'
});

var slideMenuUp = false;
slideLabel.addEventListener('click', function(e){
    if (slideMenuUp == true) {
        bottomMenu.animate({bottom:-100,duration:500});
        slideLabel.animate({bottom:0, duration:500});
        slideMenuUp = false;
    } else {
        bottomMenu.animate({bottom:0,duration:500});
        slideLabel.animate({bottom:100, duration:500});
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


var routeEstTableData = [ {title: '6:08 : Reser Stadium'}, {title: '8:08 : Ralph Miller Way'}, {title: '10:08 : Dixon Rec Center'}, {title: '12:08 : 26th & Jefferson'}, {title: '0:08 : Campus Way at Gilkey'} ];

var routeEstTable = Ti.UI.createTableView({
  left: 120,
  maxRowHeight: 40,
  data: routeEstTableData,
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
win3.add(labelgps);


//===================================================================

//Variables and function for stop positions data
var routes, route;
var stops = new Array(7); //Hold list of stops
for (var i=0;i<7;i++){
	stops[i]=new Array(3); //Hold stop info: label, latitude, longitude
}

var xhr2 = Ti.Network.createHTTPClient({
	onload: function() {
		
		//Get all route info
		routes = JSON.parse(this.responseText);
		
		//Single route
		route = routes[0];
		
		var x;
		for (x=0;x<route.Landmarks.length;x++){
			stops[x][0]=route.Landmarks[x].Label;
			stops[x][1]=route.Landmarks[x].Latitude;
			stops[x][2]=route.Landmarks[x].Longitude;
		}
		
	}
	
	//Should include onerror here
	
});

xhr2.open("GET", url2);
xhr2.send();


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
	}
	
	//Should include onerror here
});

xhr3.open("GET", url3);
xhr3.send();

}


//===================================================================

var dummyUser = ["dummy User GPS data", 44.5657, -123.2789];

//Event listener to start when webview loads
localWebview.addEventListener('load',function(){
	
	//Start the create map event
	Ti.App.fireEvent("startmap", {data: [stops, dummyUser]});

	setTimeout(function() {
		ShuttleLocRequest();
		Ti.App.fireEvent("updatemap", {data: [shuttlecoords, heading]});
	}, 1500);
	
	//Request the shuttle data, and start the update event, repeats every 5 seconds
	setInterval(function() {
		ShuttleLocRequest();
		Ti.App.fireEvent("updatemap", {data: [shuttlecoords, heading]});
	}, 5000);
	
});

//===================================================================


//Start the tabs
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);
tabGroup.addTab(tab3);
tabGroup.open();

