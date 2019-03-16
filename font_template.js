
// 5-3-3-2

function fontDefault(block){
    // Text Block
    resetHightlightLevelNumber(block)
    text_block = textBlock(block)
    text_block.style.border="0px solid rgb(250, 250, 250)"
    text_block.style.backgroundColor="rgb(250, 250, 250)"
    text_block.style.opacity = "1"
    text_block.style.borderRadius="0px"

    // Level Block
    var level_block = levelBlock(block)
    level_block.style.width="300px"
    level_block.style.textAlign="center"

    // Span Text
    var span_text   = block.getElementsByTagName('span')[0]
    span_text.innerText = ''
    span_text.style = ''

    // Block
    block.style.paddingBottom = "10px"
    block.setAttribute('level_id', 'no_level_' + blockId(block))
}

function fontSelected(block){
    // Text Block
    resetHightlightLevelNumber(block)
    text_block = textBlock(block)
    text_block.style.border="3px solid rgb(255, 178, 90)"
    text_block.style.backgroundColor="rgb(255, 178, 90)"
    text_block.style.opacity = "1"
    text_block.style.borderRadius="5px"

    //Level Block
    var level_block = levelBlock(block)
    level_block.style.width="300px"
    level_block.style.textAlign="center"

    // Span Text
    var span_text   = block.getElementsByTagName('span')[0]
    span_text.innerText = ''
    span_text.style = ''

    // Block
    block.style.paddingBottom = "10px"
    block.setAttribute('level_id', 'no_level_' + blockId(block))
}

function fontSuggestionTop(block, level_suggestion){
    // Text Block
    resetHightlightLevelNumber(block)
    text_block = textBlock(block)
    text_block.style.border="3px solid rgb(255, 178, 90)"
    text_block.style.backgroundColor="rgb(255, 178, 90)"
    text_block.style.opacity = "1"
    text_block.style.borderRadius="2px 2px 0px 0px"

    //Level Block
    var level_block = levelBlock(block)
    level_block.style.width="300px"
    level_block.style.textAlign="center"

    // Span Text
    var span_text   = block.getElementsByTagName('span')[0]
    span_text.innerText = level_suggestion.charAt(0).toUpperCase() + level_suggestion.slice(1).replace('_',' ') + '?'
    span_text.style = "display: inline-block; width:55%; background-color:rgb(244, 188, 25, 0.95); font-size:30px;font-family: Arial; font-color:black; color:darkblue ; border-radius: 5px; transition: all 0.4s ease"

    // Block
    block.style.paddingBottom = "0px"
    block.setAttribute('level_id', 'no_level_' +  blockId(block))

}

function fontSuggestionMiddle(block){
    // Text Block
    resetHightlightLevelNumber(block)
    text_block = textBlock(block)
    text_block.style.border="3px solid rgb(255, 178, 90)"
    text_block.style.backgroundColor="rgb(255, 178, 90)"
    text_block.style.opacity = "1"
    text_block.style.borderRadius="0px 0px 0px 0px"

    //Level Block
    var level_block = levelBlock(block)
    level_block.style.width="300px"
    level_block.style.textAlign="center"

    // Span Text
    var span_text   = block.getElementsByTagName('span')[0]
    span_text.innerText = ''
    span_text.style = ''

    // Block
    block.style.paddingBottom = "0px"
    block.setAttribute('level_id', 'no_level_' + blockId(block))
}

function fontSuggestionBottom(block, first_is_last){
    // Text Block
    resetHightlightLevelNumber(block)
    text_block = textBlock(block)
    text_block.style.border="3px solid rgb(255, 178, 90)"
    text_block.style.backgroundColor="rgb(255, 178, 90)"
    text_block.style.opacity = "1"
    text_block.style.borderRadius="0px 0px 6px 2px"

    //Level Block
    var level_block = levelBlock(block)
    level_block.style.width="300px"
    level_block.style.textAlign="center"

    // Span Text
    if (first_is_last){
        highlightLevelNumber(block)
        var span_text = block.getElementsByTagName('span')[0]
        span_text.innerText = level_suggestion.charAt(0).toUpperCase() + level_suggestion.slice(1).replace('_',' ') + '?'
        span_text.style = "display: inline-block; width:55%; background-color:rgb(244, 188, 25, 0.95); font-size:30px;font-family: Arial; font-color:black; color:darkblue ; border-radius: 5px; transition: all 0.4s ease"
        } else {
        var span_text = block.getElementsByTagName('span')[0]
        span_text.innerText = ''
        span_text.style = ''
    }

    // Block
    block.style.paddingBottom = "10px"
    block.setAttribute('level_id', 'no_level_' + blockId(block))
}

