

function applyChangeLevel(){
    button = 'button' + document.getElementById('index').value
    level  = document.getElementById('level').value

    if (['1','2','3','4','5','6','7'].includes(document.getElementById('index').value)){
        document.getElementById(button).innerText = level
        document.getElementById(button).value = level
        document.getElementById('index').value = ''
        document.getElementById('level').value = ''
        console.log(button, level)
    } else if (document.getElementById('index').value==''){
        return
    }
    else {
        alert("Please choose a correct index,\nNo level cannot be changed")
    }

}



