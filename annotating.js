
// Annotating the Document
document.addEventListener("click", function() {selectText('click')}, false)
document.addEventListener("dblclick", function() {selectText('dblclick')}, false)

// function example() {
//     console.log('hihihi')
//     const text_blocks = document.getElementsByClassName('parent')
//     wait(2500)
//     console.log(text_blocks)
//     for (text_block of text_blocks){
//         console.log(text_block)
//         text_block.addEventListener("click", function(event) {
//             event.stopPropagation()
//             // deselect()
//         })
//     }
// }
// window.onload = function () { example() }



window.addEventListener('keydown', function(e) {
    if( [13,17,32,38,40].includes(e.keyCode) && e.target == document.body) {
        e.preventDefault()
    }
    nextBlockOnSpace(e)
})

// Additional
function nextBlockOnSpace(keypress) {
    // document.getElementById("mytext").select()

    if ((keypress.code=='Space'||keypress.code=='ArrowDown') && window.getSelection().anchorNode!=null){
        blocks = getBlocks()
        blocks_in_sight = unAssignedBlocksInSight(blocksInSight())
        for (range of [blocks_in_sight, blocks]){
            first_block_in_sight = range[0]
            last_block_of_doc = range[range.length-1]
            for (block of range){
                if (textBlockBackgroundColor(block)=="rgb(255, 178, 90)"){
                    var next_block = block
                }
            }
            if (next_block && next_block != last_block_of_doc ){
                jumpToBlock(next_block.nextElementSibling)
                return
            } else {
                for (block of range){
                    if (textBlockBackgroundColor(block)=="lightgreen"){
                        var next_block = block
                    }
                }
                if (next_block && next_block != last_block_of_doc){
                    jumpToBlock(next_block.nextElementSibling)
                    return
                }
            }
        }
    } else if (keypress.code=='ControlLeft'||keypress.code=='ControlRight'||keypress.code=='ArrowUp'){
        blocks = getBlocks()
        first_block_of_doc = blocks[0]
        for (block of blocks){
            if (textBlockBackgroundColor(block)=="rgb(255, 178, 90)"){
                var current_block = block
            }
        }
        if (current_block) {
            fontDefault(current_block)
            pageScroll(current_block)
        }

    } else if (keypress.code=='ShiftLeft'||keypress.code=='ShiftRight'){
        blocks = getBlocks()
        for (block of blocks){
            if (levelId(block).match(/no_level/i)){
                jumpToBlock(block)
                return
            }
        }
        alert('All done!')
    } else if (keypress.code=='Enter') {
        blocks = getBlocks()
        level = ''
        for (block of blocks){
            if (textBlockBackgroundColor(block)=="rgb(255, 178, 90)"&&
            levelBlock(block).innerText.length > 0){
                level_suggestion = levelBlock(block).innerText
                level = level_suggestion.slice(0,-1)
            }
        }
        if (level.length>0){
            assignLevel(level, true, 'active')
            document.getElementById("mytext").select()
        }
    }
}

function elementInViewport2(block) {
    var top = block.offsetTop;
    var left = block.offsetLeft;
    var width = block.offsetWidth;
    var height = block.offsetHeight;
    while(block.offsetParent) {
        block = block.offsetParent;
        top += block.offsetTop;
        left += block.offsetLeft;
    }
    return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
    );
}

function blocksInSight(){
    blocks_in_sight = []
    blocks = getBlocks()
    for (block of blocks){
        if (elementInViewport2(block)){
            blocks_in_sight.push(block)
        }
    }
    return blocks_in_sight
}

function unAssignedBlocksInSight(blocks_in_sight){
    un_assigned_blocks_in_sight = []
    first_block_of_doc = getBlocks()[0]
    for (block of blocks_in_sight){
        color = textBlockBackgroundColor(block)
        if (color!="lightgreen"&&color!="rgb(255, 178, 90)"){
            un_assigned_blocks_in_sight.push(block)
        }
    }
    if (un_assigned_blocks_in_sight.length>0){
        first_block_in_sight = un_assigned_blocks_in_sight[0]
        if (first_block_in_sight==first_block_of_doc){
            return [first_block_in_sight]
        } else {
            return [first_block_in_sight.previousElementSibling]
        }
    } else {
        return []
    }
}

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }


// Selecting text
function getRangeClickedBlocks(base_block, extend_block){
    // Function to get the block_ids of the current click-selection
    var blocks = getBlocks()
    var block_array = []
    for (var block of blocks){
        block_array.push(block)
    }
    base_index = block_array.indexOf(base_block)
    extend_index = block_array.indexOf(extend_block)
    if (extend_index>=base_index){
        var start = block_array.indexOf(base_block)
        var end = block_array.indexOf(extend_block) + 1
        var clicked_blocks = block_array.slice(start, end)    
    } else {
        var start = block_array.indexOf(extend_block)
        var end = block_array.indexOf(base_block) + 1
        var clicked_blocks = block_array.slice(start, end)
    }
    return clicked_blocks
}

