//Campus Shuttle Tracking v0.0001
//Basic app to display in a single window the names and locations of each route


Titanium.UI.setBackgroundColor('#fff');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


var url = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates";
var url2 = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetRoutesForMapWithSchedule";

var win = Ti.UI.createWindow({
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Shuttle Stops',
    window:win
});

var winmap = Ti.UI.createWindow({
    backgroundColor:'#fff'
});
var tab2 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Map',
    window:winmap
});


var userGPS = Ti.UI.createWindow({
    backgroundColor:'#fff'
});
var tab3 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'user GPS test',
    window:userGPS
});




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
winmap.add(localWebview);



var labelgps = Titanium.UI.createLabel({
	color:'#999',
	text:'test',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});



Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
//Titanium.Geolocation.distanceFilter = 10;

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




userGPS.add(labelgps);






var table = Ti.UI.createTableView();
var tableData = [];
var shuttles, shuttle, i, j, row, nameLabel, idLabel, stopsText;
var shuttles2, route;
var stops = new Array(7);
for (var i=0;i<7;i++){
	stops[i]=new Array(3);
}

var xhr2 = Ti.Network.createHTTPClient({
	onload: function() {
		
		shuttles2 = JSON.parse(this.responseText);
		
		for (i=0;i<shuttles2[0].Landmarks.length;i++){
			stops[i][0]=shuttles2[0].Landmarks[i].Label;
			stops[i][1]=shuttles2[0].Landmarks[i].Latitude;
			stops[i][2]=shuttles2[0].Landmarks[i].Longitude;
		}
		
		alert("STUFF!"+ shuttles2[0].Landmarks[0].Latitude);
		
	}
});

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

xhr2.open("GET", url2);
xhr2.send();

//win.add(table);
//win.open();

tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);
tabGroup.addTab(tab3);
tabGroup.open();

localWebview.addEventListener('load',function(){
	Ti.App.fireEvent("web:data", {data: stops});
});

