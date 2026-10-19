"""Check the built website's local links, assets and portable hosting boundaries."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import hashlib

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'

def check_link(file, value):
    url = urlsplit(value)
    if url.scheme or url.netloc or not url.path:
        return
    if url.path.startswith('/'):
        raise AssertionError(f'Link depende da raiz do domínio: {file}: {value}')
    target = (file.parent / unquote(url.path)).resolve()
    assert target.is_relative_to(DIST.resolve()), (file, value)
    assert target.exists(), f'Arquivo ausente: {file}: {value}'
    if target.is_dir():
        assert (target / 'index.html').exists(), target

class Links(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.file = file
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href', 'src') and value:
                check_link(self.file, value)

assert (DIST / 'index.html').exists(), 'Execute scripts/build.py primeiro.'
for file in DIST.rglob('*.html'):
    Links(file).feed(file.read_text(encoding='utf-8'))
for file in DIST.rglob('*.css'):
    for value in re.findall(r'url\([\s\'"]*([^\)\'"\s]+)', file.read_text(encoding='utf-8')):
        check_link(file, value)
for file in [DIST / 'player.mjs', DIST / 'index.html', DIST / 'jogar/nr13/index.html']:
    content = file.read_text(encoding='utf-8')
    for forbidden in ['/api/', 'chatgpt.site', 'westplay-', 'NR13_UPLOAD_KEY', 'OAI-Sites-Authorization']:
        assert forbidden not in content, (file, forbidden)
assert json.loads((DIST / 'nr13-ready.json').read_text())['ready'] is True
manifest = json.loads((ROOT / 'game-release.json').read_text(encoding='utf-8'))
game = DIST / 'scorm/nr13' / ('v' + manifest['version'])
for info in manifest['files']:
    if '/Build/' in info['path']:
        target = game / info['path']
        assert target.is_file(), f'Binário ausente no endereço usado pelo player: {target}'
        with target.open('rb') as stream:
            assert hashlib.file_digest(stream, 'sha256').hexdigest() == info['sha256'], target
assert (DIST / '.nojekyll').exists()
print('PASS: links, caminhos relativos, recursos e independência da hospedagem anterior.')
