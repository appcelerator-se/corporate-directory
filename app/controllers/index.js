
var App = Alloy.Globals.App;

App.init({
	navGroup: $.nav
});

/**
 * Lets add a loading animation - Just for Fun!
 */
var loadingView = Alloy.createController("loader");
loadingView.getView().open();
loadingView.start(); 

setTimeout(function(){
	loadingView.finish(function(){
		$.nav.open();
		
		loadingView.getView().close();
		loadingView = null;
	});
}, 1500);


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
		App.Navigator.open("directory", {restrictBookmarks:true, title:L("bookmarks")});
	};
}