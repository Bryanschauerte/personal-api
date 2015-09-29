var app = angular.module('myProfile').service('dataService',function($http, $q){


  this.getOccupations = function(){
    var deferred= $q.defer();
    $http({
      method:'GET',
      url: 'http://localhost:5555/occupations'
    }).then(function(successResponse){
      var parsedResponse = successResponse.data.occupatons;

      deferred.resolve(parsedResponse);
    })
    return deferred.promise;
  };
  this.getHobbies = function(){
    var deferred = $q.defer();

    $http({
      method: "GET",
      url: "http://localhost:5555/hobbies"
    }).then(function(res){
      var parsedResponse = res.data;
      deferred.resolve(parsedResponse);
    });
    return deferred.promise;

  }

  this.getSkills = function(){
    var deferred = $q.defer();

    $http({method: "GET", url:"http://localhost:5555/skills"}).then(function(res){
      var parsedResponse = res.data.skills
      deferred.resolve(parsedResponse);
    });
    return deferred.promise;

  }
  this.getName = function(){
    var defered = $q.defer();
    $http({method: "GET", url: "http://localhost:5555/name"}).then(function(res){
      var parsedResponse = res.data;
      defered.resolve(parsedResponse);
    });
    return defered.promise;

  }
  this.getLocation = function(){
    var defered = $q.defer();
    $http({method:"GET", url: "http://localhost:555/location"}).then(function(res){
      var parsedResponse = res.data;
      defered.resolve(parsedResponse);
    });
    return defered.promise;

  }


})
