/**
 * Created by Trooper on 19/11/15.
 */
angular.module('userService', [])

.factory('User', function($http){

    var userFactory = {}

    userFactory.create = function(user){
        return $http.post('/api/signup', user);

    }

    userFactory.all = function(){
        return $http.get('/api/users');

    }

    return userFactory;

})