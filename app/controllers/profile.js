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
 * This is the controller file for the Profile View. The Contact Profile displays 
 * information passed in from the Directory View
 *
 * @copyright
 * Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */


/**
 * Instantiate the variables assocaited with this controller
 */
var _args = arguments[0] || {},
	App = Alloy.Globals.App,
	Map = require('ti.map'),
	$U = require('utilities'),
	bookmarks = null;

/**
 * Function to initialize the View
 */
function init(){
	
	/**
	 * Check for passed in properties of the contact, and update the 
	 * Label text and ImageView image values as required
	 */
	$.profilePicture.image = _args.photo;
	$.name.text = _args.firstName + " " + _args.lastName;
	$.company.text = _args.company;
	$.phone.text = _args.phone;
	$.email.text = _args.email;
	$.im.text = _args.im || _args.firstName+"."+_args.lastName;
	$.about.text = _args.about;
	
	/**
	 * FUN! How far away is the contact from your Headquarters! This is calculated using
	 * functions from the lib/utilities.js. The HQ is defined in Alloy.js
	 */
	var distanceFromAppcelerator = Math.floor($U.getDistanceFromLatLonInMiles(_args.latitude, _args.longitude, 37.389505, -122.050252));
	$.fromHQ.text = distanceFromAppcelerator + " miles from HQ";
	
	/**
	 * Add Event Handlers to the IconLabels Widgets
	 */
	$.emailBtn.icon.addEventListener('click', emailContact);
	$.callBtn.icon.addEventListener('click', callContact);
	
	
	/**
	 * Set the Map Region for the Map Module so that it is at the right zoom level
	 * DOCS: http://docs.appcelerator.com/platform/latest/#!/api/Modules.Map
	 */
	if(!OS_ANDROID){
		
		$.mapview.setRegion({
			latitude: _args.latitude || 30.631256,
			longitude: _args.longitude || -97.675422,
			latitudeDelta:2,
			longitudeDelta:2,
		});
		
	}
	else {
		
		/**
		 * Android leverages a zoom / tilt property to adjust the view so we 
		 * branched the code accordingly
		 */
		$.mapview.setRegion({
			latitude: _args.latitude || 30.631256,
			longitude: _args.longitude || -97.675422,
			zoom: 6,
			tilt:45
		});
	}
	
	/**
	 * Create the Map Annotation to the latitude and longitude assigned to the user.
	 */
	var mapAnnotation = Map.createAnnotation({
	    latitude: _args.latitude || 30.631256,
	    longitude: _args.longitude || -97.675422,
	    pincolor: Map.ANNOTATION_RED,
	});
	
	/**
	 * Add the Map Annotation to the MapView
	 */
	$.mapview.addAnnotation(mapAnnotation);
	
	/**
	 * Get the Bookmarks from Ti.App.Properties
	 */
	bookmarks = Ti.App.Properties.getList("bookmarks", []);
	
	/**
	 * Check that the contact is not already a bookmark, and update the bookmarks button
	 * title as required.
	 */
	isBookmark(_args.id) && $.addBookmarkBtn.setTitle("- Remove From Bookmarks");
}

/**
 * Initialize the View
 */
init();


/**
 * Determines if the passed in ID of the contact currently exists in the bookmarks array. 
 * Returns TRUE if successful.
 * 
 * @param {Object} id - the ID of the contact that is used to search the bookmarks array
 */
function isBookmark(id){
	
	/**
	 * Return the result of the search for the user id in the bookmarks
	 * array. (Uses the UnderscoreJS _.find() function )
	 */
	return _.find(bookmarks, function(mark){
		return id === mark;
	});
};

/**
 * Function to Email the Contact using the native email tool
 */
function emailContact() {
	
	/**
	 * Create an Email Dialog
	 * DOCS: http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.EmailDialog
	 */
	var emailDialog = Ti.UI.createEmailDialog();
	
	/**
	 * Setup the Email Dialog information, in this case just the recipients field
	 */
	emailDialog.toRecipients = [_args.email];
	
	/**
	 * Once we have created and setup the Email Dialog, lets open the view
	 */
	emailDialog.open();
};

/**
 * Function to quickly call the contact from the Profile Screen
 */
function callContact(){
	
	/**
	 * Before we send the phone number to the platform for handling, lets first verify
	 * with the user they meant to call the contact with an Alert Dialog
	 * DOCS: http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.AlertDialog
	 */
	var dialog = Ti.UI.createAlertDialog({
	    cancel: 0,
	    buttonNames: ['Cancel', 'Ok'],
	    message: "Are you sure you want to call "+_args.firstName+" at "+_args.phone
	});
	
	/**
	 * Event Handler associated with clicking the Alert Dialog, this handles the 
	 * actual call to the platform to make the phone call
	 */
	dialog.addEventListener('click', function(e){
		 if (e.index !== e.source.cancel){
	    
	     	// IF WE ARE BUILDING FOR DEVELOPMENT PURPOSES - TRY CALLING A FAKE NUMBER
	      	if(ENV_DEV){
	      		Ti.Platform.openURL("tel:+15125551212");
	      	}
	      	// ELSE IF WE ARE BUILDING PRODUCTION - THEN USE THE LISTED NUMBER
	      	else if(ENV_PRODUCTION){
	      		Ti.Platform.openURL("tel:"+_args.phone);
	      	}
	    }  
	});
	
	/**
	 * After everything is setup, we show the Alert Dialog to the User
	 */
	dialog.show();
	 
};

/**
 * Add Bookmark
 */
function toggleBookmark(){

	/**
	 * If the user is not currently listed as a bookmarked user
	 */
	if(!isBookmark(_args.id)){
		/**
		 * Then add this user to the bookmarks array, and update the button title for favorites
		 */
		bookmarks.push(_args.id);
	    $.addBookmarkBtn.setTitle("- Remove From Bookmarks");
	}
	else{
	    /**
		 * Else remove the user from the bookmarks array (usess Underscore js difference function), 
		 * and update the button title accordingly
		 */
		bookmarks = _.difference(bookmarks, [_args.id]);
	    $.addBookmarkBtn.setTitle("+ Add To Bookmarks"); 
	}
	
	/**
	 * Update the bookmarks array in Ti.App.Properties
	 */
	Ti.App.Properties.setList("bookmarks", bookmarks);
	
	/**
	 * Fire event to trigger a data refresh in the directory view
	 */
	Ti.App.fireEvent("refresh-data");
	
	
};

