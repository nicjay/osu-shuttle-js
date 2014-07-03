//===========================================================================================
//===========================================================================================
//Settings view
//===========================================================================================
//===========================================================================================

//Ti.API.info("In Settings!");
var oldProps;

var mainSettingsWin;

var view0, settingsLabel, closeSettingsButton, view1, routeToggleLabel, view2, gpsToggleLabel, gpsToggleButton, view3, feedbackLabel;
var feedbackEmail, feedbackSendButton, view4, unitLabel, unitToggle;
var routeToggleA, routeToggleB, routeToggleC, routeToggleD;


//===========================================================================================

exports.createSettingsWin = function(props){
	oldProps = props;
	createWindow(props);
};

function createWindow(props){
	mainSettingsWin = Ti.UI.createWindow({
		layout: 'horizontal',
		width: '100%',
		height: '100%',
		navBarHidden:true,
		//backgroundColor: '#FFFFFF',
		backgroundGradient: {
			type:'linear',
			//colors:[{color:'#656968', position:0.0},{color:'#3a3c3b', position: 1.0}]
			colors:[{color:'#3b3b3b', position:0.0},{color:'#1e1e1e', position: 1.0}]
		},
	});
	
	view0 = Ti.UI.createView({
		height: 56,
		backgroundGradient: {
			type:'linear',
			//colors:[{color:'#2370a1', position:0.0},{color:'#09557c', position: 1.0}]
			colors:[{color:'#36588D', position:0.0},{color:'#1F4F9B', position: 1.0}]
		},
		//bottom: 10,
	});
	
	view0.add(Ti.UI.createLabel({
		font:{fontSize:22},
		color: '#FFEEDB',
		text: 'Settings',
		left: 10,
	}));
	
	/*settingsLabel = Ti.UI.createLabel({
		font:{fontSize:22},
		color: '#FFFFFF',
		text: 'Settings',
		left: 10,
	});*/
	
	closeSettingsButton = Ti.UI.createButton({
		backgroundImage: 'GeneralUI/settingsGoBack.png',
		backgroundSelectedImage: 'GeneralUI/settingsGoBackPressed.png',
		width: 42,
		height: 42,
		right: 10,
		title: '',
	});
	
	closeSettingsButton.addEventListener('click', function(e){
		destroyWindow();
	});
	
	//view0.add(settingsLabel);
	view0.add(closeSettingsButton);
	
	//===========================================================================================
	
	view1 = Ti.UI.createView({
		layout: 'horizontal',
		height: Ti.UI.SIZE,
		top: 10,
		bottom: 10,
	});
	
	innerView1 = Ti.UI.createView({
		width: '100%',
		height: Ti.UI.SIZE,
		top: 10,
		bottom: 10,
	});
	
	var routeToggleLabel = Ti.UI.createLabel({
		font: {fontSize: 20},
		color: '#FFEEDB',
		text: "Shuttle/Route Display",
		//width: '100%',
		height: Ti.UI.SIZE,
	});
	
	routeToggleA = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  font:{fontSize:16,fontFamily:'Helvetica Neue'},
	  value: props[0],
	  width: '50%',
	  //height: '100%',
	  titleOff: 'Express',
	  titleOn: 'Express',
	  borderRadius: 5,
	  verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	});
	
	routeToggleB = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  font:{fontSize:16,fontFamily:'Helvetica Neue'},
	  value: props[1],
	  width: '50%',
	  //height: '100%',
	  titleOff: 'South Central',
	  titleOn: 'South Central',
	  borderRadius: 5,
	  verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	});
	
	routeToggleC = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  font:{fontSize:16,fontFamily:'Helvetica Neue'},
	  value: props[2],
	  width: '50%',
	  //height: '100%',
	  titleOff: 'North Central',
	  titleOn: 'North Central',
	  borderRadius: 5,
	  verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	});
	
	routeToggleD = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  font:{fontSize:16,fontFamily:'Helvetica Neue'},
	  value: props[3],
	  width: '50%',
	  //height: '100%',
	  titleOff: 'Central Campus',
	  titleOn: 'Central Campus',
	  borderRadius: 5,
	  verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	});
	
	innerView1.add(routeToggleLabel);
	view1.add(innerView1);
	view1.add(routeToggleA);
	view1.add(routeToggleB);
	view1.add(routeToggleC);
	view1.add(routeToggleD);
	
	//===========================================================================================
	
	view2 = Ti.UI.createView({
		layout: 'horizontal',
		height: Ti.UI.SIZE,
		width: '50%',
		top: 10,
		bottom: 10,
	});
	
	innerView2 = Ti.UI.createView({
		height: Ti.UI.SIZE,
	});
	innerView2B = Ti.UI.createView({
		height: Ti.UI.SIZE,
	});
	
	gpsToggleLabel = Ti.UI.createLabel({
		font: {fontSize: 20},
		color: '#FFEEDB',
		text: "User GPS",
	});
	
	gpsToggleButton = Ti.UI.createSwitch({
		style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
		font: {fontsize: 16},
		value: props[4],
		width: '80%',
		titleOff: "Off",
		titleOn: "On",
		top: 10,
	  	bottom: 10,
	});
	
	innerView2B.add(gpsToggleLabel);
	innerView2.add(gpsToggleButton);
	view2.add(innerView2B);
	view2.add(innerView2);
	
