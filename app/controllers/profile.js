var _args = arguments[0] || {},
	App = Alloy.Globals.App,
	Map = require('ti.map'),
	$U = require('utilities'),
	bookmarks = null;

function init(){
	$.profilePicture.image = _args.photo;
	$.name.text = _args.firstName + " " + _args.lastName;
	$.company.text = _args.company;
	$.phone.text = _args.phone;
	$.email.text = _args.email;
	$.im.text = _args.im || _args.firstName+"."+_args.lastName;
	$.about.text = _args.about;
	
	var distanceFromAppcelerator = Math.floor($U.getDistanceFromLatLonInMiles(_args.latitude, _args.longitude, 37.389505, -122.050252));
	$.fromHQ.text = distanceFromAppcelerator + " miles from HQ";
	
	/**
	 * Add Event Handlers to the IconLabels Widgets
	 */
	$.emailBtn.icon.addEventListener('click', emailContact);
	$.callBtn.icon.addEventListener('click', callContact);
	
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
	
	var mapAnnotation = Map.createAnnotation({
	    latitude: _args.latitude || 30.631256,
	    longitude: _args.longitude || -97.675422,
	    pincolor: Map.ANNOTATION_RED,
	});
	$.mapview.addAnnotation(mapAnnotation);
	
	/**
	 * Check that the contact is not already a bookmark
	 */
	bookmarks = Ti.App.Properties.getList("bookmarks", []);
	
	
	isBookmark(_args.id) && $.addBookmarkBtn.setTitle("- Remove From Bookmarks");
}

function mapAdjustRegion(e){
	
}

function isBookmark(id){
	return _.find(bookmarks, function(mark){
		return id === mark;
	});
}

/*function addContact(e) {
	
	Ti.API.info('Saving contact...');
	
	var performAddressBookFunction = function(){
		var workAddress1 = {
		  'CountryCode': 'us',
		  'Street':  '440 N. Bernardo Avenue',
		  'City': 'Mountain View',
		  'State': 'California',
		  'Country': 'United States',
		  'ZIP': '94043'
		};
		
		Ti.Contacts.createPerson({
			firstName : 'Kelly',
			lastName : 'Smith',
			organization: 'Appcelerator, Inc.',
			image: $.profilePicture.toBlob(),
			email: {
				work:['kelly.smith@appcelerator.com']
			}, 
			phone: {
				mobile:['512-555-1212']
			},
			address : {
				work : [workAddress1]
			},
			instantMessage:{
				home:[
					{
						service: 'Skype',
						username: 'kelly.smith'
					},
				]
			}
		});
		alert('Contact saved');
		
		/*
		Ti.Analytics.featureEvent(app.profile.saveContact)
		 
	};
	
	/*
	 * IOS requires permission grantgs on iOS6 and above
	
	if(OS_IOS){
		
		var addressBookDisallowed = function(){
			Ti.API.error("ERROR STORING CONTACT - PERMISSION DENIED");
		};
		
		if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_AUTHORIZED){
		    performAddressBookFunction();
		} else if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_UNKNOWN){
		    Ti.Contacts.requestAuthorization(function(e){
		        if (e.success) {
		            performAddressBookFunction();
		        } else {
		            addressBookDisallowed();
		        }
		    });
		} else {
		    addressBookDisallowed();
		}
	}
	else if(OS_ANDROID){ // ANDROID HAS PERMISSIONS IN THE MANIFEST
		performAddressBookFunction();
	}
};*/

/**
 * Function to Email the Contact using the native email tool
 */
function emailContact() {
	var emailDialog = Ti.UI.createEmailDialog();
	emailDialog.toRecipients = [_args.email];
	emailDialog.open();
};

/**
 * Function to quickly call the contact from the Profile Screen
 */
function callContact(){
	
	//var p = _args.phone.replace(/[^0-9]+/g, '');
	var dialog = Ti.UI.createAlertDialog({
	    cancel: 0,
	    buttonNames: ['Cancel', 'Ok'],
	    message: "Are you sure you want to call "+_args.firstName+" at "+_args.phone
	});
	dialog.addEventListener('click', function(e){
	    if (e.index !== e.source.cancel){
	      Ti.Platform.openURL("tel:+15125551212");
	    }  
	});
	dialog.show();
	
	 
}

/**
 * Add Bookmark
 */
function toggleBookmark(){
	
	Ti.API.info(bookmarks);
	
	if(!isBookmark(_args.id)){
		bookmarks.push(_args.id);
	    $.addBookmarkBtn.setTitle("- Remove From Bookmarks");
	}
	else{
	
		bookmarks = _.difference(bookmarks, [_args.id]);
	    $.addBookmarkBtn.setTitle("+ Add To Bookmarks"); 
	}
	
	Ti.API.info(bookmarks);
	
	Ti.App.Properties.setList("bookmarks", bookmarks);
	Ti.App.fireEvent("refresh-data");
	
	
}

init();
