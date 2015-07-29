
/**
 * FavoritesManager
 */

var FavoritesManager = (function _FavoritesManager(){
	var _instance = null;
	
	function _create(){
		return {
			favorites: Ti.App.Properties.getList("favorites", []),
			
			/**
			 * Determines if the passed in ID of the contact currently exists in the bookmarks array. 
			 * Returns TRUE if successful.
			 * 
			 * @param {Object} id - the ID of the contact that is used to search the bookmarks array
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
			
			remove: function _remove(id){
				
				Ti.API.info(this.favorites);
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
	}
	
	if(!_instance){
		_instance = _create();
	}
	
	return _instance;
	
})();
exports.FavoritesManager = FavoritesManager;

