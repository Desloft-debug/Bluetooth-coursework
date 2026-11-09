import json,base64,subprocess,hashlib
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
packed={}
r=json.loads((ROOT/'scripts/data/floor-files.json').read_text(encoding='utf-8'))
for key,suffix in [('Diffuse','Color'),('nor_gl','NormalGL'),('Rough','Roughness')]:
 info=r[key]['2k']['jpg']
 p=ROOT/'app/assets'/('laminate_floor_02_'+suffix+'.jpg')
 if not p.exists() or hashlib.md5(p.read_bytes()).hexdigest()!=info['md5']:
  subprocess.run(['curl.exe','-fsSL','--retry','2',info['url'],'-o',str(p)],check=True)
 assert hashlib.md5(p.read_bytes()).hexdigest()==info['md5']
 packed['laminate_floor_02_2K-JPG_'+suffix]='data:image/jpeg;base64,'+base64.b64encode(p.read_bytes()).decode()
(ROOT/'app/wood-packed.js').write_text('Object.assign(SceneAssets,'+json.dumps(packed)+');',encoding='utf-8')
