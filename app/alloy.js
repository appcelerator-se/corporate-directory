// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

/**
 * Name and Geographic location of your company headquarters
 */
Alloy.Globals.HQ = {
	latitude: 37.389505,
	longitude: -122.050252,
	name: "Appcelerator"
};


/* 
 * App Singleton
 * @type {Object}
 */
Alloy.Globals.App = {
	
	/**
	 * Applications Settings
	 */
	Settings: {
		menuWidth: "70%"
	},
	
	/**
	 * Titanium Platform SDK Information
	 *
	 * @type {Object}
	 * @param {String} version The version of the Titanium SDK
	 * @param {Number} versionMajor The major version of the Titanium SDK
	 * @param {Number} versionMinor The minor version of the Titanium SDK
	 */
	SDK: {
		version: !OS_BLACKBERRY && Ti.version,
		versionMajor: !OS_BLACKBERRY && parseInt(Ti.version.split(".")[0], 10),
		versionMinor: !OS_BLACKBERRY && parseInt(Ti.version.split(".")[1], 10),
	},
	
	/**
	 * Device information, some come from the Ti API calls and can be referenced
	 * from here so multiple bridge calls aren't necessary, others generated here
	 * for ease of calculations and such.
	 *
	 * @type {Object}
	 * @param {String} version The version of the OS
	 * @param {Number} versionMajor The major version of the OS
	 * @param {Number} versionMinor The minor version of the OS
	 * @param {Number} width The width of the device screen
	 * @param {Number} height The height of the device screen
	 * @param {Number} dpi The DPI of the device screen
	 * @param {String} orientation The device orientation, either "landscape" or "portrait"
	 * @param {String} statusBarOrientation A Ti.UI orientation value
	 */
	Device: {
		version: Ti.Platform.version,
		versionMajor: !OS_BLACKBERRY && parseInt(Ti.Platform.version.split(".")[0], 10),
		versionMinor: !OS_BLACKBERRY && parseInt(Ti.Platform.version.split(".")[1], 10),
		width: null,
		height: null,
		dpi: Ti.Platform.displayCaps.dpi,
		orientation: Ti.Gesture.orientation == Ti.UI.LANDSCAPE_LEFT || Ti.Gesture.orientation == Ti.UI.LANDSCAPE_RIGHT ? "landscape" : "portrait"
	},
	
	/**
	 * Navigation Widget using for routing controllers
	 * @type {Object}
	 */
	Navigator: {
		currentWindow: null,	// A reference to the currentController being viewed within the contentView
		navGroup : null,		// IOS Only, if IOS we use the navigation Window instead of just windows. Needs to be configured in the init function
		
		/**
		 * open - responsible for opening new views into the contentView. Additionally handles the removal of pre-existing views
		 * @type {String} _controller : the name of the view/controller you want to open
		 * @type {Object} _options : additional properties you want to pass into the new view/controller 
		 */
		open: function(controller, payload){
	
			var view = Alloy.createController(controller, payload || {}).getView()
			
			/**
			 * Wrap all child views within a window
			 */
			var win = Alloy.Globals.App.Navigator.currentWindow = Ti.UI.createWindow({
				title: view.title || "",
				titleAttributes:  {
			        color: "#C41230"
			   },
			   fullscreen: OS_ANDROID ? true : null,
			   backgroundColor:"#fff",
			   navTintColor: "C41230"
			});
			win.add(view);
			
			if (OS_ANDROID){
				
				this.currentWindow.addEventListener('open',function(e){
					
					if (! win.getActivity()) {
			            Ti.API.error("Can't access action bar on a lightweight window.");
			        } else {
			            var actionBar = win.activity.actionBar;
			            if (actionBar) {
			                actionBar.displayHomeAsUp=true;
			                actionBar.onHomeIconItemSelected = function() {
			                    win.close();
			                };
			            }
			            
			            win.activity.invalidateOptionsMenu();
			        }
				});
				
				win.open();
				
			} else{
				
				
				this.navGroup.openWindow(win,{animated:true});
				
			}
		},
		 
		modal: function(_controller, _options) {
			Ti.API.info('MODAL');
			if(_controller){
				/**
				 * Create a new window to handle the modal dialog
				 */
				var modalWin = Ti.UI.createWindow({
					modal: true,
					title: "Bookmarks",
					width: Ti.UI.FILL,
					height: "60%", 
					bottom: 0,
					backgroundColor: 'transparent'
				});
				
				/**
				 * Create the view controller, and add the primary view to the modal window
				 */
				var modalController = Alloy.createController(_controller, _options);
				modalWin.add(modalController.getView());
				
				/**
				 * Listen for modalController Close Event
				 */
				modalController.getView().addEventListener('close', function(e){
					modalWin.close();
				});
				
				/**
				 * Open the window as modal
				 */
				modalWin.open();
				
			}
			else {
				Ti.API.error("Mandatory parameter '_controller' not specified");
			}
		},
		
	},
	
	/**
	 * Initialize the application
	 * NOTE: This should only be fired in index controller file and only once.
	 * @type {Function}
	 */
	init: function(params) {
		
		/**
		 * First Run - load JSON data into the sqlite database
		 */
		var isDataLoaded = Ti.App.Properties.getBool('data-loaded', false);
		if(!isDataLoaded){
			this.loadData();
		}
		
		if(OS_IOS && params.navGroup){
			this.Navigator.navGroup = params.navGroup;
		}
		
		Ti.App.addEventListener("resume", this.onAppResume);
		Ti.App.addEventListener("resumed", this.onAppResume); 
		
	},
	
	loadData: function(){
				
		var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json"); 
		data = JSON.parse(file.read().text).users; 
		
		_.each(data, function(user){
			var model = Alloy.createModel("user", { 
				"contactId": user.id,
			    "favorite": user.favorite,
			    "firstName": user.firstName,
			    "lastName": user.lastName,
			    "company": user.company,
			    "email": user.email,
			    "phone": user.phone,
			    "latitude": user.latitude,
			    "longitude": user.longitude,
			    "photo": user.photo,
			    "about": user.about
			});
			model.save();
		});
		
		  
		data = null;
		file = null;
		
		Ti.App.Properties.setBool('data-loaded', true);
		 
	},
	
	/**
	 * Fired when the application comes out of a resumed state
 	 * @param {Object} params
	 */
	onAppResume: function(params){
		handleRoute();
	},
	
	handleRoute: function(){
		
		//var args = Ti.App.getArguments();
		
		var args = {
			url: "directory://contacts/53e5868724a25992582407aa?"
		};
		var elems = args.url.split("/");
		Ti.API.info(elems);
		
		this.Navigator.open("profile", {id:elems[3]});
		
	}
};





