import re
from regminer.parsers.pdf_style import PdfStyle


def parse_xml(content, doc_name, page_from=None, page_to=None, doc_info=None, print_all_styles=False, manually_set_pages=False):
    """
    Parse the xml into a text matrix, at this point one line in the text matrix is one word
    doc_info = (start_page, end_page, list_of_pages_to_skip)

    Output: [text, {fontID, page_number, y_coordinate, x_start, x_outline}, word_IDs]
    """
    from xml.etree import ElementTree
    xml_iter = ElementTree.iterparse(content)

    doc_specs        = PdfStyle.doc_specifications(doc_name)
    start_page       = doc_specs['start_page']
    end_page         = doc_specs['end_page']
    skip_pages       = doc_specs['skip_pages']
    y_lower          = doc_specs['y_lower']
    y_upper          = doc_specs['y_upper']
    same_line_margin = doc_specs['same_line_margin']
    same_line_font   = doc_specs['same_line_font']

    all_text_styles = {}
    text_style_counter = {}

    x_sentence_end, x_sentence_start, width_first_word_of_sentence, x_outline = 0, 0, 0, 0
    style_prev, line_content, y_prev, word_IDs = None, "", -999, []

    page = start_page
    m = []
    word_IDs = []
    word_IDs_total = {}

    if manually_set_pages:  # For working on the code only
        start_page, end_page, skip_pages = doc_info

    if page_from and page_to:
        start_page = page_from
        end_page = page_to

    for event, e in xml_iter:
        if 'CONTENT' in e.attrib:
            specs      = e.attrib
            word       = specs["CONTENT"].rstrip()
            word_ID    = specs["ID"]
            y          = float((specs['VPOS']))
            x          = float(specs['HPOS'])
            width      = float(specs['WIDTH'])
            height     = float(specs["HEIGHT"])
            text_style = specs["STYLEREFS"]
            page_start_end = int(re.match('p(\d+)_w\d+', word_ID)[1])

            if start_page <= page_start_end <= end_page and page_start_end not in skip_pages:
                if y_lower <= y <= y_upper:
                    if word == '':  # To prevent empty strings being added to the body. Since these would get a space, this complicates the check whether the number of word ID's matches the number of words.
                        continue

                    same_line = abs(y-y_prev) <= same_line_margin

                    if same_line:
                        line_content += " " + word
                        word_IDs.append(word_ID)
                        word_IDs_total[word_ID] = [x, y, x + width, y + height, page_start_end]
                        x_sentence_end = x + width
                        if text_style in text_style_counter:
                            text_style_counter[text_style] += len(word)
                        else:
                            text_style_counter[text_style] = len(word)

                    else:  # New line
                        if same_line_font and bool(text_style_counter):
                            style_prev = sorted(text_style_counter.items(), key=lambda kv: kv[1], reverse=True)[0][0]

                        if x_sentence_end == 0:
                            x_outline = x_sentence_start + width_first_word_of_sentence/2
                        else:
                            x_outline = (x_sentence_start + x_sentence_end)/2

                        line = [line_content.lstrip(" "), {'fontID': style_prev, 'page_number': page, 'y_coordinate': y_prev, 'x_start': x_sentence_start, 'x_outline': x_outline}, word_IDs]
                        m.append(line)

                        line_content = word
                        word_IDs = [word_ID]
                        word_IDs_total[word_ID] = [x, y, x + width, y + height, page_start_end]
                        x_sentence_start = x
                        x_sentence_end = 0
                        width_first_word_of_sentence = width

                        all_text_styles[text_style] = line_content
                        text_style_counter = {}
                        text_style_counter[text_style] = len(word)
                        style_prev = text_style
                        y_prev = y
                        page = int(re.match('p(\d+)_w\d+', word_ID)[1])
        e.clear()
    line = [line_content.lstrip(" "), {'fontID': style_prev, 'page_number': page, 'y_coordinate': y_prev, 'x_start': x_sentence_start, 'x_outline': x_outline}, word_IDs]
    m.append(line)

    if print_all_styles:
        for i in all_text_styles:
            print("'" + i + "': ")

    # TODO: make this more general/nicer - when another document with this issue has to be scraped
    if doc_name == 'eur-reg-2013-575':
        for line in m:
            if not (158 < line[1]['x_outline'] < 164 or 426 < line[1]['x_outline'] < 433) and 291 <= line[1]['page_number'] <= 293:  # 290 - 300
                line[1]['fontID'] = 'font7'

    m.pop(0)
    return m, word_IDs_total


