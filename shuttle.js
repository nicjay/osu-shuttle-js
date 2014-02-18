// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();



var url = "http://www.osushuttles.com/Services/JSONPRelay.svc/GetMapStopEstimates";
var shuttle_data;
 
var httpClient = Ti.Network.createHTTPClient({
	onerror : onFail,
    onload: function() {
		// parse the retrieved data, turning it into a JavaScript object
    	
    	try {
				shuttle_data = JSON.parse(this.responseText);
				if (shuttle_data && shuttle_data.status && shuttle_data.status == "success")
					onSuccess();
				else
					onFail();
			} catch (e) {
				onFail();
			}
		
	},
	timeout : 5000
});

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Tab 1',
    window:win1
});

var label1 = Titanium.UI.createLabel({
	color:'#999',
	text:'I am Window 1',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

win1.add(label1);

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({  
    title:'Tab 2',
    backgroundColor:'#fff'
});
var tab2 = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'Tab 2',
    window:win2
});

var label2 = Titanium.UI.createLabel({
	color:'#999',
	text:'I am Window 2',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

win2.add(label2);



//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  


// open tab group
tabGroup.open();
