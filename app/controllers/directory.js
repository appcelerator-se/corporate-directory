var _args = arguments[0] || {};
var App = Alloy.Globals.App;

users = Alloy.Collections.user;

users.comparator = function(contact) {
  return contact.get('lastName');
};

users.fetch();

/**
 * Setup listener for data refresh event
 */
Ti.App.addEventListener('refresh-data', function(){
	users.fetch();
});

/**
 * Update the Window title if needed
 */
if(_args.title){
	$.wrapper.title = _args.title;
}

/**
 * If we are looking at the window in bookmarks mode - then 
 * hide the bookmark icon
 */
if(_args.restrictBookmarks){
	$.searchBar.showBookmark = false;
}


function listViewTransform(m){
	
	var $M = m.toJSON();
	$M.template = $M.favorite ? "favoriteTemplate" : "userTemplate";
	$M.name = $M.firstName + " " +$M.lastName;
	$M.searchText = [$M.firstName, $M.lastName, $M.company, $M.email].join(" ");	
	return $M;
	
}

function listViewFilter(c){
	return !_args.restrictBookmarks ?  c.models :  c.where({ favorite: 1 });	
}

/**
 * This function handles the click events for the rows in the ListView.
 * We want to capture the user property associated with the row, and pass
 * it into the profile View
 * 
 * @param {Object} Event data passed to the function
 */
function onItemClick(e){ 
	
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	Ti.API.info(item.properties.contactId);
	var contact = users.get(item.properties.contactId).toJSON(); 
	App.Navigator.open("profile", contact);
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
};
