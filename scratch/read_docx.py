import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def get_docx_text(path):
    try:
        document = zipfile.ZipFile(path)
        xml_content = document.read('word/document.xml')
        document.close()
        tree = ET.XML(xml_content)
        
        paragraphs = []
        for paragraph in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [node.text
                     for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                     if node.text]
            if texts:
                paragraphs.append(''.join(texts))
                
        return '\n'.join(paragraphs)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    with open('c:/PERSONAL/IA/AGROCONECTA/docs_text.txt', 'w', encoding='utf-8') as f:
        for doc in sys.argv[1:]:
            f.write(f"\n\n--- {os.path.basename(doc)} ---\n\n")
            f.write(get_docx_text(doc))
