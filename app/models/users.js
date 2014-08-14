exports.definition = {
	config: {
		columns: {
		    "guid": "text",
		    "picture": "text",
		    "name": "text",
		    "company": "text",
		    "email": "text",
		    "phone": "text",
		    "address": "text",
		    "about": "text",
		    "favorite": "int"
		},
		adapter: {
			type: "sql",
			collection_name: "users"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
			save: function(model){
				Ti.API.info(model);
				
				return model;
			}
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});

		return Collection;
	}
};