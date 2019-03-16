

// Search for way to assign levels to blocks
function cleanOrange(){
    blocks = getBlocks()
    for (block of blocks){
        color = textBlockBackgroundColor(block)
        if (color=="rgb(255, 178, 90)"){
            fontDefault(block)
        }
    }
}

function lookAround(){
    var font_levels = {}
    var blocks = getBlocks()
    for (block of blocks){
        var font_id = fontId(block)
        var level_id = levelId(block)
        var level = level_id.match(/no_level|[a-z]+/i)[0]

        if (font_levels.hasOwnProperty(font_id) && level != 'no_level'){
            if (font_levels[font_id].hasOwnProperty(level)){
                font_levels[font_id][level] += 1
            } else {
                font_levels[font_id][level] = 1
            }
        } else if (level != 'no_level') {
            font_levels[font_id] = {}
            font_levels[font_id][level] = 1
        }
    }
    return font_levels
}

function getMostUsedLevel(font_levels){
    //maybe alltogether drop font_ids that are assigned multiple levels?
    for (font_id in font_levels){
        var obj = font_levels[font_id]
        var high = Object.keys(obj).reduce(function(a, b){ return obj[a] > obj[b] ? a : b })
        font_levels[font_id] = high
    }
    return font_levels
}


// Find the "blocks of blocks" where to assign these levels to
function findFontBlocks(){
    const blocks = getBlocks()
    var font_blocks = []
    var font_block  = [blocks[0]]
    var last_block  = blocks[blocks.length-1]

    for (var block of blocks){
        var current_font_id = fontId(block)
        if (block != last_block){
            var next_font_id = fontId(block.nextElementSibling)
            var next_level_number = checkForLevelNumber(block.nextElementSibling)
            if (current_font_id==next_font_id && (!next_level_number)){
                font_block.push(block.nextElementSibling)
            } else {
                font_blocks.push(font_block)
                font_block = [block.nextElementSibling]
            }
        }
    }
    font_blocks.push(font_block)
    return font_blocks
}

function findSuggestionFontBlock(block){
    if (textBlockBackgroundColor(block)=='lightgreen'){return []}
    var suggestion_block = [block]
    var blocks = getBlocks()
    var last_block = blocks[blocks.length-1]
    
    if (block!=last_block){
        var start_font_id = fontId(block)
        var next_font_id = fontId(block.nextElementSibling)
        var next_level_number = checkForLevelNumber(block.nextElementSibling)
        while (start_font_id==next_font_id && (!next_level_number) && block!=last_block && color!='lightgreen'){
            block = block.nextElementSibling
            color = textBlockBackgroundColor(block)
            next_font_id = fontId(block.nextElementSibling)
            next_level_number = checkForLevelNumber(block.nextElementSibling)
            suggestion_block.push(block)
        }
    }
    return suggestion_block
}

function dropAlreadyAssigned(font_blocks){
    for (font_block of font_blocks){
        delete_blocks = []
        for (block of font_block){
            if (block.getAttribute('level_id').match(/no_level|[a-z]+/i)[0]!='no_level'){
                delete_blocks.push(block)
            }
        }
        for (delete_block of delete_blocks){
            var index = font_block.indexOf(delete_block)
            font_block.splice(index, 1)
        }
    }
    return font_blocks
}

function cleanLevel(string) {
    level = string.charAt(0).toUpperCase() + string.slice(1)
    return level.replace(/_/g, ' ')
}


// Assign the levels to the found "blocks of blocks"
function assignThinkAheadLevels(font_levels, font_blocks){
    for (font_block of font_blocks){
        if (font_block.length > 0){
            font_id = fontId(font_block[0])
            if (font_levels.hasOwnProperty(font_id)){
                for (block of font_block){
                    jumpToBlock(block)
                }
                assignLevel(cleanLevel(font_levels[font_id]), 'active')
            }
        } 
    }
}

function thinkAhead(){
    var initial_value_next_step_slider = document.getElementsByName("radio")[0].checked
    var initial_value_suggestions_slider = document.getElementsByName("radio")[1].checked

    document.getElementsByName("radio")[0].checked = false
    document.getElementsByName("radio")[1].checked = false
    var check = confirm("Are you sure you want to Think Ahead?\nNot all changes might be desirable")
    if (check) {
        cleanOrange()
        all_font_levels = lookAround()
        best_font_levels = getMostUsedLevel(all_font_levels)
        font_blocks = findFontBlocks()
        font_blocks = dropAlreadyAssigned(font_blocks)
        assignThinkAheadLevels(best_font_levels, font_blocks)
    }
    document.getElementsByName("radio")[0].checked = initial_value_next_step_slider
    document.getElementsByName("radio")[1].checked = initial_value_suggestions_slider
}

function suggestion(block){
    var suggestion_block = findSuggestionFontBlock(block)
    if (suggestion_block.length < 1){return}
    var all_font_levels = lookAround()
    var best_font_levels = getMostUsedLevel(all_font_levels)
    var font_id = fontId(block)

    if (best_font_levels.hasOwnProperty(font_id)){
        level_suggestion = best_font_levels[font_id]
        var first_block = suggestion_block[0]
        var last_block = suggestion_block[suggestion_block.length - 1]
        var middle_blocks = suggestion_block.slice(1,-1)
        var first_is_last = (first_block==last_block)

        fontSuggestionTop(first_block, level_suggestion)
        for (block of middle_blocks){
            fontSuggestionMiddle(block)
        }
        fontSuggestionBottom(last_block, first_is_last)
        pageScroll(last_block.nextElementSibling)
    }
}

