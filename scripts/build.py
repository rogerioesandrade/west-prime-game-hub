"""Build a standalone Pages site from the verified NR-13 release. Python 3.11+."""
from pathlib import Path, PurePosixPath
import argparse
import hashlib
import json
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]

def sha256(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

def verify_archive(archive, manifest):
    expected = {f['path']: f for f in manifest['files']}
    names = [f.filename for f in archive.infolist() if not f.is_dir()]
    if len(names) != len(set(names)) or set(names) != set(expected):
        raise ValueError('O conteúdo do ZIP difere da lista aprovada.')
    for name in names:
        path = PurePosixPath(name)
        if path.is_absolute() or '..' in path.parts or '\\' in name or ':' in name:
            raise ValueError('Caminho inválido dentro do pacote.')
        info, wanted = archive.getinfo(name), expected[name]
        if info.file_size != wanted['bytes']:
            raise ValueError('Tamanho divergente: ' + name)
        with archive.open(info) as stream:
            if hashlib.file_digest(stream, 'sha256').hexdigest() != wanted['sha256']:
                raise ValueError('SHA256 divergente: ' + name)

def build(package):
    manifest = json.loads((ROOT / 'game-release.json').read_text(encoding='utf-8'))
    package = package.resolve()
    if package.stat().st_size != manifest['bytes'] or sha256(package) != manifest['sha256']:
        raise ValueError('O pacote NR-13 não corresponde à versão aprovada.')
    dist = ROOT / 'dist'
    if dist.exists():
        raise ValueError('A pasta dist já existe. Mova a versão anterior antes de reconstruir.')
    with zipfile.ZipFile(package) as archive:
        verify_archive(archive, manifest)
        game = dist / 'scorm/nr13' / ('v' + manifest['version'])
        game.mkdir(parents=True)
        archive.extractall(game)
    # The approved HUB wrapper adds the local demonstration runtime and exit copy.
    # Unity binary files are copied unchanged from the approved release.
    shutil.copytree(ROOT / 'public', dist, dirs_exist_ok=True)
    for info in manifest['files']:
        if '/Build/' in info['path'] and sha256(game / info['path']) != info['sha256']:
            raise ValueError('Um binário Unity foi alterado: ' + info['path'])
    (dist / 'nr13-ready.json').write_text(json.dumps({
        'ready': True, 'version': manifest['version'], 'sha256': manifest['sha256']
    }) + '\n', encoding='utf-8')
    all_files = [p for p in dist.rglob('*') if p.is_file()]
    total = sum(p.stat().st_size for p in all_files)
    if total >= 1_000_000_000:
        raise ValueError('O site excede o orçamento de 1 GB para GitHub Pages.')
    print(json.dumps({'ready': True, 'files': len(all_files), 'bytes': total,
                      'version': manifest['version'], 'dist': str(dist)}, indent=2))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--game-zip', required=True, type=Path)
    args = parser.parse_args()
    build(args.game_zip)
