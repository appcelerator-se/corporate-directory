

Alloy.Globals.App.init({
	navGroup: $.nav
});

$.nav.open();



/**
 * Handles the Bookmark icon click event. Launches this same control as a child window, but limits the view
 * to only bookmarked items.
 * 
 * @param {Object} Event data passed to the function
 */
var onBookmarkClick = null;
if(OS_ANDROID){
	onBookmarkClick = function(e){
		Ti.API.info('BOOKMAKR MENU ITEM CLICKED');
		/**
		 * Open this same controller into a new page, pass the flag to restrict the list only to Bookmarked Contacts and force the title
		 */
		Alloy.Globals.App.Navigator.open("directory", {restrictBookmarks:true, title:"Bookmarks"});
	};
}