//===========================================================================================

	view3 = Ti.UI.createView({
		height: Ti.UI.SIZE,
		width: '50%',
		layout: 'horizontal',
		top: 10,
		bottom: 10,
	});
	
	innerView3 = Ti.UI.createView({
		width: '100%',
		height: Ti.UI.SIZE,
	});
	innerView3B = Ti.UI.createView({
		height: Ti.UI.SIZE,
	});
	
	unitLabel = Ti.UI.createLabel({
		font: {fontSize: 20},
		color: '#FFEEDB',
		text: "Distance Unit",
	});
	
	unitToggle = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  font:{fontSize:16,fontFamily:'Helvetica Neue'},
	  value: props[5],
  	  width: '80%',
	  titleOff: 'Km',
	  titleOn: 'Mi',
	  top: 10,
	  bottom: 10,
	  //verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	});
	innerView3B.add(unitLabel);
	innerView3.add(unitToggle);
	view3.add(innerView3B);
	view3.add(innerView3);
	//===========================================================================================
	
	view4 = Ti.UI.createView({
		width: '100%',
		height: '100%',
		layout: 'vertical',
		//top: 10,
		//bottom: 10,
	});
	
	innerView4B = Ti.UI.createView({
		height: Ti.UI.SIZE,
	});
	
	feedbackLabel = Ti.UI.createLabel({
		font: {fontSize: 20},
		color: '#FFEEDB',
		//width: '100%',
		text: 'Help Improve the App!',
	});
	
	innerView4 = Ti.UI.createView({
		//width: '100%',
		height: Ti.UI.SIZE,
	});
	
	feedbackEmail = Ti.UI.createEmailDialog();
	feedbackEmail.subject = "BeaverBus App Feedback";
	feedbackEmail.toRecipients = ['sellers.kevin@gmail.com'];
	
	feedbackSendButton = Ti.UI.createButton({
		width: '50%',
		left: '25%',
		title: "Send Feedback",
		backgroundColor: '#c65d15',
		top: 10,
		bottom: 10,
	});
	feedbackSendButton.addEventListener('click', function(e){
		Ti.App.Properties.setString('sentEmail', 'yes');
		feedbackEmail.open();
	});
	
	innerView4B.add(feedbackLabel);
	innerView4.add(feedbackSendButton);
	view4.add(innerView4B);
	view4.add(innerView4);
	//===========================================================================================
	
	mainSettingsWin.add(view0);
	mainSettingsWin.add(view1);
	mainSettingsWin.add(view2);
	mainSettingsWin.add(view3);
	mainSettingsWin.add(view4);
	mainSettingsWin.open();
}

function destroyWindow(){
	var pre = Ti.Platform.getAvailableMemory();
	Ti.API.info("PreDestroy : " + pre);
	setProperties();
	
	/*view0 = null; settingsLabel = null; closeSettingsButton = null; view1 = null; routeToggleLabel = null; view2 = null; gpsToggleLabel = null; gpsToggleButton = null; view3 = null; feedbackLabel = null;
	feedbackEmail = null; feedbackSendButton = null; view4 = null; unitLabel = null; unitToggle;
	routeToggleA = null; routeToggleB = null; routeToggleC = null; routeToggleD = null;*/
	
	mainSettingsWin.close();
	mainSettingsWin = null;
	var post = Ti.Platform.getAvailableMemory();
	Ti.API.info("PostDestroy : " + post);
	var total = post-pre;
	Ti.API.info("DIFF : " + total);
}

function setProperties(){
	var propsArray = [routeToggleA.getValue(), routeToggleB.getValue(), routeToggleC.getValue(), routeToggleD.getValue(), gpsToggleButton.getValue(), unitToggle.getValue()];
	
	Ti.App.Properties.setString('showExpress', propsArray[0]);
	Ti.App.Properties.setString('showSouthCentral', propsArray[1]);
	Ti.App.Properties.setString('showNorthCentral', propsArray[2]);
	Ti.App.Properties.setString('showCentralCampus', propsArray[3]);
	Ti.App.Properties.setString('gpsEnabled', propsArray[4]);
	Ti.App.Properties.setString('unitMi', propsArray[5]);
	

	for(var i = 0, len = oldProps.length; i < len; i++){
		if(oldProps[i] == propsArray[i])
		{
			propsArray[i] = -1;
		}
	}
	Ti.App.fireEvent('settingsChanged', {data: propsArray});
}
