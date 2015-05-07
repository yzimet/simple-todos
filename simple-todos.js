Tasks = new Mongo.Collection("tasks");

// code to run on the client
if (Meteor.isClient) {
	
	Meteor.subscribe("tasks");
	
	Template.body.helpers({
		tasks: function() {
			if (Session.get("hideCompleted")) {
				// filter tasks
				return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
			} else {
				return Tasks.find({}, {sort: {createdAt: -1}});
			}
		},
		hideCompleted: function() {
			return Session.get("hideCompleted");
		},
		incompleteCount: function() {
			return Tasks.find({checked: {$ne: true}}).count();
		}
	});
	
	Template.body.events({
		"submit .new-task": function(event) {
			var text = event.target.text.value;
			
			Meteor.call("addTask", text);
			
			// clear form
			event.target.text.value = "";
			
			// prevent deafult form submit
			return false;
		},
		"change .hide-completed input": function(event) {
			Session.set("hideCompleted", event.target.checked);
		}
	});
	
	Template.task.events({
		"click .toggle-checked": function() {
			// toggle value
			Meteor.call("setChecked", this._id, !this.checked);
		},
		"click .delete": function() {
			Meteor.call("deleteTask", this._id);
		},
		"click .toggle-private": function() {
			Meteor.call("setPrivate", this._id, !this.private);
		}
	});
	
	Template.task.helpers({
		isOwner: function() {
			return this.owner === Meteor.userId();
		}
	});
	
	// confituge the accounds UI to use usernames instead of email
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
}

Meteor.methods({
	addTask: function(text) {
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		Tasks.insert({
			text: text,
			createdAt: new Date(),
			owner: Meteor.userId(), // id of logged in user
			username: Meteor.user().username // username of logged in user
		});
	},
	deleteTask: function(taskId) {
		var task = Tasks.findOne(taskId);
		if (task.private && task.owner !== Meteor.userId()) {
			// if the task is private, make sure only the owner can delete it
			throw new Meteor.Error("not-authorized");
		}
		Tasks.remove(taskId);
	},
	setChecked: function(taskId, checked) {
		var task = Tasks.findOne(taskId);
		if (task.private && task.owner !== Meteor.userId()) {
			// if the task is private, make sure only the owner can update it
			throw new Meteor.Error("not-authorized");
		}
		Tasks.update(taskId, {$set: {checked: checked}});
	},
	setPrivate: function(taskId, private) {
		var task = Tasks.findOne(taskId);
		
		// only the task owner can make a task private
		if (task.owner !== Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		
		Tasks.update(taskId, {$set: {private: private}});
	}
});

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
	
	Meteor.publish("tasks", function() {
		return Tasks.find({
			$or: [
				{ private: {$ne: true} },
				{ owner: this.userId }
			]
		});
	});
}