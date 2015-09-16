/**
 *                              _                _             
 *                             | |              | |            
 *    __ _ _ __  _ __   ___ ___| | ___ _ __ __ _| |_ ___  _ __ 
 *   / _` | '_ \| '_ \ / __/ _ \ |/ _ \ '__/ _` | __/ _ \| '__|
 *  | (_| | |_) | |_) | (_|  __/ |  __/ | | (_| | || (_) | |   
 *   \__,_| .__/| .__/ \___\___|_|\___|_|  \__,_|\__\___/|_|   
 *        | |   | |                                            
 *        |_|   |_|  
 *      
 *      
 * @overview
 * This is the controller file for the Directory View. The directory view loads data from 
 * a flat file, and derives a Sectioned and Indexed (iOS) ListView displaying all contacts.
 * The Directory has two ListView Templates, one for standard contacts, the other to denote
 * that you have a marked the contact as a Bookmark (or Favorite). Also, the Directory View
 * can be filtered so that it only displays bookmarked or favorited contacts.
 *
 * @copyright
 * Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

/**
 * Instantiate the local variables for this controller
 */
var _args = arguments[0] || {}, // Any passed in arguments will fall into this property
	App = Alloy.Globals.App, // reference to the APP singleton object
	$FM = require('favoritesmgr'),  // FavoritesManager object (see lib/utilities.js)
	users = null,  // Array placeholder for all users
	indexes = [];  // Array placeholder for the ListView Index (used by iOS only);
	

/**
 * Appcelerator Analytics Call
 */
var title = _args.title ? _args.title.toLowerCase() : "directory";
Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".viewed");


/** 
 * Function to inialize the View, gathers data from the flat file and sets up the ListView
 */
function init(){
	
	/**
	 * Access the FileSystem Object to read in the information from a flat file (lib/userData/data.js)
	 * DOCS: http://docs.appcelerator.com/platform/latest/#!/api/Titanium.Filesystem
	 */
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json"); 
	
	/**
	 * Populate the users variable from the file this call returns an array
	 */
	users = JSON.parse(file.read().text).users;
	
	/**
	 * Sorts the `users` array by the lastName property of the user (leverages UnderscoreJS _.sortBy function)
	 */
	users = _.sortBy(users, function(user){
		return user.lastName
	});
	
	/**
	 * IF the users array exists
	 */
	if(users) {
		
		/**
		 * Setup our Indexes and Sections Array for building out the ListView components
		 * 
		 */
		indexes = [];
		var sections = [];
		
		/**
		 * Group the data by first letter of last name to make it easier to create 
		 * sections. (leverages the UndrescoreJS _.groupBy function)
		 */
		var userGroups  = _.groupBy(users, function(item){
		 	return item.lastName.charAt(0);
		});
        
        /**
         * Iterate through each group created, and prepare the data for the ListView
         * (Leverages the UnderscoreJS _.each function)
         */
		_.each(userGroups, function(group){

			/**
			 * Take the group data that is passed into the function, and parse/transform
			 * it for use in the ListView templates as defined in the directory.xml file.
			 */
			var dataToAdd = preprocessForListView(group);

			/**
			 * Check to make sure that there is data to add to the table,
			 * if not lets exit
			 */
			if(dataToAdd.length < 1) return;
			
			
			/**
			 * Lets take the first Character of the LastName and push it onto the index
			 * Array - this will be used to generate the indices for the ListView on IOS
			 */
			indexes.push({
				index: indexes.length,
				title: group[0].lastName.charAt(0)
			});

			/**
			 * Create the ListViewSection header view
			 * DOCS: http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.ListSection-property-headerView
			 */

			 var sectionHeader = Ti.UI.createView({
			 	backgroundColor: "#ececec",
			 	width: Ti.UI.FILL,
			 	height: 30
			 });

			 /**
			  * Create and Add the Label to the ListView Section header view
			  */
			 var sectionLabel = Ti.UI.createLabel({
			 	text: group[0].lastName.charAt(0),
			 	left: 20,
			 	font:{
			 		fontSize: 20
			 	},
			 	color: "#666"
			 });
			 sectionHeader.add(sectionLabel);

			/**
			 * Create a new ListViewSection, and ADD the header view created above to it.
			 */
			 var section = Ti.UI.createListSection({
				headerView: sectionHeader
			});

			/**
			 * Add Data to the ListViewSection
			 */
			section.items = dataToAdd;
			
			/**
			 * Push the newly created ListViewSection onto the `sections` array. This will be used to populate
			 * the ListView 
			 */
			sections.push(section);
		});

		/**
		 * Add the ListViewSections and data elements created above to the ListView
		 */
		$.listView.sections = sections;
		
		/**
		 * For iOS, we add an event listener on the swipe of the ListView to display the index of the ListView we 
		 * created above. The `sectionIndexTitles` property is only valid on iOS, so we put these handlers in the iOS block.
		 */
		if(OS_IOS) {
			$.wrapper.addEventListener("swipe", function(e){
				if(e.direction === "left"){
					$.listView.sectionIndexTitles = indexes;
				}
				if(e.direction === "right"){
					$.listView.sectionIndexTitles = null;
				}
			});
		}
	}
	
	/**
	 * Update the Window title if required (only used when we create the Bookmarks View)
	 */
	if(_args.title){
		$.wrapper.title = _args.title;
	}
	
	/**
	 * Check to see if the `restrictToFavorites` flag has been passed in as an argument, and 
	 * hide the favorite icon accordingly
	 */
	if(_args.restrictToFavorites){
		OS_IOS && ($.searchBar.showBookmark = false);
		
	}
	else {
			
		if(OS_IOS){
			$.wrapper.leftNavButton = Ti.UI.createLabel({
				text: "\ue601",
				color: "#C41230",
				font:{
					fontFamily:"icomoon",
					fontSize:36
				}
			});
		}
	}

};

