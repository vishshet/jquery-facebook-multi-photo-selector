// Copyright 2013 Vishwesh Shett http://www.vishweshshetty.com @vishshet
// 
// v1.0 jquery-facebook-multi-photo-selector
// 
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
// 
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

// This plugin has been developed upon jquery-facebook-multi-friend-selector
// developed by awesome Mike Brevoort.

// Copyright 2010 Mike Brevoort http://mike.brevoort.com @mbrevoort
// 
// v5.0 jquery-facebook-multi-friend-selector
// 
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
// 
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
   
(function($) { 
    var JFMPS = function(element, options) {
        var elem = $(element),
            obj = this,
            uninitializedAlbumElements = [], // for album cover image that are initialized
            keyUpTimer,
            albums_per_row = 0,
            albums_height_px = 0,
            albums_first_element_offset_px = 0;
			photos_per_row = 0,
            photos_height_px  = 0,
            photos_first_element_offset_px = 0;
            
        var settings = $.extend({
            max_selected: -1,
            max_selected_message: "{0} of {1} selected",
			photo_fields: "id,name",
			sorter: function(a, b) {
                var x = a.name.toLowerCase();
                var y = b.name.toLowerCase();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            },
			labels: {
				selected: "Selected",
				filter_default: "",
				filter_title: "Search By Albums Names:",
				all: "All",
				max_selected_message: "{0} of {1} selected"
			}
        }, options || {});
        var lastSelected;  // used when shift-click is performed to know where to start from to select multiple elements
               
        // ----------+----------+----------+----------+----------+----------+----------+
        // Initialization of container
        // ----------+----------+----------+----------+----------+----------+----------+
        elem.html(
            "<div id='jfmps-photo-selector'>" +
            "    <div id='jfmps-inner-header'>" +
            "        <span class='jfmps-title'>" + settings.labels.filter_title + " </span><input type='text' id='jfmps-photo-filter-text' value='" + settings.labels.filter_default + "'/>" +
            "        <a class='filter-link selected' id='jfmps-filter-all' href='#'>" + settings.labels.all + "</a>" +
            "        <a class='filter-link' id='jfmps-filter-selected' href='#'>" + settings.labels.selected + " (<span id='jfmps-selected-count'>0</span>)</a>" +
            ((settings.max_selected > 0) ? "<div id='jfmps-max-selected-wrapper'></div>" : "") +
            "    </div>" +
			"        <div id='jfmps-second-inner-header'><a  href='#' class='filter-link disabled' id='jfmps-backtoalbums'> Back to Albums</a></div>" +
            "    <div id='jfmps-photo-container'></div>" +
            "    <div id='basetool'><input type='button' value='Done' id='sendbtn' onclick='sendMessage()'/><input type='button' value='Cancel' id='cancelbtn' onclick='cancelMessage()'/></div>" +
            "</div>" 
        ); 
        
        var photo_container = $("#jfmps-photo-container"),    // Albums/Photos Containet
            container = $("#jfmps-photo-selector"),				//  Main Container
			all_albums,
			all_photos;
           
		// Fetch and loop through all ablums 
        FB.api('/me/albums', function(response) {
		 console.log(response);
           var sortedFriendData = "",
                preselectedFriends = {},
                buffer = [],
			    selectedClass = "";
            
            $.each(response.data, function(i, album) {					
	                buffer.push("<div class='jfmps-albums" + selectedClass + " ' id='" + album.id  +"'><img/><div class='photo-name'>" + album.name + "</div></div>");            
	                buffer.push("<div class='jfmps-single-photo-container' id='jfmps-album" + album.id  +"'></div>");      // container to push p      
            });
            photo_container.append(buffer.join(""));
             
			// The cover pic of an album is visible only when it comes within the viewport 
			 
            uninitializedAlbumElements = $(".jfmps-albums", elem);            
            uninitializedAlbumElements.bind('inview', function (event, visible) {
                if( $(this).find('img').attr('src') === undefined) {
                    $(this).find('img').attr("src", "//graph.facebook.com/" + this.id + "/picture?access_token="+accessToken);
                }
                $(this).unbind('inview');
            });
            
            init();
        });
        
        
        // ----------+----------+----------+----------+----------+----------+----------+
        // Public functions
        // ----------+----------+----------+----------+----------+----------+----------+
        
        this.getSelectedIds = function() {
            var ids = [];
            $.each(elem.find(".jfmps-albums.selected"), function(i, photo) {
                ids.push($(photo).attr("id"));
            });
            return ids;
        };
        
        this.getSelectedIdsAndNames = function() {
            var selected = [];
            $.each(elem.find(".jfmps-albums.selected"), function(i, photo) {
                selected.push( {id: $(photo).attr("id"), name: $(photo).find(".photo-name").text()});
            });
            return selected;
        };
        
        this.clearSelected = function () {
            all_photos.removeClass("selected");
        };
        
        // ----------+----------+----------+----------+----------+----------+----------+
        // Private functions
        // ----------+----------+----------+----------+----------+----------+----------+
        
        var init = function() {
            all_albums = $(".jfmps-albums", elem);
            
            // calculate albums per row
            albums_first_element_offset_px = all_albums.first().offset().top;
            for(var i=0, l=all_albums.length; i < l; i++ ) {
                if($(all_albums[i]).offset().top === albums_first_element_offset_px) {
                    albums_per_row++;
                } else {
                    albums_height_px = $(all_albums[i]).offset().top - albums_first_element_offset_px;
                    break;
                }
            }
			           		
			
			elem.delegate(".jfmps-albums", 'click', function(event) {
                // if the element is being selected, test if the max number of items have
                albumid = $(this).attr('id');
				$('.jfmps-albums').fadeOut();			
				console.log($("#jfmps-backtoalbums").removeClass("disabled"));
				// Check if photos already fetched for a given album
				if($('#jfmps-album'+albumid).html().trim() == ""){
					FB.api("/"+albumid+"/photos?access_token="+accessToken,function(response){
						console.log(response);
						var photos = response["data"];
						for(var v=0;v<photos.length;v++) {
						
							//this is for the small picture that comes in the second column
							var imagediv = '<div class="jfmps-photo-single"><img alt="'+photos[v]["source"]+'" class="jfmps-photo-img"/></div>';
							$('#jfmps-album'+albumid).append(imagediv);
							if(v+1 == photos.length){
								//Check if photos per row is already calculated
								if(photos_per_row == 0){
									all_photos = $(".jfmps-photo-single", elem);
									
									// calculate photos per row within an album
									photos_first_element_offset_px = all_photos.first().offset().top;
									for(var i=0, l=all_photos.length; i < l; i++ ) {
										if($(all_photos[i]).offset().top === photos_first_element_offset_px) {
											photos_per_row++;
										} else {
											photos_height_px = $(all_photos[i]).offset().top - photos_first_element_offset_px;
											break;
										}
									}
								}
								
								// add hover effects on photos
								$(".jfmps-photo-single:not(.selected)").hover(
								  function() {
									$( this ).addClass("hover");
								  }, function() {
									$( this ).removeClass( "hover" );
								  }
								);
								
								// When a photo is clicked
								 $('#jfmps-album'+albumid).find(".jfmps-photo-single").click(function(event) {
									
									var onlyOne = settings.max_selected === 1,
										isSelected = $(this).hasClass("selected"),
										isMaxSelected = $(".jfmps-photo-single.selected").length >= settings.max_selected,
										alreadySelected = photo_container.find(".selected").attr('id') === $(this).attr('id');
									
									// if the element is being selected, test if the max number of items have
									// already been selected, if so, just return
									if(!onlyOne && !isSelected && maxSelectedEnabled() && isMaxSelected)
										return
										
									// if the max is 1 then unselect the current and select the new    
									if(onlyOne && !alreadySelected) {
										photo_container.find(".selected").removeClass("selected");                    
									}
										
									$(this).toggleClass("selected");
									$(this).removeClass("hover");
									
									// support shift-click operations to select multiple items at a time
									if( $(this).hasClass("selected") ) {
										if ( !lastSelected ) {
											lastSelected = $(this);
										} 
										else {                        
											if( event.shiftKey ) {
												var selIndex = $(this).index(),
													lastIndex = lastSelected.index(),
													end = Math.max(selIndex,lastIndex),
													start = Math.min(selIndex,lastIndex);
													
												for(var i=start; i<=end; i++) {
													var aFriend = $( all_photos[i] );
													if(!aFriend.hasClass("hide-non-selected") && !aFriend.hasClass("hide-filtered")) {
														if( maxSelectedEnabled() && $(".jfmps-photo-single.selected").length < settings.max_selected ) {
															$( all_photos[i] ).addClass("selected");                                        
														}
													}
												}
											}
										}
									}
									
									// keep track of last selected, this is used for the shift-select functionality
									lastSelected = $(this);
									
									// update the count of the total number selected
									updateSelectedCount();

									if( maxSelectedEnabled() ) {
										updateMaxSelectedMessage();
									}
									elem.trigger("jfmps.selection.changed", [obj.getSelectedIdsAndNames()]);
								});
							}
						}
						$('#jfmps-album'+albumid).fadeIn();							
						$("#jfmps-backtoalbums").removeClass("disabled");										
						showPhotosInViewPort();
					});          
				}else{
					$('#jfmps-album'+albumid).fadeIn();					
					$("#jfmps-backtoalbums").removeClass("disabled");
					showPhotosInViewPort();
				}
            });

            // filter by selected, hide all non-selected
            $("#jfmps-filter-selected").click(function(event) {
				event.preventDefault();
                $(".jfmps-albums").hide();
                $(".jfmps-single-photo-container").show();
                $(".jfmps-photo-single").not(".selected").addClass("hide-non-selected");
                $(".filter-link").removeClass("selected");
                $(this).addClass("selected");
            });

            // remove filter, show all
            $("#jfmps-filter-all").click(function(event) {
				event.preventDefault();
                $(".jfmps-photo-single").removeClass("hide-non-selected");
				$(".jfmps-single-photo-container").fadeOut();
				$(".jfmps-albums").fadeIn();
                $(".filter-link").removeClass("selected");
                $(this).addClass("selected");
            });

			// go back to albums
            $("#jfmps-backtoalbums").click(function(event) {
				if(!$("#jfmps-backtoalbums").hasClass('disabled')){		
					
					event.preventDefault();				
					$("#jfmps-backtoalbums").addClass("disabled");
					$(".jfmps-single-photo-container").fadeOut();
					$(".jfmps-albums").fadeIn();
				}
            })
            
  
            // filter as you type 
            $("#jfmps-photo-filter-text").keyup( function() {
                    var filter = $(this).val();
					console.log(filter);
                    clearTimeout(keyUpTimer);
                    keyUpTimer = setTimeout( function() {
                        if(filter == '') {
                            all_albums.removeClass("hide-filtered");
                        }
                        else {
                            container.find(".photo-name:not(:Contains(" + filter +"))").parent().addClass("hide-filtered");
                            container.find(".photo-name:Contains(" + filter +")").parent().removeClass("hide-filtered");                         
                        }    
                        showAlbumsInViewPort();                        
                    }, 400);
                })
                .focus( function() {
                    if($.trim($(this).val()) == 'Start typing a name') {
                        $(this).val('');
                    }
                    })
                .blur(function() {
                    if($.trim($(this).val()) == '') {
                        $(this).val('Start typing a name');
                    }                        
                    });

            // hover states on the buttons        
            elem.find(".jfmps-button").hover(
                function(){ $(this).addClass("jfmps-button-hover");} , 
                function(){ $(this).removeClass("jfmps-button-hover");}
            );      
            
            // manages lazy loading of images
            getViewportHeight = function() {
                var height = window.innerHeight; // Safari, Opera
                var mode = document.compatMode;

                if ( (mode || !$.support.boxModel) ) { // IE, Gecko
                    height = (mode == 'CSS1Compat') ?
                    document.documentElement.clientHeight : // Standards
                    document.body.clientHeight; // Quirks
                }

                return height;
            };
            
            var showAlbumsInViewPort = function() {
                var container_height_px = photo_container.innerHeight(),
                    scroll_top_px = photo_container.scrollTop(),
                    container_offset_px = photo_container.offset().top,
                    $el, top_px,
                    elementVisitedCount = 0,
                    foundVisible = false,
                    allVisibleAlbums = $(".jfmps-albums:not(.hide-filtered )");

                $.each(allVisibleAlbums, function(i, $el){
                    elementVisitedCount++;
                    if($el !== null) {
                        $el = $(allVisibleAlbums[i]);
                        top_px = (albums_first_element_offset_px + (albums_height_px * Math.ceil(elementVisitedCount/albums_per_row))) - scroll_top_px - container_offset_px; 
						if (top_px + albums_height_px >= -10 && 
                            top_px - albums_height_px < container_height_px) {  // give some extra padding for broser differences
                                $el.data('inview', true);
                                $el.trigger('inview', [ true ]);
                                foundVisible = true;
                        } 
                        else {                            
                            if(foundVisible) {
                                return false;
                            }
                        }                            
                    }              
                })
            };
			
			var showPhotosInViewPort = function() {
                var container_height_px = photo_container.innerHeight(),
                    scroll_top_px = photo_container.scrollTop(),
                    container_offset_px = photo_container.offset().top,
                    $el, top_px,
                    elementVisitedCount1 = 0,
                    foundVisible = false,
                    allVisiblePhotos = $(".jfmps-photo-single:not(.hide-filtered )");

                $.each(allVisiblePhotos, function(i, $el){
                    elementVisitedCount1++;
					console.log(elementVisitedCount1);
                    if($el !== null) {
                        $el = $(allVisiblePhotos[i]);
						console.log($el);
                        top_px = (photos_first_element_offset_px + (photos_height_px * Math.ceil(elementVisitedCount1/photos_per_row))) - scroll_top_px - container_offset_px; 
						if (top_px + photos_height_px >= -10 && 
                            top_px - photos_height_px < container_height_px) {  // give some extra padding for broser differences   
								console.log($el.find('img').attr('alt'));
								if($el.find('img').attr('src') === undefined) {
									$el.find('img').attr("src", $el.find('img').attr('alt'));
								}
                                foundVisible = true;
								console.log($el);
                        } 
                        else {                  
                            if(foundVisible) {
                                return false;
                            }
                        }                            
                    }              
                });
            };

			var updateSelectedCount = function() {
				$("#jfmps-selected-count").html( selectedCount() );
			};

            photo_container.bind('scroll', $.debounce( 250, showAlbumsInViewPort ));
            photo_container.bind('scroll', $.debounce( 250, showPhotosInViewPort ));

            updateMaxSelectedMessage();                      
            showAlbumsInViewPort();
			updateSelectedCount();
            elem.trigger("jfmps.photoload.finished");
        };

        var selectedCount = function() {
            return $(".jfmps-photo-single.selected").length;
        };

        var maxSelectedEnabled = function () {
            return settings.max_selected > 0;
        };
        
        var updateMaxSelectedMessage = function() {
            var message = settings.labels.max_selected_message.replace("{0}", selectedCount()).replace("{1}", settings.max_selected);
            $("#jfmps-max-selected-wrapper").html( message );
        };
        
    };
    

    
    $.fn.jfmps = function(options) {
        return this.each(function() {
            var element = $(this);
            
            // Return early if this element already has a plugin instance
            if (element.data('jfmps')) { return; }
            
            // pass options to plugin constructor
            var jfmps = new JFMPS(this, options);
            
            // Store plugin object in this element's data
            element.data('jfmps', jfmps);
            
        });
    };
    
    // todo, make this more ambiguous
    $.expr[':'].Contains = function(a, i, m) { 
        return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0; 
    };
        

})(jQuery);

if($.debounce === undefined) {
    /*
     * jQuery throttle / debounce - v1.1 - 3/7/2010
     * http://benalman.com/projects/jquery-throttle-debounce-plugin/
     * 
     * Copyright (c) 2010 "Cowboy" Ben Alman
     * Dual licensed under the MIT and GPL licenses.
     * http://benalman.com/about/license/
     */
    (function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);
}
