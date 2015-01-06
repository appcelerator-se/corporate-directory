var args = arguments[0] || {};

// /**
 // * Get the Bookmarks array from persistent storage in Ti.App.Properties
 // * DOCS: http://docs.appcelerator.com/platform/latest/#!/api/Titanium.App.Properties
 // */
// var bookmarks = Ti.App.Properties.getList("bookmarks", []);
// /**
 // * each item (or user) that is referenced, we look to see if the user id is included in bookmarks array
 // * retrieved from persistent storage above
 // */
// var isBookmark = _.find(bookmarks, function(bookmark){
	// return args.id === bookmark;
// });
$.directoryRow.user = args;
$.userPhoto.image = args.photo;
$.userCompany.text = args.company;
$.userEmail.text = args.email;
$.userName.text = args.firstName + " " + args.lastName;

/**
 * Show the 
 */
$.favorite.visible = args.isBookmark;

/**
 * In order to filter the table on search, we need to leverage a property on the TableViewRow.
 * For our purposes here, we'll just use the title attribute. This attribute is hidden when you
 * have alternate views leveraged within the TableViewRow
 */
if (OS_ANDROID){ 
	// not entirely sure about this, but it appears as though this is the text used by Android to search on the TableView, but on iOS the text is showing
	$.directoryRow.title= args.firstName + " " + args.lastName;
}else {
	$.directoryRow.search = args.firstName + " " + args.lastName;	
}
