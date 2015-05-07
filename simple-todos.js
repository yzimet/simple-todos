Tasks = new Mongo.Collection("tasks");

// code to run on the client
if (Meteor.isClient) {
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
			Tasks.update(this._id, {$set: {checked: !this.checked}});
		},
		"click .delete": function() {
			Tasks.remove(this._id);
		}
	});
	
	// confituge the accounds UI to use usernames instead of email
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
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
	}
});
