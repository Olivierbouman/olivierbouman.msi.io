

function getBlocks(){
    return document.getElementsByClassName('parent')
}

function textBlockBackgroundColor(block){
    return block.getElementsByClassName('text_block')[0].style.backgroundColor
}

function levelId(block){
    return block.getAttribute('level_id')
}

function blockId(block){
    return block.getAttribute('block_id')
}

function fontId(block){
    return block.getAttribute('font_id')
}

function levelNumber(block){
    return block.getAttribute('level_number')
}

function textBlock(block){
    return block.getElementsByClassName('text_block')[0]
}

function levelBlock(block){
    return block.getElementsByClassName('level_block')[0]
}




