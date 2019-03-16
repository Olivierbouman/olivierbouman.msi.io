

function exportToJsonFile() {
    if (getBlocks().length==0){
        return
    }
    if (checkForUnchecked()){
        var file_name = document.getElementsByClassName('document')[0].getAttribute('id')
        var json_output = convertHTMLToJSON()
        var dataStr = JSON.stringify(json_output)    
        var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
        var exportFileDefaultName = file_name
        var linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }
}

function checkForUnchecked(){
    blocks = getBlocks()
    for (block of blocks){
        if (levelId(block).match(/no_level/i)){
            var check = confirm("Are you sure you want to save?\nNot all blocks have been assigned yet :)\nPress OK if you want to save anyway.")
            if (check==false) {
                if (block.getAttribute('id')=='p1_b1'){
                    jumpToBlock(block)
                } else {
                    jumpToBlock(block)
                }
                return false
            } else {
                return true
            }
        }
    }
    return true
}

function convertHTMLToJSON(){
    var json = {}
    blocks = getBlocks()
    for (var block of blocks) {
        var text_block   = textBlock(block)
        var text         = text_block.innerText
        var block_id     = blockId(block)
        var level_id     = levelId(block)
        var level_number = levelNumber(block)

        var font = {}
        font['ID']         = block.getAttribute('font_id')
        font["FONTSIZE"]   = text_block.style.fontSize
        font["FONTCOLOR"]  = text_block.style.color
        font["FONTTYPE"]   = text_block.style.fontFamily
        font["FONTSTYLE"]  = text_block.style.fontStyle
        font["FONTWEIGHT"] = text_block.style.fontWeight
        
        var block_info = {'level_id': level_id, 'level_number': level_number, 'words': text, 'font': font}
        json[block_id] = block_info
    }
    return json
}


