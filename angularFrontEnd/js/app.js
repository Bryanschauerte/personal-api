var app = angular.module('myProfile',['ngRoute'])
app.config(function($routeProvider){

  $routeProvider
  .when('/', {
    templateUrl:"/views/homePage.html",
    controller: 'mainCtrl'
  })
  .when('/me', {
    templateUrl: "/views/personalPage.html",
    controller: 'mainCtrl'
  })
  .when('/skills',{
    templateUrl: "/views/skills.html",
    controller: 'mainCtrl'
  })

  .otherwise({redirectTo: '/'});


});