# =============================================================================
# Add absolute level numbers
# =============================================================================


def check_for_amendment_levels(m, doc_name):
    """
    Checks for levels in amendments and transform them to paragraph-level
    This is done by looking at the x_coordinate of the starting word of the
    specific text and checking whether is centered.

    Update: Newer version looks at the central x_coordinate <- only for the CRR so far

    Input/output: m[i] = [absolute level number, level description, text, {fontID, page_number, y_coordinate, x_start, x_outline}, word_IDs]
    """
    am_lvl = PdfStyle.doc_specifications(doc_name)['am_lvl']
    for line in m:
        if float(line[3]['x_start']) <= am_lvl:
            line[0:2] = (10, 'Paragraph')
    return m


def check_for_amendment(m):
    """
    Checks whether an element should have an amended document as working_doc
    Input: m[i] = [absolute level number, level description, text, {fontID, page_number, y_coordinate, x_start, x_outline}, word_IDs]
    Output: m[i] = [absolute level number, level description, text, {fontID, page_number, y_coordinate, x_start, x_outline}, amended_doc, amendment, word_IDs]
    """
    from regminer.parsers.direct_references.direct_ref import identify_documents

    for i, line in enumerate(m):
        amendment_doc = None
        amendment = False
        if line[1] == 'Article':
            article_line = identify_documents(line[2], {}, False)
            if re.findall('Amendments? (?:to|of) \$_doc_ref_0_\$', article_line[0], re.I):
                amendment_doc = article_line[1]['$_doc_ref_0_$']
                amendment = True

        elif m[i-1][1] == 'Article' and line[1] == 'Paragraph':
            paragraph_line = identify_documents(line[2], {}, False)
            if re.findall(r'\$_doc_ref_0_\$ is(?: hereby)? amended as follows:', paragraph_line[0], re.I):
                amendment_doc = paragraph_line[1]['$_doc_ref_0_$']
                amendment = True

        line.insert(4, amendment_doc)
        line.insert(5, amendment)
    return m


def apply_amendments(m):
    """
    Further applies the found amendments to the other relevant lines
    line[4: 6] == [amendment_doc, amendment (True/False)]

    Input: m[i] = [absolute level number, level description, text, {fontID, page_number, y_coordinate, x_start, x_outline}, amended_doc, amendment, word_IDs]
    Output: m[i] = [absolute level number, level description, text, {fontID, page_number, y_coordinate, x_start, x_outline}, amended_doc, amendment, word_IDs]
    """
    for i, line in enumerate(m):
        amended_doc = line[4]
        amendment = line[5]
        if amendment:
            i += 1
            while i < len(m) and m[i][0] == 10:
                m[i][4] = amended_doc
                m[i][5] = amendment
                i += 1

    for line in m:
        if line[5] and line[0] != 10:
            line[4] = None
            line[5] = False

    for line in m:
        del line[5]  # Delete amendment (True/False) from text matrix
    return m


def determine_number_type(text, font_dict):
    """
    Returns the type of the number that the input line starts with
    Input:
        line (text)
        level_description (dict: {regex: (level_description, absolute_level)})
    Output:
        (level_description, absolute_level) (e.g. ('Paragraph', 10))
    """

    for regex in font_dict.keys():
        if re.match(regex, text) and not regex == 'default':
            return font_dict[regex]

    return font_dict['default']


