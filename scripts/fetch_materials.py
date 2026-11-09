import json, urllib.request, zipfile, io
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
out=ROOT/'app/assets';out.mkdir(exist_ok=True)
def fetch(a):
    asset=a['assetId']; ds=a['downloadFolders']['default']['downloadFiletypeCategories']['zip']['downloads']; url=next(d['downloadLink'] for d in ds if d['attribute']=='2K-JPG')
    data=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=90).read();z=zipfile.ZipFile(io.BytesIO(data));saved=[]
    for n in z.namelist():
        if any(n.endswith('_'+s+'.jpg') for s in ['Color','NormalGL','Roughness']):
            (out/Path(n).name).write_bytes(z.read(n));saved.append(Path(n).name)
    print(asset,saved,flush=True)
catalog=json.loads((ROOT/'scripts/data/materials-api.json').read_text(encoding='utf-8'))
fetch(next(asset for asset in catalog['foundAssets'] if asset['assetId']=='Fabric030'))