function checkForClosedBlock(selected_blocks){
    blocks = getBlocks()
    last_block_of_doc = blocks[blocks.length-1]
    last_block = selected_blocks[selected_blocks.length-1]
    for (block of selected_blocks){
        if (block==last_block_of_doc){
            return false
        }
        block_color = textBlockBackgroundColor(block.nextElementSibling)
        if (block_color!="rgb(255, 178, 90)" && block_color!="lightgray" && block!=last_block){
            alert('Please select successive blocks to assign a level to')
            return true
        }
    }
    return false
}

function checkForWhiteBlocksInSelectedBlocks(clicked_blocks){
    for (block of clicked_blocks){
        color = textBlockBackgroundColor(block)
        if (color=="rgb(250, 250, 250)") {
            return true
        }
    }
}

function cssForClickingBlocks(selected_blocks, click){
    //Function to colour and reset background of clicked blocks
    if (checkForWhiteBlocksInSelectedBlocks(selected_blocks)){
        for (block of selected_blocks){
            color = textBlockBackgroundColor(block)
            if (color!='lightgreen' && color!="lightgray"){
                fontSelected(block)
            }
        }
        return
    }

    for (var block of selected_blocks){
        var color = textBlockBackgroundColor(block)
        if (color=="rgb(255, 178, 90)"){
            fontDefault(block)
        } else if (color!="lightgreen" && color!="lightgray") {
            fontSelected(block)
        } else if ((color=="lightgreen" || color=="lightgray") && click=='dblclick') {
                var reset_blocks = []
                var level_id = levelId(block)
                for (block_ of getBlocks()){
                    if (levelId(block_)==level_id){
                        reset_blocks.push(block_)
                    }
                }
                for (block_ of reset_blocks) {
                    fontDefault(block_)
                }
        }
    }
}

function selectText(click){
    // Function to apply styling to current block_selection
    if (window.getSelection().anchorNode!=null && window.getSelection().baseNode.firstElementChild===undefined){
        var selection = window.getSelection()
        var base_block = selection.baseNode.parentElement.offsetParent
        var extend_block = selection.extentNode.parentElement.offsetParent
        var clicked_blocks = getRangeClickedBlocks(base_block, extend_block)
        cssForClickingBlocks(clicked_blocks, click)
        // var selection = window.getSelection()
        // selection.removeAllRanges()
        // document.getElementById("mytext").select()
    }
}


// Annotating by button
function getRangeSelectedBlocks(){
    var blocks = getBlocks()
    var selected_blocks = []
    for (var block of blocks){
        if (textBlockBackgroundColor(block)=="rgb(255, 178, 90)"){
            selected_blocks.push(block)
        }
    }
    return selected_blocks
}

function pageScroll(block) {
    var top = block.getBoundingClientRect().top - ( window.innerHeight / 1.9 )
    window.scrollBy({top:top, left:0, behavior: 'smooth'})
}

function jumpToBlock(block) {
    cssForClickingBlocks([block], 'click')
    pageScroll(block)
}

function assignLevel(level, override){
    if (window.getSelection().anchorNode!=null||override=='active'){
        var selected_blocks = getRangeSelectedBlocks()
        var first_block = selected_blocks[0]
        var last_block = selected_blocks[selected_blocks.length - 1]
        var middle_blocks = selected_blocks.slice(1,-1)
        var identifier = first_block
        var first_is_last = (first_block==last_block)

        if (checkForClosedBlock(selected_blocks)){return}

        if (level=='Discard text'||level=='Discard'){
            for (block of selected_blocks){
                fontDiscarded(block, level, identifier)
            }
        } else {
            fontAssignedTop(first_block, identifier, level)
            for (block of middle_blocks){
                fontAssignedMiddle(block, identifier, level)
            }
            fontAssignedBottom(last_block, identifier, level, first_is_last)
        }

        var selection = window.getSelection()
        selection.removeAllRanges()
        document.getElementById("mytext").focus({preventScroll:true})

        if (document.getElementsByName("radio")[0].checked){
            blocks = getBlocks()
            last_block_of_doc = blocks[blocks.length-1]
            if (last_block!=last_block_of_doc){
                jumpToBlock(last_block.nextElementSibling)
            }
        }

        if (document.getElementsByName("radio")[1].checked){
            if (last_block!=last_block_of_doc){
                suggestion(last_block.nextElementSibling)
            }
        }
    }
}

