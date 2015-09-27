var app = angular.module('myProfile').controller('mainCtrl', function($scope, dataService){


  $scope.hobbies = [];
  $scope.occupations = [];
  $scope.name = "";
  var location = "";
  var skills = [];


  $scope.occupations = [];

  $scope.getOccupations = function(){
    $scope.occupations = dataService.getOccupations().then(function(res){
      $scope.occupations = res;
    })
  };
$scope.getOccupations();


})
