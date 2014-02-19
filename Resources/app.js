//Campus Shuttle Tracking v0.0001
//Basic app to display in a single window the names and locations of each route


Titanium.UI.setBackgroundColor('#fff');

var url = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates";
var win = Ti.UI.createWindow({
	backgroundColor:'#fff'
});
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

win.add(table);
win.open();