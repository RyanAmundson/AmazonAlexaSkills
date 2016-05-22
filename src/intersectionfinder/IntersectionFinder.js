//var http = require('http');


function find(word){
http.get('http://api.datamuse.com/words?rel_jja='+word+'&max=5', function (res) {
    console.log('Status Code: ' + res.statusCode);

    res.on('data', function (data) {
        result += data;
    });

    res.on('end', function () {
      result = JSON.parse(result);
      for(x in result){
        results[x] = result[x].word;
      }

      console.log(results);

    });
});
}




function intersection(listA, listB){
var matches = [];
for(x in listA){
  for(y in listB){
    if(listA[x] == listB[y]){
      matches.push(listA[x]);
      y = 0;
      x++;
    }
  }
}









}




console.log(intersection(find("green"),find("plant")));
