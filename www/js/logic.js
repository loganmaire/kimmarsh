//navigator.splashscreen.hide();
/////////////////////// FOR DESKTOP BROWSER SIM ONLY//////////////////////////
if (!((window.DocumentTouch && document instanceof DocumentTouch) || 'ontouchstart' in window)) {
	var script = document.createElement("script");
	script.src = "frameworks/appframework/plugins/af.desktopBrowsers.js";
	var tag = $("head").append(script);
	$.os.android = true; //let's make it run like an android device
	$.os.desktop = true;
}
////////////////////////////////////////////////////////////////////////////////

var appIsSet = false;

$.ui.autoLaunch = false; //By default, it is set to true and you're app will run right away.  We set it to false to show a splashscreen

var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	
	
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
		
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	//################################################# DEVICE READY ###############################################################
	//##############################################################################################################################
	onDeviceReady: function() {
		//navigator.splashscreen.hide();
		
		/*var kobject = Kinvey.init({
			appKey    : 'kid_Per-Irzvrf',
			appSecret : '637fa5fb52634346bb41f8c979244956',
			sync      : { enable: true, online : navigator.onLine }
		});
		
		kobject.then(function(activeUser) {
			var user = Kinvey.getActiveUser();
			var promise = Kinvey.User.me({
				success: function(response) {
					haveUser=true;
					$(".user-name").html(response.first_name);
					$.ui.launch();
				},
				error: function(e) {
					haveUser=false;
					$.ui.launch();
				}
			});
	
		});*/
		$.ui.launch();

		
		/////////////// HANDLE BACK BUTTON ////////////////
		document.addEventListener("backbutton", function(e){// Listen for back button on android
			/*if($.mobile.activePage.is('#start') || $.mobile.activePage.is('#signin')){//query exit if back button pushed on start page
				e.preventDefault();
	
				if($(".toast").length) {
					navigator.app.exitApp();
				} else {
					toast("press back again to exit");
				}
			} else if ($.mobile.activePage.is('#audit')){
				//change to start page
				
			} else {
				navigator.app.backHistory()
			}*/
		}, false);
		
		document.addEventListener("menubutton", function(e){
			e.preventDefault();
			if(aSheet == false) {
				aSheet = $.ui.actionsheet("<a href='javascript:doExit();' class='button block icon close'>Exit</a>")
			} else {
				aSheet.hideSheet();
				aSheet = false;
			}
		}, false);
	}
}//---------------------------------------- end app class --------------------------------------------------

$.ui.ready(function () {
	$.ui.removeFooterMenu();
	
	if (localStorage.myname) {
			alert(localStorage.myname)
		} else {
			alert("NO LS");	
		}
	/*if(haveUser == false) {
		$.ui.loadContent("#signin",true,true,"none");
		 
		$.ui.clearHistory();
	} else {
		initStartPage();
		$.ui.loadContent("#main",true,true,"none");
		 
		$.ui.clearHistory();
	}*/
});
////////////////////////////////////////// INIT AFUI //////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function(){ 
	$(".popup").hide();
	$.ui.toggleHeaderMenu(false);
	$.ui.backButtonText = "Back";// We override the back button text to always say "Back"
	
	app.initialize();
	
}, false);


$(document).on("click", "#startBooking", function(){
	localStorage.myname = "logan";
	alert("SET");
});

function doExit() {

	navigator.app.exitApp();
}


function initStartPage(){
	$.ui.showMask("Fetching Buildings...");
	$("#b-list").html("");
	
	var user = Kinvey.getActiveUser();
	var promise = Kinvey.DataStore.find('Buildings', null, {
		success : function(building) {
			console.log(building);
			var listCreated = false;
			$.each(building, function(i,val){
				if(!listCreated){
					$(".b-list").append("<ul id='b-list' class='list inset'></ul>");
					listCreated = true;

				}
				$("#b-list").append("<li class='b"+ building[i]._id +"'><a  data-building='"+building[i].Name+"' data-bid='"+ building[i]._id +"' data-user='"+user.first_name+" "+user.last_name+"' class='doaudit'>"+building[i].Name+"</a></li>");

			});
			
			$.ui.hideMask();
					
			getChapelFromGeo();
		}
	}, function(error){
		toast("Error fetching Buildings");
	});	
};

function getChapelFromGeo() {

	navigator.geolocation.getCurrentPosition(function(loc) {
		
		var coord = [loc.coords.longitude, loc.coords.latitude];
		
		// Query for chapels close by.
		var query = new Kinvey.Query();
		query.near('_geoloc', coord, 5);
		
		var promise = Kinvey.DataStore.find('Buildings', query, {
			success : function(response) {
				$("#location-status").html("Location: "+ parseFloat(coord[0]).toFixed(5)+":"+parseFloat(coord[1]).toFixed(5));
				$(".b"+response[0]._id).addClass('local-building');
				$(".b"+response[0]._id + " a").append('<span class="af-badge tr">Closest</span>');
			}
		}, function(error){
			console.log("kinvey location error");
		});
	}, function(error){
		console.log ("phonegap location error");
		$("#location-status").html("Location unavailable");
	},
	{ maximumAge: 30000, timeout: 6000, enableHighAccuracy: true }
	);	
	
}


function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'none';

    return states[networkState];
}

///////////////////////////////////// VALIDATION /////////////////////////////////////////////
function validate(form) {

	$(".error").remove();
	var errors = 0;
	var imps = $(form+" .required");
	
	$.each(imps, function(int, val){
		
		if(int < imps.length){
			val= $(val);
		
			if(!val.val()) {
				errors ++;
				$("<span class='error af-badge tr'>This field is required</span>").insertAfter(val);
			} else if(val.attr("data-minlen")) {
				if(val.val().length < val.attr("data-minlen")) {
					errors ++;
					$("<span class='error af-badge tr'>Must be "+val.attr("data-minlen")+" characters min</span>").insertAfter(val);
				}
			}
		}
		
	});
	
	if(errors ==0) {
		return true;
	} else {
		return false;
	}
	
}

function inArray(value, array) {
  return array.indexOf(value) > -1 ? true : false;
}

///////////////////////////////////// TOAST FUNCTION /////////////////////////////////////////
function toast(msg){
	$.ui.showMask(msg);
	setTimeout(
		$.ui.hideMask(),
	1200)
}
 