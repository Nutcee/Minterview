/**
 * Created by Trooper on 18/11/15.
 */

var error = '';

angular.module('mainCtrl', [])

.controller('MainController', function($rootScope, $location, Auth){

    var vm = this;

    vm.loggedIn = Auth.isLoggedIn();

    $rootScope.$on('$routeChangeStart', function(){

        vm.loggedIn = Auth.isLoggedIn();

        Auth.getUser()
            .then(function(data){
                vm.user = data.data;


            });

    });

    vm.doLogin = function(){

        vm.processing = true;
        vm.error = '';
        Auth.login(vm.loginData.emailid, vm.loginData.password)
            .success(function(data){
                vm.processing = false;

                Auth.getUser()
                    .then(function(data){
                        vm.user = data.data;
                    });

                if(data.success){
                    $location.path('/');
                } else {
                    error = data.message;
                    vm.error = data.message;
                }
            });
    }
    vm.doLogout = function(){
        Auth.logout();
        $location.path('/logout');
    }

});