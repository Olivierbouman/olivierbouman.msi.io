
from xml.etree import ElementTree as ET
import re

"""
<div class="block" id="block_2" style="background-color: lightgreen;">
<span id="level_2" class="Part" style="background-color: yellow;">Part - </span>
Part 1 of RISK</div>
"""



def parse_xml(doc_name):
    content = open(doc_name + ".xml", encoding="utf-8", errors='ignore')
    xml_iter = ET.iterparse(content)
    m, block_id, words, fonts = {}, '', [], {}

    ### FILL
    for event, e in xml_iter:
        # block_id
        if 'ID' in e.attrib and re.match('p\d+\_b\d+', e.attrib['ID']):
            block_id = e.attrib['ID']
            m[block_id] = {'level_id': 'no_level_' + block_id, 'level_number': 'no_level_number'}
            words = []

        # word_id
        elif 'CONTENT' in e.attrib and block_id in m and float(e.attrib['VPOS']) < 790:
            words.append(e.attrib['CONTENT'])
            m[block_id]['words'] = words
            m[block_id]['font']  = e.attrib['STYLEREFS']

        # font_id
        elif 'FONTCOLOR' in e.attrib:
            font_id = e.attrib['ID']
            fonts[font_id] = e.attrib

    # resize font_size with '+3'
    for i in fonts:
        fonts[i]['FONTCOLOR'] = fonts[i]['FONTCOLOR'].replace('W', '0')
        fonts[i]['FONTSIZE'] = str(str(float(fonts[i]['FONTSIZE']) + 3) + 'px')
        fonts[i]['FONTSTYLE'] = re.sub('s$', '', fonts[i]['FONTSTYLE'])
        fonts[i]['FONTWEIGHT'] = fonts[i]['FONTSTYLE']

    ### PREP
    delete = []
    for i, block_id in enumerate(m):
        if 'words' in m[block_id]:
            m[block_id]['words'] = ' '.join(m[block_id]['words'])
            m[block_id]['font'] = fonts[m[block_id]['font']]
        else:
            delete.append(block_id)

    for i in delete:
        del m[i]
    return m



if __name__ == '__main__':
    doc_names = ['eba', 'bcbs','eba-rts-2015-05', 'eur-com-2016-593', 'eur-com-2016-850',
                 'eur-com-2017-208', 'eur-com-2017-477', 'eur-dir-2003-71', 'eur-reg-2004-809',
                 'kamerstuk-34813', 'kifid-reglement-geschillencommissie']


    for doc_name in doc_names:
        print(doc_name)
        m = parse_xml(doc_name)
        x=0

    #    for key,value in m.items():
    #        x+=1
    #        print(key, value)
    #        if x==10:
    #            break

        import json
        with open(doc_name + '.json', 'w') as outfile:
            json.dump(m, outfile)


