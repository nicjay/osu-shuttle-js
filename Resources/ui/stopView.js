exports.createStopView = function(){
	var win = createWindow();
	return win;
};

exports.setStopView = function(name, times){
	labelStopName.setText(name);
	exports.setStopViewTimes(times);
};

exports.setStopViewTimes = function(times){
	for(var i = 0; i < 4; i++){
		stopTimingLabels[i].setText(times[i]);
	}
};

var blackNight1 = {
	type : 'linear',
	colors : [{
		color : '#0d0d0d',
		position : 0.0
	},{
		color : '#171717',
		position : 1
	}]
};
var blackNight = {
	type : 'linear',
	colors : [{
		//141414
		color : '#333333',
		position : 0.0
	},{
		color : '#474747',
		position : 1
	}]
};

var redStorm = {
	type : 'linear',
	colors : [{
		color : '#000000',
		position : 0.0
	},{
		color : '#450d04',
		position : 0.05
	}, {
		color : '#5d1105',
		position : .25
	}, {
		color : '#751607',
		position : 1
	}]
};

var greenNight = {
	type : 'linear',
	colors : [{
		color : '#020e08',
		position : 0.0
	}, {
		color : '#062415',
		position : .25
	}, {
		color : '#093a22',
		position : 1
	}]
};

var darkMistBlue = {
	type : 'linear',
	colors : [{
		color : '#000000',
		position : 0.0
	}, {
		color : '#FF0000',
		position : 0.1
	}, {
		color : '#272d34',
		position : 1.0
	}]
};

var mistBlue = {
	type : 'linear',
	colors : [{
		color : '#022538',
		position : .0
	}, {
		color : '#06324b',
		position : 1
	}]
};

var mistGreen = {
	type : 'linear',
	colors : [{
		color : '#023830',
		position : .0
	}, {
		color : '#064b42',
		position : 1
	}]
};
var darkMistBlueReversed = {
	type : 'linear',
	colors : [{
		color : '#06324b',
		position : 0.0
	}, {
		color : '#022538',
		position : .9
	}, {
		color : '#010e16',
		position : 1
	}]
}; 

		

var lightSkyBlue = {
	type : 'linear',
	colors : [{
		color : '#035b8d',
		position : .0
	}, {
		color : '#01588e',
		position : 1.0
	}]
};

var defaultColor = {
	type : 'linear',
	colors : [{
		color : '#2D2D2D',
		position : .0
	}, {
		color : '#3b3b3b',
		position : 1.0
	}]
}; 
var defaultColor2 = {
	type : 'linear',
	colors : [{
		color : '#474F57',
		position : .0
	}, {
		color : '#343c45',
		position : 1.0
	}]
}; 
var defaultColor3 = { // *** pretty nice blue
	type : 'linear',
	colors : [{
		color : '#343c45',
		position : .0
	}, {
		color : '#4a5562',
		position : 1.0
	}]
}; 


function createWindow(){
	var settings;
	var color = [['#2D2D2D', '#3b3b3b'], ['#3b3b3b', '#3b3b3b']];
	//			stopNameLabel , "min" labels
	var fontColors = ['#dfe3e7', '#b3bbc5'];
	
	var opacity = .95;
	
	var viewMain = Ti.UI.createView({
		height : '21%', //height : '17%',
		width : '100%',
		opacity : opacity,
		top : 0,
		layout : 'vertical',
		//backgroundGradient: defaultColor2,
		backgroundColor: '#343c45',
	}); 
	

	labelStopName = Ti.UI.createLabel({
		minimumFontSize : '12sp',
		font : {
			fontSize : '22sp',
			fontFamily : boldFont
		},
		text : '',
		color : fontColors[0],//color : '#E0E0E0',
		left : 10,
	}); 

	var buttonSettings = Ti.UI.createButton({
		height : 36,
		width : 36,
		backgroundImage : '../GeneralUI/settingsGear.png',
		backgroundSelectedImage : '../GeneralUI/settingsGearPressed.png',
	}); 
	

	buttonSettings.addEventListener('click', function(e) {
		if (settings == null) {
			settings = require('settings');
		}
		settings.createSettingsWin(props);
	}); 

	var viewTopSection = Ti.UI.createView({
		height : '40%',
		width : '100%',
		layout : 'horizontal',
		//top : -5,
		//backgroundColor: '#022538',

	});

	viewTopSeg1 = Ti.UI.createView({
		width : '85%',
	});

	viewTopSeg2 = Ti.UI.createView({
		width : '15%',
	});

	viewTopSeg1.add(labelStopName);
	viewTopSeg2.add(buttonSettings);
	viewTopSection.add(viewTopSeg1);
	viewTopSection.add(viewTopSeg2);
	

	
	var viewBottomSection = Ti.UI.createView({

		//backgroundGradient : darkMistBlue,
		//backgroundColor: '#272D34',
		//borderColor: '#1b1f23',
		//borderWidth: 1,
		//borderRadius: 15,
		height : '60%',
		width : '100%',
		layout : 'horizontal',
		//top : 5,
	});

	var viewBottomSegs = new Array(4);
	stopTimingLabels = [];
	minuteLabels = [];
	var rando = [];

	for (var i = 0; i < 4; i++) {
		viewBottomSegs[i] = Ti.UI.createView({
			width : '25%',
			layout : 'vertical',
		});

		rando[i] = Math.floor(Math.random() * 15);
		//info("random : " + i + " : " + rando[i]);
		stopTimingLabels[i] = Ti.UI.createLabel({
			font : {
				fontSize : '35sp'
			},
			text : rando[i], //timeConversion(times[i]),
			width : Ti.UI.SIZE,
			height : Ti.UI.SIZE,
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		});

		minuteLabels[i] = Ti.UI.createLabel({
			color: fontColors[1],
			font : {
				fontSize : '15sp'
			},
			text : 'mins', //timeConversion(times[i]),
			width : Ti.UI.SIZE,
			height : Ti.UI.SIZE,
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			top : -5,
		});

		viewBottomSegs[i].add(stopTimingLabels[i]);
		viewBottomSegs[i].add(minuteLabels[i]);
		viewBottomSection.add(viewBottomSegs[i]);
	}

	viewMain.add(viewTopSection);
	viewMain.add(viewBottomSection);

	stopTimingLabels[0].setColor('#7084ff');
	stopTimingLabels[1].setColor('#36c636');
	stopTimingLabels[2].setColor('#ff6600');
	stopTimingLabels[3].setColor('#ffd119');
	
	return viewMain;
}

//Converts seconds to a minute:second string
function timeConversion(time) {
	info("FUNC: timeConversion");
	var timeOutput;
	var min = Math.floor(time / 60);
	var sec = time % 60;

	if (sec < 10)
		timeOutput = min + ':0' + sec;
	else
		timeOutput = min + ':' + sec;

	return timeOutput;
}

