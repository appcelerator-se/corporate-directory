exports.definition = {
	config: {
		columns: {
		    "contactId": "text",
		    "favorite": "integer",
		    "firstName": "text",
		    "lastName": "text",
		    "company": "text",
		    "email": "text",
		    "phone": "text", 
		    "latitude": "real",
		    "longitude": "real",
		    "photo": "text",
		    "about": "text"
		},
		adapter: {
			type: "sql",
			collection_name: "user"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
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