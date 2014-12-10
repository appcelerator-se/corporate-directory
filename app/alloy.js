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
 * The contents of this file will be executed before any of
 * your view controllers are ever executed, including the index.
 * You have access to all functionality on the `Alloy` namespace.
 *
 * This is a great place to do any initialization for your app
 * or create any global variables/functions that you'd like to
 * make available throughout your app. You can easily make things
 * accessible globally by attaching them to the `Alloy.Globals`
 * object. For example:
 *
 * Alloy.Globals.someGlobalFunction = function(){};
 *
 * @copyright
 * Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */




/* 
 * App Singleton Object.
 * This global object allows us to create a singluar instance to manage application functions across controllers
 * In this case we are going to primarily use this object to handle cross platform app navigation.
 * 
 * @type {Object}
 */
Alloy.Globals.App = {
	
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
					
					if (!win.getActivity()) {
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
				
			} 
			else if(OS_IOS){
				this.navGroup.openWindow(win,{animated:true});
			}
			else{
				Ti.API.info(this.navGroup.apiName);
				this.navGroup.open(win, {animated:true});
			}
		}
	},
	
	/**
	 * Initialize the application
	 * NOTE: This should only be fired in index controller file and only once.
	 * @type {Function}
	 */
	init: function(params) {
		
		if(params.navGroup){
			this.Navigator.navGroup = params.navGroup;
		}
		
		//RESET SWITCH
		//Ti.App.Properties.setList("bookmarks", []);
		
	}
};