def add_paragraph_numbers(m, doc_name):
    """
    Checks wether the relevant document has a numbered paragraph level distinction
    If so, the absolute level numbers get changed accordingly
    """
    numbered_par = PdfStyle.doc_specifications(doc_name)['numbered_par']
    am_par       = PdfStyle.doc_specifications(doc_name)['am_par']

    if numbered_par == 'style_1':
        new_number = 10
        for i, line in enumerate(m):
            if line[4] and doc_name == 'eba-its-2013-03':  # If Amendment
                paragraph = re.match(r'\(\d+\)', line[2], flags=re.I)
            else:
                paragraph = re.match(r"\(?\d{1,3}\)?(?:\. |[ ]?[(ivx]{0,4}\))", line[2], flags=re.I)    # <- kan efficienter en sluitender

            if paragraph and m[i][0] == 10:
                new_number = str(line[0]) + "." + paragraph[0]
                m[i][0] = new_number
            elif not paragraph and m[i][0] == 10:
                m[i][0] = new_number

    elif numbered_par == 'style_2':
        new_number = 10
        paragraph = False
        for i, line in enumerate(m):
            if line[4] and float(line[3]['x_start']) <= am_par:  # if amendment and x_coordinate
                paragraph = re.findall(r'^(\(?\d+(?:\.|\))) ', line[2], flags=re.I)
            elif float(line[3]['x_start']) <= am_par:
                paragraph = re.match(r'^(\d+)\. ', line[2], flags=re.I)

            if paragraph and m[i][0] == 10:
                new_number = str(line[0]) + "." + paragraph[0]
                m[i][0] = new_number
            elif not paragraph and m[i][0] == 10:
                m[i][0] = new_number
            else:
                new_number = 10

    elif numbered_par == 'style_3':
        new_number = 10
        for i, line in enumerate(m):
            paragraph = re.match(r'((:?\d+\.)|(:?\d+\.\d+\.))(\d+) ', line[2])
            if paragraph and m[i][0] == 10:
                new_number = str(line[0]) + "." + paragraph[4]
                m[i][0] = new_number
            elif not paragraph and m[i][0] == 10:
                m[i][0] = new_number

    elif numbered_par is not None:
        new_number = 10
        for i, line in enumerate(m):
            paragraph = re.match(numbered_par, line[2])

            if paragraph and m[i][0] == 10 and float(line[3]['x_start']) <= am_par:
                if paragraph[1] is not None:
                    new_number = str(line[0]) + "." + paragraph[1]
                else:
                    new_number = str(line[0]) + "." + paragraph[2]
                m[i][0] = new_number
            elif m[i][0] == 10:
                m[i][0] = new_number

    return m


def add_absolute_level_number(m, doc_name):
    """
    Adds absolute level numbers based on the document-specific mapping between
    text_style and absolute level, provided by PDF_style_dict

    Input:  [text, {fontID, page_number, y_coordinate, x_start, x_outline}, word_IDs]
    Output: [Abs_lvl, lvl_desc, text, {fontID, page_number, y_coordinate, x_start, x_outline}, working_doc, word_IDs]
    """
    style_dict = PdfStyle.style_dict(doc_name)
    paragraph_texts = PdfStyle.paragraph_texts()
    m_new = []

    for i, line in enumerate(m):
        text_style = line[1]['fontID']
        text = line[0]

        if text_style in style_dict:
            if type(style_dict[text_style][0]) == dict:
                level_description, absolute_level = determine_number_type(text, style_dict[text_style][0])
            else:
                level_description, absolute_level = style_dict[text_style]

            if text in paragraph_texts:
                level_description, absolute_level = ("Paragraph", 10)

            if level_description == 'follow':  # continues using the previous font settings
                level_description, absolute_level = (m_new[-1][1], m_new[-1][0])

            if level_description == 'drop':
                text = ''

            m_new.append([absolute_level, level_description, text, line[1], line[2]])

    m = check_for_amendment_levels(m_new, doc_name)
    m = check_for_amendment(m)
    m = apply_amendments(m)
    m = add_paragraph_numbers(m, doc_name)
    return m


# =============================================================================
# Flatten text matrix
# =============================================================================


def return_paragraph_numbers_to_normal(m):
    """
    Converts the possible absolute paragraph numbers back to the 'correct' format
    """
    for i, sen in enumerate(m):
        if "." in str(sen[0]):
            m[i][0] = 10
    return m


