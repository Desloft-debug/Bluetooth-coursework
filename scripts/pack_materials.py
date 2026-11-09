from pathlib import Path
from PIL import Image
import base64,json
ROOT = Path(__file__).resolve().parents[1]
assets={}
for p in sorted((ROOT/'app/assets').glob('Fabric030_2K-JPG_*.jpg')):
    dest=p.with_suffix('.webp');Image.open(p).save(dest,'WEBP',quality=94,method=6)
    assets[p.stem]='data:image/webp;base64,'+base64.b64encode(dest.read_bytes()).decode()
(ROOT/'app/materials-packed.js').write_text('/* CC0: ambientCG and Poly Haven. See ASSETS.md. */\nwindow.SceneAssets='+json.dumps(assets)+';',encoding='utf-8')
print('Packed MB:',round((ROOT/'app/materials-packed.js').stat().st_size/1024/1024,1))
