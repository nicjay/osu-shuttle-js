//===========================================================================================
//===========================================================================================
//Settings view
//===========================================================================================
//===========================================================================================

exports.createSettingsWin = function(props){
	createWindow(props);
};

function createWindow(props){
	Ti.API.info('opacityArray[0]' + " : " + opacityArray[0]);
	
	var mainSettingsWin = Ti.UI.createWindow({
		layout: 'vertical',
		width: '100%',
		height: '100%',
		navBarHidden:true,
		orientationModes : [Titanium.UI.PORTRAIT],
		//backgroundColor: '#FFFFFF',
		backgroundGradient: {
			type:'linear',
			//colors:[{color:'#656968', position:0.0},{color:'#3a3c3b', position: 1.0}]
			colors:[{color:'#3b3b3b', position:0.0},{color:'#3b3b3b', position: 1.0}]
		},
	});
	
	var mainScrollView = Ti.UI.createScrollView({
		height: Ti.UI.FILL,
		width: '100%',
		layout: 'vertical',
		showVerticalScrollIndicator: true,
		scrollType: 'vertical',
		contentHeight: 'auto',
		
	});
	
	var mainContainer = Ti.UI.createView({
		height: '100%',
		width: '100%',
		layout: 'vertical',
	});
	
	var view0 = Ti.UI.createView({
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
	
	var closeSettingsButton = Ti.UI.createButton({
		//backgroundImage: '../GeneralUI/settingsGoBack.png',
		//backgroundSelectedImage: '../GeneralUI/settingsGoBackPressed.png',
		width: 60,//42,
		height: 60,//42,
		right: 0,
		title: '4',
		color: '#f47320',//'#E0E0E0',
		//backgroundColor: '#343c45',
		//backgroundSelectedColor: '#4d5967',
		backgroundColor: 'transparent',
		backgroundSelectedColor: '#3465b2',
		font : {
			fontSize : '30sp',
			fontFamily : iconFont
		},
		borderColor: '#000',
		//borderWidth: 1,
		//borderRadius: 5,
	});
	
	closeSettingsButton.addEventListener('click', function(e){
		var propsNew = [routeToggleA.getValue(), routeToggleB.getValue(), routeToggleC.getValue(), 
						  gpsToggleButton.getValue(), unitToggle.getValue(), checkboxShowTable.getValue(), pickerBasemap.getSelectedRow(0).title, checkboxShowStops.getValue()];
		destroyWindow(mainSettingsWin, propsNew, props);
	});
	
	//view0.add(settingsLabel);
	view0.add(closeSettingsButton);
	
	//===========================================================================================
	
	var view1 = Ti.UI.createView({
		layout: 'horizontal',
		height: Ti.UI.SIZE,
		top: 10,
		bottom: 10,
	});
	
	var innerView1 = Ti.UI.createView({
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
	
	var routeToggleA = Ti.UI.createSwitch({
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
	
	var routeToggleB = Ti.UI.createSwitch({
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
	
	var routeToggleC = Ti.UI.createSwitch({
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

	
	innerView1.add(routeToggleLabel);
	view1.add(innerView1);
	view1.add(routeToggleA);
	view1.add(routeToggleB);
	view1.add(routeToggleC);
	//view1.add(routeToggleD);
	
	//===========================================================================================
	
	var view23 = Ti.UI.createView({
		width: '100%',
		height: Ti.UI.SIZE,
		layout:'horizontal',
	});
	
	var view2 = Ti.UI.createView({
		layout: 'horizontal',
		height: Ti.UI.SIZE,
		width: '50%',
		top: 10,
		bottom: 10,
	});
	
	var innerView2 = Ti.UI.createView({
		height: Ti.UI.SIZE,
	});
	var innerView2B = Ti.UI.createView({
		height: Ti.UI.SIZE,
	});
	
	var gpsToggleLabel = Ti.UI.createLabel({
		font: {fontSize: 20},
		color: '#FFEEDB',
		text: "User GPS",
	});
	
	var gpsToggleButton = Ti.UI.createSwitch({
		style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
		font: {fontsize: 16},
		value: props[3],
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

	var view3 = Ti.UI.createView({
		height: Ti.UI.SIZE,
		width: '50%',
		layout: 'horizontal',
		top: 10,
		bottom: 10,
	});
	
	var innerView3 = Ti.UI.createView({
		width: '100%',
		height: Ti.UI.SIZE,
	});
	var innerView3B = Ti.UI.createView({
		height: Ti.UI.SIZE,
	});
	
	var unitLabel = Ti.UI.createLabel({
		font: {fontSize: 20},
		color: '#FFEEDB',
		text: "Distance Unit",
	});
	
	var unitToggle = Ti.UI.createSwitch({
	  style: Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
	  font:{fontSize:16,fontFamily:'Helvetica Neue'},
	  value: props[4],
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

	view23.add(view2);
	view23.add(view3);

//===========================================================================================
	var view4 = Ti.UI.createView({
		width: '100%',
		height: Ti.UI.SIZE,
		top: 10,
		bottom: 10,
		
	});
	var checkboxShowTable = Ti.UI.createSwitch({
		font: {fontSize: 20},
		color: '#FFEEDB',
		style: Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Show table on startup',
		value: props[5],
	});
	
	view4.add(checkboxShowTable);

//===========================================================================================
	var view7 = Ti.UI.createView({
		width: '100%',
		height: Ti.UI.SIZE,
		top: 10,
		bottom: 10,
		
	});
	var checkboxShowStops = Ti.UI.createSwitch({
		font: {fontSize: 20},
		color: '#FFEEDB',
		style: Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Show stops',
		value: props[7],
	});
	
	view7.add(checkboxShowStops);

//===========================================================================================

	var view5 = Ti.UI.createView({
		width: '100%',
		layout: 'horizontal',
		height: Ti.UI.SIZE,
		top: 10,
		bottom: 10,
	});
	
	var pickerLabel = Ti.UI.createLabel({
		font: {fontSize: 20},
		color: '#FFEEDB',
		text: "Map Style",
		width: '50%',
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
	});
	
	var pickerBasemap = Ti.UI.createPicker({
		width: '40%',
		left: '5%',
	});
	
	var pickerData = [];
	pickerData[0] = Ti.UI.createPickerRow({title:'osm'});
	pickerData[1] = Ti.UI.createPickerRow({title:'satellite'});
	pickerData[2] = Ti.UI.createPickerRow({title:'natural'});
	pickerData[3] = Ti.UI.createPickerRow({title:'gray'});
	
	pickerBasemap.add(pickerData);
	
	view5.add(pickerLabel);
	view5.add(pickerBasemap);


//===========================================================================================
	var view6 = Ti.UI.createView({
		width: '100%',
		height: Ti.UI.SIZE,
		layout: 'vertical',
		top: 10,
		bottom: 10,
	});
	
	var innerView6B = Ti.UI.createView({
		height: Ti.UI.SIZE,
	});
	
	var feedbackLabel = Ti.UI.createLabel({
		font: {fontSize: 20},
		color: '#FFEEDB',
		//width: '100%',
		text: 'Help Improve the App!',
	});
	
	var innerView6 = Ti.UI.createView({
		//width: '100%',
		height: Ti.UI.SIZE,
	});
	
	var feedbackEmail = Ti.UI.createEmailDialog();
	feedbackEmail.subject = "BeaverBus App Feedback";
	feedbackEmail.toRecipients = ['sellers.kevin@gmail.com'];
	
	var feedbackSendButton = Ti.UI.createButton({
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
		
	mainSettingsWin.add(view0);
	mainScrollView.add(view1);
	mainScrollView.add(view23);
	mainScrollView.add(view4);
	mainScrollView.add(view7);
	mainScrollView.add(view5);
	mainScrollView.add(view6);

	mainSettingsWin.add(mainScrollView);
	mainSettingsWin.open();
	
	switch(props[6]){
		case 'osm':
			pickerBasemap.setSelectedRow(0, 0, false);
			break;
		case 'satellite':
			pickerBasemap.setSelectedRow(0, 1, false);
			break;
		case 'natural':
			pickerBasemap.setSelectedRow(0, 2, false);			
			break;
		case 'gray':
			pickerBasemap.setSelectedRow(0, 3, false);
			break;

	}
}

function destroyWindow(win, props, oldProps){
	setProperties(props, oldProps);
	win.close();
	win = null;
}

function setProperties(propsArray, oldProps){
	Ti.App.Properties.setString('showExpress', propsArray[0]);
	Ti.App.Properties.setString('showSouthCentral', propsArray[1]);
	Ti.App.Properties.setString('showNorthCentral', propsArray[2]);
	Ti.App.Properties.setString('gpsEnabled', propsArray[3]);
	Ti.App.Properties.setString('unitMi', propsArray[4]);
	Ti.App.Properties.setString('showTable', propsArray[5]);
	Ti.App.Properties.setString('basemap', propsArray[6]);
	Ti.App.Properties.setString('stopsVisible', propsArray[7]);

	for(var i = 0, len = oldProps.length; i < len; i++){
		if(oldProps[i] == propsArray[i])
		{
			propsArray[i] = -1;
		}
	}
	Ti.App.fireEvent('settingsChanged', {data: propsArray});
}
