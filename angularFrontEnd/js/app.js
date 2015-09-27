var app = angular.module('myProfile',['ngRoute'])
.config(function($routeProvider){

  $routeProvider
  .when('/', {
    templateUrl:"/views/homePage.html"
  })
  .when('/me', {
templateUrl: "/views/personalPage.html"
  })
  .when('/skills',{
    templateUrl: "/views/skills.html"
  })

  .otherwise({redirectTo: '/'});


});
