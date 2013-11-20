jquery-facebook-multi-photo-selector
===================================

Overview
--------

Easily integrate an option for user to select photos from Facebook Albums. This plugin is built over Mike Brevoort's awesome jquery-facebook-multi-friend-selector, it uses Facebook Javascript API to fetch user albums and photos.
Check out the demo [here](https://www.adevole.com/products/fbalbums/) 

The look and feel can be easily costomized from the CSS file.

How to use it
-------------

The plugin requires jquery, so you need to include jquery:

		<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>

The plugin depends on the Facebook Javascript API, fbjs.js file has code required for facebook integration, so you have to include it:

		<script src="fbjs.js"></script>

Function FBLogin() inside fbjs.js takes care of Facebook authentication from user.

For Facebook API, you also need to include a div#fb-root in your html

		<div id="fb-root"></div>
		
To hold our photo selector container we need a div.

		<div id="jfmps-container"></div> 	

Once you have user logged in, you can load users photos in a container like this:

		$("#jfmps-container").jfmps();

This should fetch the current users albums and give you the interface to choose albums. You can select album to view photos within that album.
To fetch data when user clicks on Cancel or Done you can use following function.

		  var photoSelector  = $("#jfmps-container").data('jfmps');
		  var selectedPhotosArray = photoSelector.getSelectedPhotos();
		  var selectedPhotos = "";
		  for(var i =0; i < selectedPhotosArray.length ; i++){
			selectedPhotos = selectedPhotos + selectedPhotosArray[i] + ",";
		  }

		  
Options
-------
These options can be passed into the jfmps function with a map of options like jfmfs({key1: val, key2: val})

* max_selected: int (optional)- max number of items that can be selected
* labels: object with i18n labels for translations. If you pass this, you need to define all of the labels.

		labels: {
			selected: "Selected",
			filter_default: "Album Name",
			filter_title: "Search By Albums Names:",
			all: "All",
			max_selected_message: "{0} of {1} selected"
		}

Events
------
jfmfs.friendload.finished - triggered on the container when the list of albums is finished loading

		$("#jfmfs-container").bind("jfmfs.photoload.finished", function() { 
		    alert("finished loaded!"); 
		});

jfmfs.selection.changed - triggered on the container when a selection has changed with an array of selected photos urls.

		$("#jfmfs-container").bind("jfmfs.selection.changed", function(e, data) { 
		    console.log("changed", data);
		});                     
