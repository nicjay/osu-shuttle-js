
						/*//Clear the outdated positions
			map.graphics.remove(GS1);
			map.graphics.remove(GS2);
			map.graphics.remove(GS3);
			*/
			/*
    				//Set up the point coordinates
       				Shuttle1 = new esri.geometry.Point({
  								latitude: shuttleData[0][1],
  								longitude: shuttleData[0][2]
								});
										

					Shuttle2 = new esri.geometry.Point({
  								latitude: shuttleData[1][1],
  								longitude: shuttleData[1][2]
								});
				
					Shuttle3 = new esri.geometry.Point({
  								latitude: shuttleData[2][1],
  								longitude: shuttleData[2][2]
								});
								
        			ShuttleMarkerSymbol1.setAngle(shuttleData[0][3]);
        			ShuttleMarkerSymbol2.setAngle(shuttleData[1][3]);
        			ShuttleMarkerSymbol3.setAngle(shuttleData[2][3]);
        			
       				GS3 = new Graphic(Shuttle1, ShuttleMarkerSymbol1);
       				GS2 = new Graphic(Shuttle2, ShuttleMarkerSymbol2);
					GS1 = new Graphic(Shuttle3, ShuttleMarkerSymbol3);
  
  					if (enableNorth){
       					map.graphics.add(GS1);
       				}
       				
       				if (enableSouth){
       					map.graphics.add(GS2);
       				}
       				
       				if (enableExpress){
       					map.graphics.add(GS3);
       				} */


		//Want to wait until map is started and ready before doing this stuff
		/*
		Ti.App.addEventListener('maploaded', function(){
			Ti.API.info("--Map Loaded--");
			updateRouteEstimates();
			shuttleLocRequest();
			
			if(deviceGPSOn){
				diffArray = findNearest(userGPS);
				updateTable(diffArray);
			} else{
				updateTable(-1);;
			}
			updateSelected();
			setBackupShuttleData();
			Ti.App.fireEvent("updatemap", {data: [shuttlecoords, heading]});

			
		});
		*/


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

var toggleMenu = Ti.UI.createView({
    width:'auto',
    height:'auto',
    //bottom:0,
    //left: 0,
    //right: 0,
    backgroundColor:'#373737',
    borderColor: '#111111',
    borderWidth: 5,
    borderRadius: 0,
    bottom: 0,
    layout: 'horizontal',
});

var toggleMenus = new Array(4);
	for (var i=0;i<4;i++){
		toggleMenus[i] = Ti.UI.createView({
	    width:'50%',
	    height:'50%',
	    borderColor: '#111111',
	    borderWidth: 5,
	});
	
	toggleMenu.add(toggleMenus[i]);
}

toggleMenus[0].setBackgroundImage('GeneralUI/toggleBgOrange.png');
toggleMenus[1].setBackgroundImage('GeneralUI/toggleBgBlue.png');
toggleMenus[2].setBackgroundImage('GeneralUI/toggleBgGreen.png');
toggleMenus[3].setBackgroundImage('GeneralUI/toggleBgYellow.png');


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


map.graphics.on("click", myGraphicsClickHandler);
	        		function myGraphicsClickHandler(evt) {
	    				if(clickProcessing == false){
		    				Ti.API.info("Click sent...");
		    				clickProcessing = true;
		    				var obj = evt.graphic.attributes;
		    				var str = JSON.stringify(obj);
		    				//Ti.App.fireEvent("adjustTable", {data: [obj.StopId]});
		    				setTimeout(function(){ clickProcessing = false; }, 1500);
	    				}
	    				else{
	    					Ti.API.info("______Click Skipped...");
	    				}
	  				}

