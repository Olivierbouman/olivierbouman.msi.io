

function highlightLevelNumber(block){
    block.style.zIndex = 1
    text = textBlock(block).innerText
    levels = document.getElementsByClassName('levelConfirm')
    levels_array = []
    for (level of levels){
        levels_array.push('^'+ level.value)
    }
    levels_reg = '(?:' + levels_array.join(' ?|') + ' ?)'
    number_reg = '(?:\\d+[.:;]? |\\d+\\.\\d+|\\(\\d+\\) |\\([A-Z]\\) )'

    only_number_reg = new RegExp('^' + number_reg)
    level_number_reg = new RegExp(levels_reg + number_reg + '[A-Z]')

    if (text.match(only_number_reg)){
        level_number = text.match(only_number_reg)[0]
        new_text = '<span style="background-color:lightblue;border:6px solid lightblue;border-radius:6px">'+ level_number +'</span>' + text.replace(level_number, '')
        textBlock(block).innerHTML = new_text
        block.setAttribute('level_number', level_number)
    } else if (text.match(level_number_reg)){
        level_number = text.match(level_number_reg)[0]
        new_text = '<span style="background-color:lightblue;border:6px solid lightblue;border-radius:6px">'+ level_number +'</span>' + text.replace(level_number, '')
        textBlock(block).innerHTML = new_text
        block.setAttribute('level_number', level_number)
    }
}

function resetHightlightLevelNumber(block){
    text = textBlock(block).innerText
    textBlock(block).innerHTML = text
    block.setAttribute('level_number', 'no_level_number')
}

function checkForLevelNumber(block){
    text = textBlock(block).innerText
    levels = document.getElementsByClassName('levelConfirm')
    levels_array = []
    for (level of levels){
        levels_array.push('^'+ level.value)
    }
    levels_reg = '(?:' + levels_array.join(' ?|') + ' ?)'
    number_reg = '(?:\\d+[.:;]? |\\d+\\.\\d+|\\(\\d+\\) |\\([A-Z]\\) )'

    only_number_reg = new RegExp('^' + number_reg)
    level_number_reg = new RegExp(levels_reg + number_reg + '[A-Z]')

    if (text.match(only_number_reg)){
        return true
    } else if (text.match(level_number_reg)){
        return true
    }
    return false
}

