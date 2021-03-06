var app = angular.module('Unify', ['ngRoute', 'ngAnimate', 'LocalStorageModule', 'ngTagsInput', 'unifyFilters']).config(function($routeProvider) {

	$routeProvider.when('/', {
		templateUrl: 'app/views/home.html',
		controller:  'homeController'

	}).when('/signin', {
		templateUrl: 'app/views/signin.html',
		controller:  'signInController'
	}).when('/signin/:action', {
		templateUrl: 'app/views/signin.html',
		controller:  'signInController'
	}).when('/resetpass/:email/:code', {
		templateUrl: 'app/views/signin.html',
		controller:  'signInController'
	}).when('/verification/:email?/:code?', {
		templateUrl: 'app/views/verification.html',
		controller:  'verificationController'

	}).when('/tutorial', {
		templateUrl: 'app/views/tutorial.html',
		controller:  'tutorialController'
	}).when('/help/:category?', {
		templateUrl: 'app/views/help.html',
		controller:  'helpController'

	}).when('/start', {
		templateUrl: 'app/views/start.html',
		controller:  'startController'

	}).when('/notifications', {
		templateUrl: 'app/views/notifications.html',
		controller:  'notificationsController'

	}).when('/projects/new', {
		templateUrl: 'app/views/new.html',
		controller:  'newProjectController'
	}).when('/projects/:id/:name?/:view?', {
		templateUrl: 'app/views/project.html',
		controller:  'projectController'

	}).when('/settings', {
		templateUrl: 'app/views/settings.html',
		controller:  'settingsController'

	}).otherwise(
	{
		redirectTo: '/'
	});

}).run( function($rootScope, $location) {

	// Lijst met pagina's die niet bezocht mogen worden als er niet ingelogd is
	$rootScope.protectedPages = ['/notifications', '/start', '/projects/new', '/projects/:id/:name?/:view?', '/settings', '/tutorial'];

	// Elke keer dat een andere pagina geladen wordt, voeren we dit uit:
	$rootScope.$on( "$routeChangeStart", function(event, next, current) {

		// Naar boven scrollen
		window.scroll(0,0);

		// Project-menu legen
		$rootScope.$emit('projectMenuClear');

		// Kijken of de pagina waar de gebruiker heen gaat en of die beveiligd is
		if(next.$$route && next.$$route.originalPath && $rootScope.protectedPages.indexOf(next.$$route.originalPath) > -1 && !$rootScope.signedIn) {

			var oldPath = $location.path();
			$location.path('/signin').search('redirect', oldPath);

		}

    });

	// Shortcut functie (wordt door de hele app gebruikt)
	$rootScope.navigate = function(path) { $location.path('/'+path); };

	// Hide the initial spinner
	document.getElementById('initialSpinner').style.display = 'none';
	// Show the page holder
	document.getElementById('pageHolder').style.display = 'block';

});


angular.module('unifyFilters', []).filter('fileSelection', function() {
  return function(input, selection) {
    if(selection == 'all') {
    	return input;
    }else{
    	var filtered = [];
    	input.forEach(function(item) {
    		if(item.type == selection) {
    			filtered.push(item);
    		}
    	});
    	return filtered;
    }
  };
}).filter('taskSelection', ['userFactory', function(userFactory) {
  return function(input, selection) {
	if(input == undefined) return [];

    if(selection == 'all') {
    	return input;
    }else if(selection == 'mine'){
    	var filtered = [];
    	input.forEach(function(item) {
    		if(item.assignedTo.email == userFactory.userData.email) {
    			filtered.push(item);
    		}
    	});
    	return filtered;
    }else if(selection == 'mine-unfinished'){
    	var filtered = [];
    	input.forEach(function(item) {
    		if(item.assignedTo.email == userFactory.userData.email && !item.finished) {
    			filtered.push(item);
    		}
    	});
    	return filtered;
    }else if(selection == 'unfinished'){
    	var filtered = [];
    	input.forEach(function(item) { if(!item.finished) filtered.push(item) });
    	return filtered;
    }else if(selection == 'finished'){
    	var filtered = [];
    	input.forEach(function(item) { if(item.finished) filtered.push(item) });
    	return filtered;
    }else{
    	return input;
    }
  };
}]);

/*angular.element(document).ready(function() {
	angular.bootstrap(document.getElementById("document"), ['Unify']);
});*/