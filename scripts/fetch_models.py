import json,subprocess,hashlib,base64
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT = Path(__file__).resolve().parents[1]
jobs=[]
for key,name in [('sofa','sofa_03'),('plant','potted_plant_04'),('cabinet','modern_wooden_cabinet')]:
 r=json.loads((ROOT/'scripts/data'/(key+'-files.json')).read_text(encoding='utf-8'))['gltf']['2k']['gltf'];root=ROOT/'app/assets/models'/name;root.mkdir(parents=True,exist_ok=True)
 for rel,info in [(name+'.gltf',r),*r['include'].items()]:
  p=root/rel;p.parent.mkdir(parents=True,exist_ok=True);jobs.append((p,info))
def fetch(job):
 p,i=job
 if not p.exists() or hashlib.md5(p.read_bytes()).hexdigest()!=i['md5']:
  subprocess.run(['curl.exe','-fsSL','--retry','2','-A','BluetoothEducation/1.0',i['url'],'-o',str(p)],check=True)
 assert hashlib.md5(p.read_bytes()).hexdigest()==i['md5'],str(p)
 return str(p)
with ThreadPoolExecutor(max_workers=4) as pool:
 for p in pool.map(fetch,jobs): print(p)
packed={}
for name in ['sofa_03','potted_plant_04','modern_wooden_cabinet']:
 root=ROOT/'app/assets/models'/name;g=json.loads((root/(name+'.gltf')).read_text(encoding='utf-8'))
 for b in g['buffers']:b['uri']='data:application/octet-stream;base64,'+base64.b64encode((root/b['uri']).read_bytes()).decode()
 for im in g['images']:im['uri']='data:image/jpeg;base64,'+base64.b64encode((root/im['uri']).read_bytes()).decode()
 packed[name]=g
(ROOT/'app/models-packed.js').write_text('window.SceneModels='+json.dumps(packed,separators=(',',':'))+';',encoding='utf-8')
