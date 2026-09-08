import os,re,requests
from bs4 import BeautifulSoup

PAGES=[
('https://www.made-in-china.com/products-search/find-china-products/0b0nolimit/1tb%2Bssd-8.html','Computers & Components'),
('https://www.made-in-china.com/products-search/hot-china-products/1tb_ssd.html','Computers & Components'),
('https://www.made-in-china.com/products-search/hot-china-products/ddr_4_ram.html','Computers & Components'),
('https://www.made-in-china.com/products-search/hot-china-products/gpu.html','Computers & Components'),
('https://www.made-in-china.com/products-search/hot-china-products/ps_5.html','Gaming & Electronics'),
('https://www.made-in-china.com/products-search/find-china-products/0b0nolimit/smart%2Btv-4.html','TVs & Home Electronics'),
('https://www.made-in-china.com/products-search/hot-china-products/smart_tv.html','TVs & Home Electronics'),
('https://www.made-in-china.com/products-search/hot-china-products/sumsung_s20.html','Phones & Electronics'),
('https://www.made-in-china.com/products-search/hot-china-products/wholesale_tshirt.html','Apparel & Fashion'),
]
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); src=os.path.join(root,'src'); api=os.path.join(root,'api')
products=[]
for url,cat in PAGES:
    r=requests.get(url,headers={'User-Agent':'Mozilla/5.0'},timeout=45); r.raise_for_status()
    soup=BeautifulSoup(r.text,'html.parser'); nodes=soup.select('.list-node')[:30]
    if len(nodes)!=30: raise RuntimeError(f'Expected 30 listings from {url}, got {len(nodes)}')
    for node in nodes:
        h=node.select_one('.product-name'); a=h.select_one('a') if h else None
        title=(h.get('title','').strip() if h else '') or (a.get_text(' ',strip=True) if a else '')
        link=a.get('href','') if a else ''
        im=node.select_one('img[data-original]') or node.select_one('img[original]')
        image=(im.get('data-original') or im.get('original') or '') if im else ''
        price=node.select_one('.price'); price=price.get_text(' ',strip=True) if price else ''
        moq=''
        for info in node.select('.product-property .info'):
            t=info.get_text(' ',strip=True)
            if '(MOQ)' in t: moq=t.replace('(MOQ)','').strip(); break
        comp=node.select_one('.compnay-name'); supplier=comp.get_text(' ',strip=True) if comp else ''
        if image.startswith('//'): image='https:'+image
        products.append((title,cat,price,moq,image,link,supplier))
if len(products)!=270 or len({p[5] for p in products})!=270: raise RuntimeError('Catalog validation failed: expected 270 unique products')

def q(s): return s.replace('\\','\\\\').replace("'","\\'").replace('\n',' ')
for b in range(9):
    start=241+b*30; items=products[b*30:(b+1)*30]
    lines=["import type {Product} from './products';",f'export const productData{7+b}:Product[]=[']
    for i,(name,cat,price,moq,image,link,supplier) in enumerate(items):
        lines.append(f"{{id:{start+i},name:'{q(name)}',category:'{q(cat)}',price:'{q(price)}',moq:'{q(moq)}',image:'{q(image)}',source:'Made-in-China',unlock:2.5}},")
    lines.append('];\n'); open(os.path.join(src,f'product-data-{7+b}.ts'),'w',encoding='utf-8').write('\n'.join(lines))
lines=["export const privateProducts2:Record<string,{supplier:string;address:string;url:string}>={"]
for i,(name,cat,price,moq,image,link,supplier) in enumerate(products):
    lines.append(f"'{241+i}':{{supplier:'{q(supplier)}',address:'Supplier address is provided after verified payment.',url:'{q(link)}'}},")
lines.append('};\n'); open(os.path.join(api,'private-data-2.ts'),'w',encoding='utf-8').write('\n'.join(lines))
open(os.path.join(src,'products.ts'),'w',encoding='utf-8').write("import {productData1} from './product-data-1';\nimport {productData2} from './product-data-2';\nimport {productData3} from './product-data-3';\nimport {productData4} from './product-data-4';\nimport {productData5} from './product-data-5';\nimport {productData6} from './product-data-6';\n"+'\n'.join(f"import {{productData{n}}} from './product-data-{n}';" for n in range(7,16))+"\nexport type Product={id:number;name:string;category:string;price:string;moq:string;image:string;source:string;unlock:number;bigDeal?:boolean};\nexport const products:Product[]=[...productData1,...productData2,...productData3,...productData4,...productData5,...productData6,"+','.join(f'...productData{n}' for n in range(7,16))+'];\n')
print('Imported and validated 270 unique products')
# Trigger the catalog-import workflow after its installation.