function fontAssignedTop(block, identifier, level){
    // Text Block
    highlightLevelNumber(block)
    var text_block = textBlock(block)
    text_block.style.border="5px solid lightgreen"
    text_block.style.backgroundColor = "lightgreen"
    text_block.style.opacity = "1"
    text_block.style.borderRadius="2px 2px 0px 0px"

    // Level Block
    var level_block = levelBlock(block)
    level_block.style.width="300px"
    level_block.style.textAlign="center"
    // level_block.className = level.replace(/ /g,"_").toLowerCase() + "_" + identifier.getAttribute('id')

    // Span Text
    var span_text = block.getElementsByTagName('span')[0]
    span_text.innerText = level
    span_text.style = "display: inline-block; width:55%; background-color:rgb(244, 208, 65, 0.95); font-size:20px;font-family: Arial; font-color:black; color:darkblue ; border-radius: 5px; transition: all 0.4s ease"
    
    // Block
    block.style.paddingBottom = "0px"
    block.setAttribute('level_id', level.replace(/ /g,"_").toLowerCase() + "_" + blockId(identifier))
}

function fontAssignedMiddle(block, identifier, level){
    // Text Block
    resetHightlightLevelNumber(block)
    var text_block = textBlock(block)
    text_block.style.border="5px solid lightgreen"
    text_block.style.backgroundColor = "lightgreen"
    text_block.style.opacity = "1"
    text_block.style.borderRadius="0px 0px 0px 0px"

    // Level Block
    var level_block = levelBlock(block)
    level_block.style.width="300px"
    level_block.style.textAlign="center"

    // Span Text
    var span_text = block.getElementsByTagName('span')[0]
    span_text.innerText = ''
    span_text.style = ''

    // Block
    block.style.paddingBottom = "0px"
    block.setAttribute('level_id', level.replace(/ /g,"_").toLowerCase() + "_" + blockId(identifier))
}

function fontAssignedBottom(block, identifier, level, first_is_last){
    // Text Block
    resetHightlightLevelNumber(block)
    var text_block = textBlock(block)
    text_block.style.border="5px solid lightgreen"
    text_block.style.backgroundColor = "lightgreen"
    text_block.style.opacity = "1"
    text_block.style.borderRadius="0px 0px 6px 2px"

    // Level Block
    var level_block = levelBlock(block)
    level_block.style.width="300px"
    level_block.style.textAlign="center"

    // Span Text
    if (first_is_last){
        highlightLevelNumber(block)
        var span_text = block.getElementsByTagName('span')[0]
        span_text.innerText = level
        span_text.style = "display: inline-block; width:55%; background-color:rgb(244, 208, 65, 0.95); font-size:20px;font-family: Arial; font-color:black; color:darkblue ; border-radius: 5px; transition: all 0.4s ease"
    } else {
        var span_text = block.getElementsByTagName('span')[0]
        span_text.innerText = ''
        span_text.style = ''//"display: inline-block; width:55%; background-color:rgb(244, 208, 65, 0.95); font-size:20px;font-family: Arial; font-color:black; color:darkblue ; border-radius: 5px; transition: all 0.4s ease"
    }
    
    // Block
    block.style.paddingBottom = "10px"
    block.setAttribute('level_id', level.replace(/ /g,"_").toLowerCase() + "_" + blockId(identifier))
}



////////
function fontDiscarded(block, level, identifier){
    // Text Block
    resetHightlightLevelNumber(block)
    text_block = textBlock(block)
    text_block.style.border="3px solid lightgray"
    text_block.style.backgroundColor="lightgray"
    text_block.style.opacity = "0.5"
    text_block.style.borderRadius="0px 0px 0px 0px"

    //Level Block
    var level_block = levelBlock(block)
    level_block.style.width="300px"
    level_block.style.textAlign="center"

    // Span Text
    var span_text   = block.getElementsByTagName('span')[0]
    span_text.innerText = ''
    span_text.style = ''

    // Block
    block.style.paddingBottom = "0px"
    block.setAttribute('level_id', 'discard_' + blockId(identifier))
}

