# Googles autoforslag for en række grundord (søgeordsanalyse, docs/SEO-KEYWORDS.md).
# Kør: python3 scripts/seo/autocomplete.py "cm 01/02|championship manager online" en

import json,urllib.request,urllib.parse,time,sys
seeds=sys.argv[1].split('|'); hl=sys.argv[2]
out={}
for q in seeds:
    allq=set()
    for suf in ['',' a',' b',' c',' d',' f',' m',' o',' p',' s',' t',' w']:
        u='https://suggestqueries.google.com/complete/search?client=firefox&hl='+hl+'&q='+urllib.parse.quote(q+suf)
        try:
            r=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=10).read().decode('utf-8','ignore'))
            for x in r[1]: allq.add(x)
        except Exception as e: pass
        time.sleep(0.15)
    out[q]=sorted(allq)
print(json.dumps(out,ensure_ascii=False))