/**
 *	Convert an array of data from a JSON file into a format that can be added to the ListView
 * 
 * 	@param {Object} Raw data elements from the JSON file.
 */
var preprocessForListView = function(rawData) {
	 
	/**
	 * If we need to filter the view to only show bookmars, check to see if the `restrictToFavorites` 
	 * flag has been passed in as an argument to the controller, and only show users that are favorites
	 */
	if(_args.restrictToFavorites) {
		
		/**
		 * redefines the collection to only have users that are currently listed as favorites (leverages
		 * 	the UnderscoreJS _.filter function )
		 */
		rawData = _.filter(rawData, function(item){
			
			/**
			 * each item (or user) that is referenced, we look to see if the user id is included in favorites array
			 * retrieved from persistent storage above
			 */
			return $FM.exists(item.id);
		});
	}
	
	/**
	 * Using the rawData collection, we map data properties of the users in this array to an array that maps an array to properly
	 * display the data in the ListView based on the templates defined in directory.xml (levearges the _.map Function of UnderscoreJS)
	 */
	return _.map(rawData, function(item) {
		
		/**
		 * Need to check to see if this user item is a favorite. If it is, we will use the `favoriteTemplate` in the ListView.
		 * (leverages the _.find function of UnderscoreJS)
		 */
		var isFavorite = $FM.exists(item.id);
		
		/**
		 * Create the new user object which is added to the Array that is returned by the _.map function. 
		 */
		return {
			template: isFavorite ? "favoriteTemplate" : "userTemplate",
			properties: {
				searchableText: item.firstName + ' ' + item.lastName + ' ' + item.company + ' ' + item.email,
				user: item,
				editActions: [
					{title: isFavorite ? "- Favorite" : "+ Favorite", color: isFavorite ? "#C41230" : "#038BC8" }
				],
				canEdit:true
			},
			userName: {text: item.firstName+" "+item.lastName},
			userCompany: {text: item.company},
			userPhoto: {image: item.photo},
			userEmail: {text: item.email} 
		};
	});	
};

