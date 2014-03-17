//Campus Shuttle Tracking 


Titanium.UI.setBackgroundColor('#fff');

// create set of tabs
var tabGroup = Titanium.UI.createTabGroup();

var url = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates";
var url2 = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetRoutesForMapWithSchedule";


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


var table = Ti.UI.createTableView();
var tableData = [];
var shuttles, shuttle, i, j, row, nameLabel, idLabel, stopsText;

var xhr = Ti.Network.createHTTPClient({
    onload: function() {
        
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
                eta = 'Arrived';
                eta = eta.bold(); //untested
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
    alert('There was an error retrieving the remote data. Try again.');
    },
    timeout:5000
});

xhr.open("GET", url);
xhr.send();

win1.add(table);

//===================================================================


//Create webview of map.html
var localWebview = Titanium.UI.createWebView({
	url:'map.html',
    top:0,
    left:10,
    right:10,
    //html:textContent,
    height:'auto',
    width:'auto',
    backgroundColor:'transparent',
    touchEnabled:true
});
win2.add(localWebview);


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
					alert('error ' + JSON.stringify(e.error));
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
			
win3.add(labelgps);


//===================================================================


var x, y;
var routes, route;
var stops = new Array(7); //Hold list of stops
for (var i=0;i<7;i++){
	stops[i]=new Array(3); //Hold stop info: label, latitude, longitude
}

//Get list of stop coordinates, place in stops array
var xhr2 = Ti.Network.createHTTPClient({
	onload: function() {
		
		//Get all routes
		routes = JSON.parse(this.responseText);
		
		//Single route
		route = routes[0];
		
		for (x=0;x<route.Landmarks.length;x++){
			stops[x][0]=route.Landmarks[x].Label;
			stops[x][1]=route.Landmarks[x].Latitude;
			stops[x][2]=route.Landmarks[x].Longitude;
		}
		
	}
});

xhr2.open("GET", url2);
xhr2.send();

//===================================================================

var dummyUser = ["dummy User GPS data", 44.5657, -123.2789];

//Event listener to wait for call to send stops array and user GPS
localWebview.addEventListener('load',function(){
	Ti.App.fireEvent("web:data", {data: [stops, dummyUser]});
});


//Start the tabs
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);
tabGroup.addTab(tab3);
tabGroup.open();
