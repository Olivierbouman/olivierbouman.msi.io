
// Reading in the JSON
function openJSONFile() {
    // Initialize buttons
    document.getElementsByName("radio")[0].checked = false
    document.getElementsByName("radio")[1].checked = false

    if (getBlocks().length==0){
        null
    } else if (confirm("Are you sure you want to open a new file?\nMake sure all data was saved!")==false){
        return
    }
    fileInput = document.createElement("input")
    fileInput.type='file'
    fileInput.style.display='none'
    fileInput.onchange=readFile
    fileInput.func=extract_data
    document.body.appendChild(fileInput)
    clickElem(fileInput)
}

function extract_data(contents, file_name) {
    var json = JSON.parse(contents)
    // document.getElementsByClassName('file_name')[0].innerHTML = 'Document:<br/>'+ file_name.replace('.json','')
    document.getElementsByClassName('document')[0].setAttribute('id', file_name)
    document.getElementsByClassName('document')[0].innerHTML = '<div class="document" id='+ file_name +' style="padding-left: 100px"></div>'
    parseJSON(json)
    convertSavedDataToCorrectLayOut()
    // convertSavedDataToCorrectLayOut_2()
    scroll(0,0)
    document.getElementsByName("radio")[0].checked = true
    document.getElementsByName("radio")[1].checked = true
}

function parseJSON(json) {
    for (var block_id in json) {
      var text         = json[block_id]['words']
      var level_id     = json[block_id]['level_id']
      var level_number = json[block_id]['level_number']
  
      var font        = json[block_id]['font']
      var font_size   = font['FONTSIZE']
      var font_color  = font['FONTCOLOR']
      var font_type   = font['FONTTYPE']
      var font_style  = font['FONTSTYLE']
      var font_weight = font['FONTWEIGHT']
      var font_id     = font['ID']
  
      var text_block_style = 'style="font-size:'+ font_size +'; color:'+ font_color + ';\
       font-family:' + font_type + '; font-style:' + font_style + '; font-weight:'+ font_weight +'"'
  
      var level_block  = '<div class="level_block"><span></span></div>'
      var text_block   = '<div class="text_block" '+ text_block_style +'><span></span>' + text + '</div>'
      var parent_block = '<div class="parent" block_id='+ block_id +' level_id='+ level_id +'\
       level_number='+ level_number +' font_id='+ font_id +' style="display: flex">' + level_block + text_block + '</div>'
      document.body.getElementsByClassName('document')[0].innerHTML += parent_block
    }
  
    // console.log(level_block)
    // console.log(text_block)
    // console.log(json)
}



function convertSavedDataToCorrectLayOut(){
    var blocks = getBlocks()
    var last_block  = blocks[blocks.length-1]
    var assigned_block = []

    for (block of blocks){
        var current_level_id = levelId(block)
        if (block != last_block){
            var next_block_color = textBlockBackgroundColor(block.nextElementSibling)
            var next_level_id = levelId(block.nextElementSibling)
            if (current_level_id==next_level_id){
                assigned_block.push(block)
            } else if (next_block_color=='lightgray'){  //issue with seperated blocks
                continue
            } else {
                assigned_block.push(block)
                assignSavedLevels(assigned_block)
                assigned_block = []
            }
        } else if (levelId(last_block)==levelId(blocks[blocks.length-2])){
        // } else if (last_block.getAttribute('level_id')==blocks[blocks.length-2].getAttribute('level_id')){
            assigned_block.push(block)
            assignSavedLevels(assigned_block)
        } else {
            assignSavedLevels([last_block])
        }
    }
}

function convertSavedDataToCorrectLayOut_2(){
    var blocks = getBlocks()
    var all_level_ids = []
    for (block of blocks){
        if (all_level_ids.includes(livelId(block))){
            all_level_ids.push(block)
        }
    }
}



function assignSavedLevels(blocks){
    if (!levelId(blocks[0]).match(/no_level/i)){
        level = levelId(blocks[0]).match(/[a-z]+/i)[0]
        level_to_assign = level.charAt(0).toUpperCase() + level.slice(1)
        for (block_ of blocks){
            fontSelected(block_)
        }
        assignLevel(level_to_assign, 'active')
    }
}

function readFile(e) {
    var file = fileInput.files[0]
    var file_name = file.name
    if (!file) {
        return
    }
    var reader = new FileReader()
    reader.onload = function(e) {
        var contents = e.target.result;
        fileInput.func(contents, file_name)
        document.body.removeChild(fileInput)
    }
    reader.readAsText(file)
}

function clickElem(elem) {
    var eventMouse = document.createEvent("MouseEvents")
    eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    elem.dispatchEvent(eventMouse)
}

