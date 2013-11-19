   var userid = "";
   var accessToken = "";
   		window.fbAsyncInit = function() {
                FB.init({appId: '532750203418042', status: true,cookie: true, xfbml: true});
 
                /* All the events registered */
                FB.Event.subscribe('auth.login', function(response) {
                    // do something with response
                    trace("FB Event auth login");
                });
                FB.Event.subscribe('auth.logout', function(response) {
                    // do something with response
                     trace("FB Event auth logout");
                });
 
                FB.getLoginStatus(function(response) {
					  if (response.status === 'connected') {
					    // the user is logged in and has authenticated your
					    // app, and response.authResponse supplies
					    // the user's ID, a valid access token, a signed
					    // request, and the time the access token 
					    // and signed request each expire
					    userid= response.authResponse.userID;
					    accessToken = response.authResponse.accessToken;
					    
					  } else if (response.status === 'not_authorized') {
					    trace("User Logged In but not Authorized");
						$('.loading').hide();
						$('.votebtns').show();
					  } else {
					    // the user isn't logged in to Facebook.
					    trace("User is not Logged In");
					  }
				});
				//FB.Canvas.setSize({ width: 810, height: 750 });
				//FB.Canvas.setSize();
            };
            (function() {
                var e = document.createElement('script');
                e.type = 'text/javascript';
                e.src = document.location.protocol +
                    '//connect.facebook.net/en_US/all.js';
                e.async = true;
                document.getElementById('fb-root').appendChild(e);
            }());



   function FBLogin()
   {
		if (userid == "")
		{
			FB.login(function(response) {
			   if (response.authResponse) {
					trace('Welcome!  Fetching your information.... ');
					accessToken = response.authResponse.accessToken;
					getAlbums();
			   } else {
					trace('User cancelled login or did not fully authorize.');
			   }
			}, {scope: 'email,user_photos'});
		}else{			
			getAlbums();	
		}
   }

	function trace(msg){
		console.log(msg);
	}
	
	function cancelMessage(){
		$('#jfmps-container').fadeOut();
	}
	
	
	function getAlbums() {
	  FB.api('/me', function(response) {
		 $("#jfmps-container").jfmps({ 
			  max_selected: 5, 
			  max_selected_message: "{0} of {1} selected",
			  sorter: function(a, b) {
				var x = a.last_name.toLowerCase();
				var y = b.last_name.toLowerCase();
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			  }
		  });
		  $("#jfmps-container").bind("jfmps.photoload.finished", function() { 
			  window.console && console.log("finished loading!"); 
		  });
		  $("#jfmps-container").bind("jfmps.selection.changed", function(e, data) { 
			  window.console && console.log("changed", data);
		  });                     
		  
		  $('#jfmps-container').fadeIn();
	  });
	}
