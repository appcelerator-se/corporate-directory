var _args = arguments[0] || {},
	App = Alloy.Globals.App,
	Map = require('ti.map'),
	$U = require('utilities'),
	$M = Alloy.Models.user;


/**
 * Update the Model/View binding
 */
for(var prop in _args){
	Ti.API.info("KEY: "+prop+", VALUE: "+_args[prop]);
	$M.set(prop, _args[prop]);
};

/**
 * A couple of transformations for the model to align with the Data on the page
 */
$M.set("name", _args.firstName+" "+_args.lastName);
$M.set("im", _args.firstName.toLowerCase()+"."+_args.lastName.toLowerCase());

/**
 * Initialize the View
 */
function init(){
	
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
		
		$.mapview.setRegion({
			latitude: _args.latitude || 30.631256,
			longitude: _args.longitude || -97.675422,
			zoom: 6,
			tilt:45
		});
	}
	
	/**
	 * Set Map Annotation
	 */
	var mapAnnotation = Map.createAnnotation({
	    latitude: _args.latitude || 30.631256,
	    longitude: _args.longitude || -97.675422,
	    pincolor: Map.ANNOTATION_RED,
	});
	$.mapview.addAnnotation(mapAnnotation);
	
	/**
	 * Check that the contact is not already a bookmark
	 */
	_args.favorite && $.addBookmarkBtn.setTitle("- Remove From Bookmarks");
}
init();

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
	emailDialog.toRecipients = [$M.email];
	
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
 * Set/Unset the favorite flag on the contact
 */
function toggleFavorite(){ 
	
	/**
	 * If the Model is a favorite already
	 */
	if($M.get('favorite')){		
		
		/**
		 * Set the Model property for Favorite to false, and update the 
		 * button title for favorites
		 */
		$M.set('favorite', false);
	    $.addBookmarkBtn.setTitle("+ Add To Bookmarks");	
	}
	else{	
		
		/**
		 * Else set the favorite property to true, and update the button title
		 * accordingly
		 */
		$M.set('favorite', true);
	    $.addBookmarkBtn.setTitle("- Remove From Bookmarks");
	}
	
	/**
	 * Save the updated modedl to the database.
	 */
	$M.save(); 
	
	/**
	 * Fire event to trigger a data refresh in the directory view
	 */
	Ti.App.fireEvent('refresh-data');
};
