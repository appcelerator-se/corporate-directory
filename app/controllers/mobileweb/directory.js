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
 * a flat file, and derives a Sectioned and Indexed (iOS) TableView displaying all contacts.
 * The Directory has two TableView Templates, one for standard contacts, the other to denote
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
	users = null,  // Array placeholder for all users
	indexes = [];  // Array placeholder for the TableView Index (used by iOS only)

/**
 * Appcelerator Analytics Call
 */
var title = _args.title ? _args.title.toLowerCase() : L("directory"); 
Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".viewed");



/** 
 * Function to inialize the View, gathers data from the flat file and sets up the TableView
 */
function init(){
	
	alert("mobileweb");
	
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
		 * Setup our Indexes and Sections Array for building out the TableView components
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
         * Iterate through each group created, and prepare the data for the TableView
         * (Leverages the UnderscoreJS _.each function)
         */
		_.each(userGroups, function(group){
			
			/**
			 * Lets take the first Character of the LastName and push it onto the index
			 * Array - this will be used to generate the indices for the TableView on IOS
			 */
			indexes.push({
				index: indexes.length,
				title: group[0].lastName.charAt(0)
			});

			/**
			 * Create the TableViewSection header view
			 * DOCS: http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.ListSection-property-headerView
			 */

			 var sectionHeader = Ti.UI.createView({
			 	backgroundColor: "#ececec",
			 	width: Ti.UI.FIll,
			 	height: 30
			 });

			 /**
			  * Create and Add the Label to the TableView Section header view
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
			 * Create a new TableViewSection, and ADD the header view created above to it.
			 */
			 var section = Ti.UI.createTableViewSection({
				headerView: sectionHeader
			});

			/**
			 * Add Data to the TableViewSection
			 */
			_.each(group, function(userData){
				/**
				 * Create the new user object which is added to the Array that is returned by the _.map function. 
				 */
				var row = Alloy.createController("directoryRow", userData);
				section.add(row.getView());
			});
			
			/**
			 * Push the newly created TableViewSection onto the `sections` array. This will be used to populate
			 * the TableView 
			 */
			sections.push(section);
		});

		/**
		 * Add the TableViewSections and data elements created above to the TableView
		 */
		$.tableView.data = sections;
		
		/**
		 * For iOS, we add an event listener on the swipe of the TableView to display the index of the TableView we 
		 * created above. The `sectionIndexTitles` property is only valid on iOS, so we put these handlers in the iOS block.
		 */
		if(OS_IOS) {
			$.wrapper.addEventListener("swipe", function(e){
				if(e.direction === "left"){
					$.tableView.index = indexes;
				}
				if(e.direction === "right"){
					$.tableView.index = null;
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
	 * Check to see if the `restrictBookmarks` flag has been passed in as an argument, and 
	 * hide the bookmark icon accordingly
	 */
	if(_args.restrictBookmarks && ! OS_ANDROID){
		$.searchBar.showBookmark = false;
	}
};

/**
 *	Convert an array of data from a JSON file into a format that can be added to the TableView
 * 
 * 	@param {Object} Raw data elements from the JSON file.
 */
var preprocessForTableView = function(rawData) {
	
	/**
	 * Get the Bookmarks array from persistent storage in Ti.App.Properties
	 * DOCS: http://docs.appcelerator.com/platform/latest/#!/api/Titanium.App.Properties
	 */
	var bookmarks = Ti.App.Properties.getList("bookmarks", []);
	
	/**
	 * If we need to filter the view to only show bookmars, check to see if the `restrictBookmarks` 
	 * flag has been passed in as an argument to the controller, and only show users that are bookmarked
	 */
	if(_args.restrictBookmarks) {
		
		/**
		 * redefines the collection to only have users that are currently listed as bookmarks (leverages
		 * 	the UnderscoreJS _.filter function )
		 */
		rawData = _.filter(rawData, function(item){
			
			/**
			 * each item (or user) that is referenced, we look to see if the user id is included in bookmarks array
			 * retrieved from persistent storage above
			 */
			return _.find(bookmarks, function(bookmark){
				return item.id === bookmark;
			});
		});
	}
	
	/**
	 * Using the rawData collection, we map data properties of the users in this array to an array that maps an array to properly
	 * display the data in the TableView based on the templates defined in directory.xml (levearges the _.map Function of UnderscoreJS)
	 */
	return _.map(rawData, function(item) {
		
		/**
		 * Need to check to see if this user item is a bookmark. If it is, we will use the `favoriteTemplate` in the TableView.
		 * (leverages the _.find function of UnderscoreJS)
		 */
		var isBookmark = _.find(bookmarks, function(bookmark){
			return item.id === bookmark;
		});
		
		/**
		 * Create the new user object which is added to the Array that is returned by the _.map function. 
		 */
		var row = Alloy.createController("directoryRow", {
			bookmark: isBookmark,
			user: item
		});
		
		return row.getView();
	});	
};

/**
 * This function handles the click events for the rows in the TableView.
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
	 * Open the profile view, and pass in the user data for this contact
	 * Adding displayHomeAsUp to the payload so the navigator knows this is a child window
	 */
	var payload=e.row.user;
	payload.displayHomeAsUp=true;
	Alloy.Globals.Navigator.open("profile", payload);
}

/**
 * This code is only relevant to iOS - to make it cleaner, we are declaring variables, and
 * then assigning them to functions within an iOS Block. On MobileWeb, Android, etc this code block will not
 * exist
 */
var onSearchChange, onSearchFocus, onSearchCancel, onBookmarkClick;
if(OS_IOS){
	
	/**
	 * Handles the SearchBar OnChange event
	 * 
	 * @description On iOS we want the search bar to always be on top, so we use the onchange event to tie it back
	 * 				to the TableView
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchChange = function onChange(e){
		//$.tableView.search = $.searchBar.value;
	};
	
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
		if(!_args.restrictBookmarks){
			$.searchBar.showBookmark = true;
			$.searchBar.showCancel = false;
		}	
		$.searchBar.blur();
	};
}
else if(OS_ANDROID){
	/**
	 * Handles the SearchBar OnChange event
	 * 
	 * @description On iOS we want the search bar to always be on top, so we use the onchange event to tie it back
	 * 				to the TableView
	 * 
	 * @param {Object} Event data passed to the function
	 */
	/*onSearchChange = function onChange(e){
		if($.searchBar.value !==''){
			$.closeBtn.visible = true;
		}
		else{
			$.closeBtn.visible = false;
		}
		
		$.tableView.searchText = $.searchBar.value;
	};*/
	/**
	 * Hides the keyboard when the cancel button is clicked
	 * 
	 * @param {Object} Event data passed to the function
	 */
	/*onSearchCancel = function onCancel(e){
		$.closeBtn.visible = false;
		$.searchBar.value = '';
		$.searchBar.blur();
	};*/
}

/**
 * Handles the Bookmark icon click event. Launches this same control as a child window, but limits the view
 * to only bookmarked items.
 * 
 * @param {Object} Event data passed to the function
 */
onBookmarkClick = function onClick (e){
	
	/**
	 * Appcelerator Analytics Call
	 */
	Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".bookmarks.clicked");
	
	/**
	 * Hide the Keyboard if the user searched
	 */
	if (OS_IOS) $.searchBar.blur();
	
	/**
	 * Open this same controller into a new page, pass the flag to restrict the list only to Bookmarked Contacts and force the title
	 */
	Alloy.Globals.Navigator.open("directory", {restrictBookmarks:true, title:L("bookmarks"),displayHomeAsUp:true});
};
/**
 * Initialize View
 */

init();

/**
 * Listen for the refresh event, and re-initialize
 */
Ti.App.addEventListener("refresh-data", function(e){ 
	
	/**
	 * Reset the TableView
	 */
	$.tableView.sections[0].items = null;
	init();
});