/**
 * This function handles the click events for the rows in the ListView.
 * We want to capture the user property associated with the row, and pass
 * it into the profile View
 * 
 * @param {Object} Event data passed to the function
 */
function onItemClick(e){
	
	/**
	 * Appcelerator Analytics Call
	 */
	Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".contact.clicked");
	
	/**
	 * Get the Item that was clicked
	 */
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	
	/**
	 * Open the profile view, and pass in the user data for this contact
	 */
	Alloy.Globals.Navigator.open("profile", item.properties.user);
}

/**
 * This code is only relevant to iOS - to make it cleaner, we are declaring variables, and
 * then assigning them to functions within an iOS Block. On MobileWeb, Android, etc this code block will not
 * exist
 */
var onSearchChange, onSearchFocus, onSearchCancel;

/**
 * Handles the favorite icon click event. Launches this same control as a child window, but limits the view
 * to only favoitems.
 * 
 * @param {Object} Event data passed to the function
 */
var onBookmarkClick = function onClick (e){
	
	/**
	 * Appcelerator Analytics Call
	 */
	Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".favorites.clicked");
	
	/**
	 * Open this same controller into a new page, pass the flag to restrict the list only to favorite Contacts and force the title
	 */
	Alloy.Globals.Navigator.open("directory", {restrictToFavorites:true, title:"Favorites", displayHomeAsUp:true});
};

/**
 * Handles the SearchBar OnChange event
 * 
 * @description On iOS we want the search bar to always be on top, so we use the onchange event to tie it back
 * 				to the ListView
 * 
 * @param {Object} Event data passed to the function
 */
onSearchChange = function onChange(e){
	$.listView.searchText = e.source.value;
};
	
if(OS_IOS){
	
	/**
	 * Updates the UI when the SearchBar gains focus. Hides the Bookmark icon and shows
	 * the Cancel button.
	 * 
	 * @description We want to use both the bookmark feature and Cancel, but don't want them to show up together (EWW!)
	 * 				so we use the focus event to show the Cancel button and hide the bookmark
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchFocus = function onFocus(e){
			$.searchBar.showBookmark = false;
			$.searchBar.showCancel = true;
	};
	
	/**
	 * Updates the UI when the Cancel button is clicked within the search bar. Hides the Cancel button and shows
	 * the Bookmark icon
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchCancel = function onCancel(e){
		if(!_args.restrictToFavorites){
			$.searchBar.showBookmark = true;
			$.searchBar.showCancel = false;
		}	
		$.searchBar.blur();
	};
	
	/**
	 * Updates user record favorite classification and the list elements
	 * 
	 *  @param {Object} e  Event data passed to the function
	 */
	function onRowAction(e){
		
		var row = e.section.getItemAt(e.itemIndex);
		var id = row.properties.user.id;
		
		if(e.action === "+ Favorite") {
			$FM.add(id);
		}
		else {
			$FM.remove(id);
		}
		
		$.listView.editing = false;
		init();
	}
	
	/* 
	 * Assign `editaction` event listener to ListView 
	 * 
	 * NOTE: Updated to 'editaction' instead of 'rowAction' per
	 * ticket
	 * https://jira.appcelerator.org/browse/TIMOB-19096
	 */
	$.listView.addEventListener("editaction", onRowAction);
}

/**
 * Hide Bookmark Icon (Android)
 */
$.wrapper.addEventListener("open", function onWindowOpen(){
	if(OS_ANDROID && _args.restrictToFavorites){
		
		var activity = $.wrapper.getActivity();
		activity.onCreateOptionsMenu = function(e) {
	 		e.menu.clear();
		};	
		activity.invalidateOptionsMenu();
	}
});

/**
 * Listen for the refresh event, and re-initialize
 */
Ti.App.addEventListener("refresh-data", function(e){
	init();
});


/**
 * Initialize View
 */
init();

