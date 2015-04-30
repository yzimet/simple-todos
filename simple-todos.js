Tasks = new Mongo.Collection("tasks");

// code to run on the client
if (Meteor.isClient) {
	Template.body.helpers({
		tasks: function() {
			return Tasks.find({}, {sort: {createdAt: -1}});
		}
	});
	
	Template.body.events({
		"submit .new-task": function(event) {
			var text = event.target.text.value;
			
			Tasks.insert({
				text: text,
				createdAt: new Date()
			});
			
			// clear form
			event.target.text.value = "";
			
			// prevent deafult form submit
			return false;
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
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
