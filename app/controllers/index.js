/**
 * Global Navigation Handler
 */
Alloy.Globals.Navigator = {
	
	/**
	 * Handle to the Navigation Controller
	 */
	navGroup: $.nav,
	
	open: function(controller, payload){
		var win = Alloy.createController(controller, payload || {}).getView();
		
		if(OS_IOS){
			$.nav.openWindow(win);
		}
		else if(OS_MOBILEWEB){
			$.nav.open(win);
		}
		else {
			// added this property to the payload to know if the window is a child
			if (payload.displayHomeAsUp){
				win.addEventListener('open',function(evt){
					var activity=win.activity;
					activity.actionBar.displayHomeAsUp=payload.displayHomeAsUp;
					activity.actionBar.onHomeIconItemSelected=function(){
						evt.source.close();
					};
				});
			}
			win.open();
		}
	}
};


/**
 * Lets add a loading animation - Just for Fun!
 */
var loadingView = Alloy.createController("loader");
loadingView.getView().open();
loadingView.start(); 

setTimeout(function(){
	loadingView.finish(function(){
		
		if(OS_IOS){
			$.nav.open()
		}
		else if(OS_MOBILEWEB){
			$.index.open();
		}
		else{
			$.index.getView().open();
		} 
		
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
		Alloy.Globals.Navigator.open("directory", {restrictBookmarks:true, title:L("bookmarks")});
	};
}