def flatten_matrix(m):
    """
    Consecutive lines in the text matrix that have the same absolute level are merged into one line
    Input: [Abs_lvl, lvl_desc, text, {fontID, page_number, y_coordinate, x_start, x_outline}, working_doc, word_IDs]
    Output: [Abs_lvl, lvl_desc, text, {page_start, page_end, y_start, y_end}, working_doc, word_IDs]
    """
    m_flattened = []
    new_sen     = m[0][2]
    page_start  = m[0][3]['page_number']
    page_end    = m[0][3]['page_number']
    y_start     = m[0][3]['y_coordinate']
    y_end       = m[0][3]['y_coordinate']
    working_doc = m[0][4]
    word_IDs    = m[0][5]

    for i, sen in enumerate(m):
        if i == len(m) - 1:  # Stop at second last line to prevent index error
            break

        # If current line has a different level number/letter than the next one or current line is not a paragraph or a section
        # and has the same level number/letter but is on another page (see e.g. pages 16-18 of EBA_GL_2016_07)
        if m[i][0] != m[i + 1][0] or (m[i][1] not in ["Section", "Paragraph"] and m[i][3]['page_number'] < m[i + 1][3]['page_number']):
            specs = {'page_start': page_start, 'page_end': page_end, 'y_start': y_start, 'y_end': y_end}
            m_flattened.append([m[i][0], m[i][1], new_sen, specs, working_doc, word_IDs])

            new_sen     = m[i + 1][2]
            page_start  = m[i + 1][3]['page_number']
            page_end    = m[i + 1][3]['page_number']
            y_start     = m[i + 1][3]['y_coordinate']
            y_end       = m[i + 1][3]['y_coordinate']
            working_doc = m[i + 1][4]
            word_IDs    = m[i + 1][5]
        else:
            new_sen     = new_sen + " " + m[i + 1][2]
            page_end    = m[i+1][3]['page_number']
            y_end       = m[i+1][3]['y_coordinate']
            working_doc = m[i+1][4]
            word_IDs   += m[i+1][5]

    m_flattened.append([m[-1][0], m[-1][1], new_sen, specs, working_doc, word_IDs])  # Add last line
    m_flattened = return_paragraph_numbers_to_normal(m_flattened)
    return m_flattened


# =============================================================================
# Add level number
# =============================================================================


def add_level_numbers(m):
    """
    Checks for possible level indicators at the start of the body and adds them to the text matrix when available
    Input: [Abs_lvl, lvl_desc, text, {page_start, page_end, y_start, y_end}, working_doc, word_IDs]
    Output: [lvl_number, Abs_lvl, lvl_desc, text, {page_start, page_end, y_start, y_end}, working_doc, word_IDs]
    """

    for i, line in enumerate(m):
        text = line[2]
        level_number = re.match(r"(\d{1,3}\.?){1,3}(\.?[ ]?[(ivx]+\))?", text, flags=re.I)
        if level_number:
            m[i] = [level_number[1].strip(".")] + m[i]  # Add the level number to the line in the matrix
        else:
            level_letter = re.match(r"[IVXivx]{1,4}\.?[IVXivx]{0,4}\.(\d+)|[IVXivx]{1,4}\.([IVXivx]{1,4})|([IVXivx]{1,4})\.|([A-Ka-k])\.|\(([IVXivx]{1,4})\)|\(([a-z])\)", line[2])
            if level_letter:
                m[i] = [level_letter[i] for i in range(1, 7) if level_letter[i] is not None] + m[i]  # Add the level letter to the line in the matrix

            elif re.match('(?:s e c t i o n|s u b (?:- )?s e c t i o n) (\d+)', text, re.I):
                level_number = re.match('(?:s e c t i o n|s u b (?:- )?s e c t i o n) (\d+)', text, re.I)
                m[i] = [level_number[1]] + m[i]

            else:
                letter_number = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen)'
                level_descriptor = re.match(
                    r"(Part|Title|Chapter|Section|Article|Artikel) ?([\divx]+|" + letter_number, text, re.I
                )
                if level_descriptor and line[1] == level_descriptor[1].title():
                    level_descriptor_number = level_descriptor[2]
                    m[i] = [level_descriptor_number] + m[i]
                    m[i][2] = level_descriptor[1].title()
                else:
                    annex = re.match(r"(Annex)( [\divx]+)?", text, re.I)
                    if annex and line[2][0:5].title() == "Annex" and line[1] != "Paragraph":
                        annex_number = annex[2]
                        m[i] = [annex_number] + m[i]
                        m[i][0] = annex_number
                        m[i][2] = "Annex"
                    else:
                        level_number = re.match(r"\(?(\d+)\)? ", text)
                        if level_number:
                            m[i] = [level_number[1]] + m[i]
                        else:
                            m[i] = [None] + m[i]

    for line in m:
        if line[5] is not None and re.findall(r'^\((\d+)\)', line[3], re.I):
            level_number = re.findall(r'^\((\d+)\)', line[3], re.I)[0]
            line[0] = level_number

    return m


