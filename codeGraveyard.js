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
}

		
/*//FUNCTION : Adjusts tableView upon map click. Scrolls to chosen stop.
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
	
}*/
