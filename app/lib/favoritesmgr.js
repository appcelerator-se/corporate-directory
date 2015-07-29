
/**
 * FavoritesManager
 * Utility class for managing application favorites
 */
var FavoritesManager = {
			
	/**
	 * Reference to the local storage array that persists between sessions
	 */
	favorites: Ti.App.Properties.getList("favorites", []),
	
	/**
	 * Determines if the passed in ID of the contact currently exists in the bookmarks array. 
	 * Returns TRUE if successful.
	 * 
	 * @param {String} id - the ID of the contact that is used to search the bookmarks array
	 */
	exists: function _exists(id){
		
		/**
		 * Return the result of the search for the user id in the bookmarks
		 * array. (Uses the UnderscoreJS _.find() function )
		 */
		return _.find(this.favorites, function(item){
			return id === item;
		});
	},
	
	/**
	 * Checks to see if the item id already exists as a favorite, and if not adds it to the favorites
	 * array and persists it into local storage
	 * 
	 * @param {String} id - the ID of the contact to add to your favorites list
	 */
	add: function _push(id){
		
		if(!this.exists(id)){
			/**
			 * Then add this user to the bookmarks array, and update the button title for favorites
			 */
			this.favorites.push(id);
		}
		
		/**
		 * Update the bookmarks array in Ti.App.Properties
		 */
		Ti.App.Properties.setList("favorites", this.favorites);
	},
	
	/**
	 * Removes the passed in contact id from the favorites list
	 * 
	 * @param {String} id - the ID of the contact to remove from your favorites list
	 */
	remove: function _remove(id){
		
		/**
		 * Else remove the user from the bookmarks array (usess Underscore js difference function), 
		 * and update the button title accordingly
		 */
		this.favorites = _.difference(this.favorites, [id]);
	    
	    /**
		 * Update the bookmarks array in Ti.App.Properties
		 */
		Ti.App.Properties.setList("favorites", this.favorites); 
		}
		
};
module.exports = FavoritesManager;

