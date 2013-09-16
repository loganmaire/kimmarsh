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

var aSheet = false;

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
		
		
		var kobject = Kinvey.init({
			appKey    : 'kid_VVdDuTJIT9',
			appSecret : '243e2c845960414ebd41c4209c4111d4',
			sync      : { enable: true, online : navigator.onLine }
		});
		
		/*kobject.then(function(activeUser) {
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
	
	if (localStorage.username) {
		$(".username").html(localStorage.username);
		$.ui.loadContent("#main",true,true,"none");
		
	} else {
		$.ui.loadContent("#signin",true,true,"none");
	 
			
	}
	$.ui.clearHistory();
	
});
////////////////////////////////////////// INIT AFUI //////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function(){ 
	$(".popup").hide();
	$.ui.toggleHeaderMenu(false);
	$.ui.backButtonText = "Back";// We override the back button text to always say "Back"
	
	app.initialize();
	
}, false);


$(document).on("click", "#startScan", function(){
	$.ui.showMask("Warming up scanner...");
	var scanner = cordova.require("cordova/plugin/BarcodeScanner");
	
	scanner.scan(
		function (result) {
			$.ui.hideMask();
			
			if(!result.cancelled){
				if(result.text=="wof12-code") {
					alert("W.O.F reminder set for 12 months");
					//push to kinvey;
				} else if (result.text=="wof6-code") {
					alert("W.O.F reminder set for 6 months");
					//push to kinvey;
				} else if(result.text=="ser6-code") {
					alert("Service reminder set for 6 months");
					//push to kinvey;
				} else {
					alert("barcode not recognised");
				}
			} else {
				alert("No barcode returned");
			}
			
		}, 
		function (error) {
			alert("Scanning failed: " + error);
			$.ui.hideMask();
		}
	);
});

$(document).on("click",".signbackin", function(){
	doRegister(true);							   
});

function doRegister(signin) {	
	var conn = checkConnection();
	if(conn=='none') {
		alert("Please enable internet access to continue.");
	} else {
		var val = validate("#form-signin");
		
		if(val) {
			$.ui.showMask("Checking Availability...");
			
			var promise = Kinvey.User.exists($("#userin").val(), {
				success: function(usernameExists) {
					if(usernameExists == false) {
						$.ui.showMask("Registering...");
						var promise = Kinvey.User.signup({
							username : $("#userin").val(),
							password : "0000"
						}, {
							success: function(response) {
								
								var user = Kinvey.getActiveUser();
								user.deviceid = device.uuid;
								var promise = Kinvey.User.update(user,{
									success: function(){
										$.ui.hideMask();
				
										
										localStorage.username = $("#userin").val();
										$(".username").html($("#userin").val());
										
										$(".signin-result").html("").hide();
										
										$.ui.loadContent("#main",true,true,"none");
									},
									error: function(e) {
										alert(e.name);
									}
								});
						
							},
							error: function(error) {
								$(".signin-result").html(error).show();
								$.ui.hideMask();
								$(".signin-loader").hide();
							}
						});
					
					} else {
						if(signin) {
							$.ui.showMask("Signing in...")
							var promise = Kinvey.User.login({
								username : $("#userin").val(),
								password : "0000"
							}, {
								success: function(response) {
									
									var user = Kinvey.getActiveUser();
									user.deviceid = device.uuid;
									var promise = Kinvey.User.update(user,{
										success: function(){
											$.ui.hideMask();
					
											
											localStorage.username = $("#userin").val();
											$(".username").html($("#userin").val());
											
											$(".signin-result").html("").hide();
											
											$.ui.loadContent("#main",true,true,"none");
										},
										error: function(e) {
											alert(e.name);
										}
									});
							
								},
								error: function(error) {
									$(".signin-result").html(error).show();
									$.ui.hideMask();
									$(".signin-loader").hide();
								}
							});
						} else {
							$.ui.hideMask();
							$(".signin-result").html("This username is already taken. Please choose another username.").show();
						}
					}
				}
			});
		}
	}
}

function doExit() {
	
	localStorage.removeItem('username');
	aSheet.hideSheet();
	aSheet = false;
	//navigator.app.exitApp();
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
 