//===========================================================================================
//===========================================================================================
//Settings view
//===========================================================================================
//===========================================================================================

//Ti.API.info("In Settings!");
var oldProps;

var mainSettingsWin, mainScrollView, mainContainer;

var view0, settingsLabel, closeSettingsButton, view1, routeToggleLabel, view2, gpsToggleLabel, gpsToggleButton, view3, feedbackLabel;
var feedbackEmail, feedbackSendButton, view6, unitLabel, unitToggle;
var view5, pickerBaseMap;
var view4, checkboxShowTable;
var routeToggleA, routeToggleB, routeToggleC, routeToggleD;


//===========================================================================================

exports.createSettingsWin = function(props){
	oldProps = props;
	createWindow(props);
};

function createWindow(props){
	mainSettingsWin = Ti.UI.createWindow({
		layout: 'vertical',
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
	
	mainScrollView = Ti.UI.createScrollView({
		height: Ti.UI.FILL,
		width: '100%',
		layout: 'vertical',
		showVerticalScrollIndicator: true,
		scrollType: 'vertical',
		contentHeight: 'auto',
		
	});
	
	mainContainer = Ti.UI.createView({
		height: '100%',
		width: '100%',
		layout: 'vertical',
	});
	
	view0 = Ti.UI.createView({
		height: Ti.UI.SIZE,
		backgroundGradient: {
			type:'linear',
			//colors:[{color:'#2370a1', position:0.0},{color:'#09557c', position: 1.0}]
			colors:[{color:'#36588D', position:0.0},{color:'#1F4F9B', position: 1.0}]
		},
	}); 
	
	view0.add(Ti.UI.createLabel({
		font:{fontSize:22},
		color: '#FFEEDB',
		text: 'Settings',
		left: 10,
		top: 15,
		bottom: 15,
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
	
	routeToggleLabel = Ti.UI.createLabel({
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
		height: Ti.UI.SIZE,
		top: 10,
		bottom: 10,
		
	});
	checkboxShowTable = Ti.UI.createSwitch({
		font: {fontSize: 20},
		color: '#FFEEDB',
		style: Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Show table on startup',
		value: props[6],
	});
	
	view4.add(checkboxShowTable);

//===========================================================================================

	view5 = Ti.UI.createView({
		width: '100%',
		height: Ti.UI.SIZE,
		top: 10,
		bottom: 10,
	});
	
	pickerBaseMap = Ti.UI.createPicker({
	});
	
	var pickerData = [];
	pickerData[0] = Ti.UI.createPickerRow({title:'osm'});
	pickerData[1] = Ti.UI.createPickerRow({title:'streets'});
	pickerData[2] = Ti.UI.createPickerRow({title:'satellite'});
	pickerData[3] = Ti.UI.createPickerRow({title:'hybrid'});
	pickerData[4] = Ti.UI.createPickerRow({title:'topo'});
	pickerData[5] = Ti.UI.createPickerRow({title:'gray'});
	pickerData[6] = Ti.UI.createPickerRow({title:'oceans'});
	pickerData[7] = Ti.UI.createPickerRow({title:'national-geographic'});
	
	pickerBaseMap.add(pickerData);
	
	view5.add(pickerBaseMap);


//===========================================================================================
	view6 = Ti.UI.createView({
		width: '100%',
		height: Ti.UI.SIZE,
		layout: 'vertical',
		top: 10,
		bottom: 10,
	});
	
	innerView6B = Ti.UI.createView({
		height: Ti.UI.SIZE,
	});
	
	feedbackLabel = Ti.UI.createLabel({
		font: {fontSize: 20},
		color: '#FFEEDB',
		//width: '100%',
		text: 'Help Improve the App!',
	});
	
	innerView6 = Ti.UI.createView({
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
	
	innerView6B.add(feedbackLabel);
	innerView6.add(feedbackSendButton);
	view6.add(innerView6B);
	view6.add(innerView6);
//===========================================================================================
	
	
	
	// mainSettingsWin.add(view0);
	// mainSettingsWin.add(view1);
	// mainSettingsWin.add(view2);
	// mainSettingsWin.add(view3);
	// mainSettingsWin.add(view4);
	// mainSettingsWin.add(view5);
		
	mainSettingsWin.add(view0);
	mainScrollView.add(view1);
	mainScrollView.add(view2);
	mainScrollView.add(view3);
	mainScrollView.add(view4);
	mainScrollView.add(view5);
	mainScrollView.add(view6);

	mainSettingsWin.add(mainScrollView);
	mainSettingsWin.open();
	
	switch(props[7]){
		case 'osm':
			pickerBaseMap.setSelectedRow(0, 0, false);
			break;
		case 'streets':
			pickerBaseMap.setSelectedRow(0, 1, false);
			break;
		case 'satellite':
			pickerBaseMap.setSelectedRow(0, 2, false);
			break;
		case 'hybrid':
			pickerBaseMap.setSelectedRow(0, 3, false);
			break;
		case 'topo':
			pickerBaseMap.setSelectedRow(0, 4, false);
			break;
		case 'gray':
			pickerBaseMap.setSelectedRow(0, 5, false);
			break;
		case 'oceans':
			pickerBaseMap.setSelectedRow(0, 6, false);
			break;
		case 'national-geographic':
			pickerBaseMap.setSelectedRow(0, 7, false);			
			break;

	}
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
	var propsArray = [routeToggleA.getValue(), routeToggleB.getValue(), routeToggleC.getValue(), routeToggleD.getValue(), 
		gpsToggleButton.getValue(), unitToggle.getValue(), checkboxShowTable.getValue(), pickerBaseMap.getSelectedRow(0).title];
	
	Ti.API.info("pickerBaseMap value: " + pickerBaseMap.getSelectedRow(0).title);
	
	Ti.App.Properties.setString('showExpress', propsArray[0]);
	Ti.App.Properties.setString('showSouthCentral', propsArray[1]);
	Ti.App.Properties.setString('showNorthCentral', propsArray[2]);
	Ti.App.Properties.setString('showCentralCampus', propsArray[3]);
	Ti.App.Properties.setString('gpsEnabled', propsArray[4]);
	Ti.App.Properties.setString('unitMi', propsArray[5]);
	Ti.App.Properties.setString('showTable', propsArray[6]);
	Ti.App.Properties.setString('basemap', propsArray[7]);
	

	for(var i = 0, len = oldProps.length; i < len; i++){
		if(oldProps[i] == propsArray[i])
		{
			propsArray[i] = -1;
		}
	}
	Ti.App.fireEvent('settingsChanged', {data: propsArray});
}
