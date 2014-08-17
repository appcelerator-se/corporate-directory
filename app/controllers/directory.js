var _args = arguments[0] || {};
var App = Alloy.Globals.App;

var users = null;
var indexes = [];

/** 
 * Methods 
 */
function init(){
	
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json"); 
	users = JSON.parse(file.read().text).users;
	
	/**
	 * Sort by Last Name
	 */
	users = _.sortBy(users, function(user){
		return user.lastName
	})
	
	if(users) {
		
		/**
		 * Group the data by first letter of last name to make it easier to create 
		 * sections
		 */
		
		var userGroups  = _.groupBy(users, function(item){
		 	return item.lastName.charAt(0);
		});
		
		indexes = [];
		var sections = [];
        
		_.each(userGroups, function(group){


			var dataToAdd = preprocessForListView(group);

			/**
			 * Check to make sure that there is data to add to the table,
			 * if not lets exit
			 */
			if(dataToAdd.length < 1) return;
			
			
		
			indexes.push({
				index: indexes.length,
				title: group[0].lastName.charAt(0)
			});

			/**
			 * Create a HeaderView
			 */

			 var sectionHeader = Ti.UI.createView({
			 	backgroundColor: "#ececec",
			 	width: Ti.UI.FIll,
			 	height: 30
			 });

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
			 * Create a new Section
			 */
			 var section = Ti.UI.createListSection({
				headerView: sectionHeader
			});

			/**
			 * Add Data to the Table
			 */
			section.items = dataToAdd;
			sections.push(section);
		});

		/**
		 * Update ListView
		 */
		Ti.API.info(indexes);
		$.listView.tintColor = "#666";
		$.listView.sections = sections;
		
		$.wrapper.addEventListener("swipe", function(e){
			if(e.direction === "left"){
				$.listView.sectionIndexTitles = indexes;
			}
			if(e.direction === "right"){
				$.listView.sectionIndexTitles = null;
			}
		});
	}
	
	if(_args.title){
		$.wrapper.title = _args.title;
	}
	
	if(_args.restrictBookmarks){
		$.searchBar.showBookmark = false;
	}
}

/**
 *	Convert a list of data from a JSON file into a format that can be added to the ListView
 * 	@param {Object} Raw data elements from the JSON file.
 */
var preprocessForListView = function(rawData) {
	
	var bookmarks = Ti.App.Properties.getList("bookmarks", []);
	
	if(_args.restrictBookmarks) {
		rawData = _.filter(rawData, function(item){
			return _.find(bookmarks, function(bookmark){
				return item.id === bookmark;
			});
		});
	}
	
	return _.map(rawData, function(item) {
		
		var isBookmark = _.find(bookmarks, function(bookmark){
			return item.id === bookmark;
		});
		
		return {
			template: isBookmark ? "favoriteTemplate" : "userTemplate",
			properties: {
				searchableText: item.name + ' ' + item.company + ' ' + item.email,
				user: item,
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
	
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	Alloy.Globals.App.Navigator.open("profile", item.properties.user);
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
	 * 				to the ListView
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchChange = function onChange(e){
		$.listView.searchText = $.searchBar.value;
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
	
	/**
	 * Handles the Bookmark icon click event. Launches this same control as a child window, but limits the view
	 * to only bookmarked items.
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onBookmarkClick = function onClick (e){
		//Hide the Keyboard if the user searched
		$.searchBar.blur();
		
		/**
		 * Open this same controller into a new page, pass the flag to restrict the list only to Bookmarked Contacts and force the title
		 */
		App.Navigator.open("directory", {restrictBookmarks:true, title:"Bookmarks"});
	};
}
else if(OS_ANDROID){
	/**
	 * Handles the SearchBar OnChange event
	 * 
	 * @description On iOS we want the search bar to always be on top, so we use the onchange event to tie it back
	 * 				to the ListView
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchChange = function onChange(e){
		if($.searchBar.value !==''){
			$.closeBtn.visible = true;
		}
		else{
			$.closeBtn.visible = false;
		}
		
		$.listView.searchText = $.searchBar.value;
	};
	/**
	 * Hides the keyboard when the cancel button is clicked
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchCancel = function onCancel(e){
		$.closeBtn.visible = false;
		$.searchBar.value = '';
		$.searchBar.blur();
	};
	/**
	 * Hides the keyboard when the cancel button is clicked
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchFocus = function onCancel(e){
		
		
	};
}

/**
 * Initialize View
 */

init();

/**
 * Listen for the refresh event, and re-initialize
 */
Ti.App.addEventListener("refresh-data", function(e){
	Ti.API.info('REFRESH DATA');
	
	$.listView.sections[0].items = null;
	init();
});