def only_spaces(line):
    if type(line[3]) == dict:
        return False
    else:
        return line[3].isspace()


def strings_to_delete(line):
    if line[2] in PdfStyle.strings_to_drop():
        return True
    else:
        return False


def manual_override(m, doc_name):
    """
    Some things just can't be fixed by making more rules...
    Replaces lines in the text matrix by lines in changes
    """
    changes = PdfStyle.manual_changes(doc_name)
    for i, line in enumerate(m):
        if str(line[:-1]) in changes:
            change = changes[str(line[:-1])]
            m[i][:-1] = change
        elif str(line) in changes:
            change = changes[str(line)]
            m[i] = change

    # For documents that have an inside document with identical layout: increase the absolute level number of the
    # texts in the inside document
    inside_docs_with_identical_layout = PdfStyle.inside_docs_with_identical_layout()
    if doc_name in inside_docs_with_identical_layout:
        start = inside_docs_with_identical_layout[doc_name][0]
        end = inside_docs_with_identical_layout[doc_name][1]

        inside_doc = False
        for i, line in enumerate(m):
            if line[:4] == start:
                inside_doc = True
            if line[:4] == end:
                inside_doc = False
            if inside_doc:
                m[i][1] = min(10, m[i][1] + 4)

    if len(m[0]) > 3:
        m = [line for line in m if line[3] != "" and not only_spaces(line) and not strings_to_delete(line)]   # Remove lines with an empty body
    else:
        m = [line for line in m if line[0] != ""]

    return m


# =============================================================================
# Add ML text, front-end title and possible amendment
# =============================================================================


def title_creator(e):
    """
    Returns the first 64 characters of a string
    """
    if len(e) >= 64:
        return e[:61] + "..."
    else:
        return e


def add_ml_title(m):
    """
    For every line in the text_matrix add two additional elements containing the ml_text and title_text

    Input: m[i] = [level_number, absolute_level_number, level_description, body/text,
                   {page_start, page_end, y_start, y_end}, working_doc, [word_IDs]]
    Output: m[i] = [level_number, absolute_level_number, level_description, body/text, ml_text, title/ttext,
                    {page_start, page_end, y_start, y_end}, working_doc, word_IDs]
    """
    for line in m:
        line.insert(4, line[3])                 # ml_text
        line.insert(5, title_creator(line[3]))  # title
    return m


