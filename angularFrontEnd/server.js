var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var hobbies = ["Hearthstone", "reading"];
var occupations = ["Teacher", "project mangager", "web developer"];
var name = "Bryan Schauerte";
var location = "Provo, Utah";
var skills = [{id: 1, name: "ruby", experience: 'intermediate'}, { id: 2, name: "javaScript", experience: "advanced"},
  {id: 3, name: "CSS", experience: "intermediate"},{id: 4, name:"jquery", experience: "intermediate"},
  {id: 5, name: "angular", experience: 'intermediate'}, {id: 6, name: "firebase", experience: 'beginner'}];



app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});



app.route('/name').get(function(req, res){
  res.send({name: name});
  console.log(name);
})
.put(function(req, res){
  name = req.body.name;
  res.send({name: name});
});


app.route('/location').get(function(req, res) {

  res.send({location: location});
})
.post(function(req, res){
  location = req.body.location;
  res.send({location: location});
});


app.route('/hobbies').post(function(req, res) {

  hobbies.push(req.body.hobbies);
  res.send({hobbies: hobbies});

}).get(function(req, res) {
  if(req.query.order == 'desc'){
    res.send({hobbies: hobbies.reverse()});
  }
  if(req.query.order == 'asc'){console.log('asc')}
  res.send({hobbies: hobbies.sort()});
});

app.route('/occupations')

.get(function(req, res) {
  res.send({occupations: occupations});
})
.post(function(req, res){
  occupations.push(req.body.occupations);
  res.send({occupations: occupations});
});


app.get('/occupations/latest', function(req, res) {

  res.send({occupatons: occupations[occupatons.length-1]});

});
///

//? querry, skills=:statewhatTheKeywillbe

//bellow is a req.query key=value

app.route('/skills?')
.get(function(req, res){
  if(req.query.experience){

    var list =[];
    for(var i =0; i < skills.length; i++){
      if(skills[i].experience === req.query.experience){
        list.push(skills[i]);
      }
    }
    res.send(list);
  }
  else {
     res.send(skills);
   }
});


///


app.listen(5555, function() {
  console.log('Listening on 5555')
})
