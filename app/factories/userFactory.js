app.factory('userFactory', function($http, $rootScope, $location, $timeout, localStorageService, Base64) {

	var factory = {};

	$rootScope.signedIn = false;

	factory.APIClient = {
		clientId: 'webClient',
		clientSecret: 'N0TS0MUCH0FAS3CR3T'
	};

	factory.API = 'http://192.168.10.61:3000';

	factory.userData = {};

	factory.checkAuth = function(redirect) {
		var token = localStorageService.get('token');

		if(token !== undefined && token !== '' && token !== null) {

			// De client authenticatie instellen (clientId en clientSecret)
			var encoded = Base64.encode(factory.APIClient.clientId + ':' + factory.APIClient.clientSecret);
			$http.defaults.headers.common.Authorization = 'Basic ' + encoded;

			// De user authenticatie (token) instellen
			$http.defaults.headers.common['Authorization'] = 'Bearer ' + token;

			// UserData ophalen
			$http({
				method: 'GET',
				url: factory.API+'/me'
			}).success(function(data, status, headers, config) {
				factory.getMeSuccess(data, status, headers, config, redirect);
			}).error(function(data, status, headers, config){
				localStorageService.set('token', null);
				alert(status);
				console.log(data);
			});
		}
	};

	factory.signIn = function(email, password, redirect) {

		var encoded = Base64.encode(factory.APIClient.clientId + ':' + factory.APIClient.clientSecret);
		$http.defaults.headers.common.Authorization = 'Basic ' + encoded;

		$http({
			method: 'POST',
			url: factory.API+'/token',
			data: {
				grant_type: 'password',
				username: email,
				password: password
			}
		}).success(function(data, status, headers, config){

			$rootScope.loading = false;

			if(data.access_token) {
				// Token bewaren in localStorage
				localStorageService.set('token', data.access_token);

				// Token voor deze sessie instellen als default auth header
				$http.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;

				// UserData ophalen
				$http({
					method: 'GET',
					url: factory.API+'/me'
				}).success(function(data, status, header, config) {
					factory.getMeSuccess(data, status, headers, config, redirect);
				}).error(function(data, status, headers, config){
					// THIS HAS TO BE HANDLED
					alert(status);
					alert(data);
					console.log(data);
				});

			}else{
				alert('Something went wrong on our side. Didn\'t get a token.');
			}

		}).error(function(data, status, headers, config){

			$rootScope.loading = false;

			console.log(data);

			switch(status) {
				case 401:
					alert('Your credentials were invalid.');
					break;
				default:
					alert('Something went terribly wrong on our side.');
					break;
			}
		});
	};

	factory.getMeSuccess = function(data, status, headers, config, redirect) {
		factory.userData = data;
		console.log(data);
		if(factory.userData.verified) {

			$rootScope.signedIn = true;
			if(factory.userData.name == '') {
				$rootScope.navigate('tutorial');
			}else if(redirect) {
				$location.path(redirect);
			}else{
				$location.path('/projects');
			}
		}else{
			console.log('Not verified');

			$rootScope.navigate('verification');
		}
	};

	factory.verify = function(email, code, callback) {
		$http({
			method: 'POST',
			url: factory.API+'/verify',
			data: {
				email: email,
				code:  code
			}
		}).success(function(data, status, headers, config){
			callback(false);
		}).error(function(data, status, headers, config){
			callback(data.msg || 'error');
		});
	};

	factory.signOut = function(email, password, redirect) {
		localStorageService.set('token', null);
		factory.userData = {};
		$rootScope.signedIn = false;

		$rootScope.navigate('');
	};

	factory.update = function(name, callback) {
		if(name == undefined || name == '') return callback('Your name was invalid', {});

		$http({
			method: 'POST',
			url: factory.API+'/me',
			data: {
				name: name
			}
		}).success(function(data, status, headers, config){
			factory.userData = data;
			callback(false);
		}).error(function(data, status, headers, config){
			callback(data.msg);
		});
	};

	return factory;
});