def add_bounding_box(m, word_IDs_total):
    """
    Computation of bounding box for each tree element, function takes into account page brakes and
    multi column layouts

    Input: m[i] = [level_number, absolute_level_number, level_description, body/text, ml_text, title/ttext,
                    {page_start, page_end, y_start, y_end}, working_doc, word_IDs]
    Output: m[i] = [level_number, absolute_level_number, level_description, body/text, ml_text, title/ttext,
                    {page_start, page_end, y_start, y_end, bounding_box}, working_doc, word_IDs]
    """
    import numpy as np

    for line in m:
        node = np.asarray(line[-1])
        x1, y1, x2, y2, page, id_list = [], [], [], [], [], []
        for word_id in node:
            word_box = word_IDs_total[word_id]

            if word_id:
                x1.append(word_box[0])
                y1.append(word_box[1])
                x2.append(word_box[2])
                y2.append(word_box[3])
                page.append(word_box[4])
                id_list.append(word_id)
        co = np.column_stack((x1, y1, x2, y2, page))
        id_list = np.asarray(id_list)

        b_boxes = []
        pages = np.unique(co[:, 4])  # find all pages
        for page in pages:
            co_page = co[co[:, 4] == page, :]
            id_list_page = id_list[co[:, 4] == page]
            col_split = np.append(0, np.diff(co_page[:, 1]))  # detect multicolumn
            cols = np.split(co_page, np.where(col_split <= -9.)[0][:])
            id_list_col = np.split(id_list_page, np.where(col_split <= -9.)[0][:])
            for i, col in enumerate(cols):
                co_min = col.min(0)
                co_max = col.max(0)
                b_box = [co_min[0], co_min[1], co_max[2]-co_min[0], co_max[3]-co_min[1], page - 1, list_of_word_ids(id_list_col[i].tolist())]
                b_boxes.append(b_box)
        line[6]['bounding_box'] = b_boxes
    return m


def list_of_word_ids(string_list):
    word_id_list = []
    for word_id in string_list:
        word_id_list.append([word_id])
    return word_id_list


def list_word_ids(m):
    '''
    convert every word_id string to list containing a string
    '''
    for line in m:
        id_list = []
        for word_id in line[-1]:
            id_list.append([word_id])
        line[-1] = id_list
    return m


def add_regminer_id_amendment(m, regminer_id):
    """
    Adds a regminer_id plus
    """
    from regminer.parsers.direct_references.regminer_ids import doc_text_to_doc_id
    for i in m:
        if i[-2] == None:
            i[6]['amendment'] = False
            i[-2] = regminer_id
        else:
            i[6]['amendment'] = True
            i[-2] = doc_text_to_doc_id(i[-2])

    return m



# =============================================================================
# Main function
# =============================================================================


def xml_to_text_matrix(doc_name, content, doc_info=None, page_from=None, page_to=None):
    m, word_IDs_total = parse_xml(content, doc_name, page_from, page_to)
    m = manual_override(m, doc_name)

    m = add_absolute_level_number(m, doc_name)
    m = manual_override(m, doc_name)

    m = flatten_matrix(m)
    m = add_level_numbers(m)
    m = manual_override(m, doc_name)

    m = add_ml_title(m)
    m = add_bounding_box(m, word_IDs_total)

    m = list_word_ids(m)
    m = add_regminer_id_amendment(m, doc_name)
    return m


if __name__ == '__main__':
    from text_matrix_to_tree import tree_creator
    from regminer.parsers.xml_main_scraper import search_for_direct_refs

    doc_name = 'eba-cp-2014-10'
#    content = 'test_data/' + doc_name + '.xml'
    content = open('test_data/' + doc_name + ".xml", encoding="utf-8", errors='ignore')

    m, word_IDs_total = parse_xml(content, doc_name, doc_info=(40, 41, []), manually_set_pages=False, print_all_styles=False)
    m = manual_override(m, doc_name)

    m = add_absolute_level_number(m, doc_name)
    m = manual_override(m, doc_name)

    m = flatten_matrix(m)
    m = add_level_numbers(m)

    m = manual_override(m, doc_name)
    m = add_ml_title(m)
    m = add_bounding_box(m, word_IDs_total)
    m = list_word_ids(m)
    m = add_regminer_id_amendment(m, doc_name)

    m = search_for_direct_refs(m, 'eur')


#    print(m[0])
#    for i in m:
#        print(i, '\n')
#        print(i[:-1], '\n')
#        print(i[1]['fontID'], '\t-Page', i[1]['page_number'], '    ', i[0])
#        print(i[1], '---', i[0], '-', i[2], '\t---', i[4])
#        print(i[2], i[0], '---', i[1], '-', i[3], '\t---', i[5], '\n')
#
    tree = tree_creator(m, doc_name, unit=True)
#    print(tree)
    print([str(tree)])
