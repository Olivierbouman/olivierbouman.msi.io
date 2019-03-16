
// Read in from back-end



window.onload = function () { loadJSON() }

function loadJSON(callback) {
  var xobj = new XMLHttpRequest()
  xobj.overrideMimeType("application/json")
  // xobj.open('GET', 'bcbs.json', true)
  xobj.open('GET', 'eba.json', true)
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      json = JSON.parse(xobj.responseText)
      parseJSON(json)
    }
  }
  xobj.send(null)
}

