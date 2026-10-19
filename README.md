# West Prime Game HUB

Site de demonstração West Group, preparado para **rogerioesandrade/west-prime-game-hub** no GitHub Pages. Inclui o Simulador NR-13 1.1.2 com seleção Celular/Computador, idiomas PT/EN/ES, controles de toque e progresso local no navegador.

Site: https://rogerioesandrade.github.io/west-prime-game-hub/

## Organização

- `public/`: HUB, player e apresentação aprovada do simulador.
- `game-release.json`: versão, tamanho e SHA256 do pacote e seus arquivos.
- `scripts/`: montagem e validação com Python 3.11 ou superior, sem dependências extras.
- `.github/workflows/pages.yml`: publicação automática no GitHub Pages.

O pacote pesado do Unity pertence a uma **GitHub Release**, não ao histórico Git. A publicação baixa o ZIP, verifica sua integridade e monta o site estático completo. Durante o uso, o navegador baixa somente o perfil escolhido. O visitante joga diretamente pelo GitHub Pages, sem depender da hospedagem anterior ou do West Play.

## Primeira publicação

1. Criar o repositório público `rogerioesandrade/west-prime-game-hub` e enviar estes arquivos para a branch `main`.
2. Em **Settings → Pages → Build and deployment**, escolher **GitHub Actions**.
3. Criar a release `nr13-v1.1.2` com o arquivo original `WG_NR13_SCORM12_CELULAR_COMPUTADOR_v1.1.2.zip` anexado. Publicar a release após concluir o upload.
4. Em **Actions → Publicar West Prime Game HUB**, usar **Run workflow**, selecionando `main`, após o upload da release.
5. Abrir o endereço retornado pelo deploy e testar o início do jogo nos dois perfis.

Um push inicial antes da configuração do Pages e do upload da release pode falhar. Execute novamente o fluxo depois desses dois passos. Não envie a pasta `dist` nem o ZIP como arquivos Git.

Atualizações na branch `main` publicam automaticamente. A release armazena os binários; o site é publicado sempre a partir de `main`, respeitando a proteção do ambiente `github-pages`. Para uma nova versão do jogo, anexe primeiro o ZIP à release correspondente, atualize `game-release.json` e o wrapper e envie a alteração para `main`. Após anexar um pacote que estava pendente, execute o fluxo manualmente.

## Prévia local

```sh
python scripts/build.py --game-zip /caminho/WG_NR13_SCORM12_CELULAR_COMPUTADOR_v1.1.2.zip
python scripts/validate.py
python -m http.server 8080 --directory dist
```

Abrir http://localhost:8080/. Não abrir por `file://`. A montagem recusa substituir uma pasta `dist` existente; preserve ou remova a saída anterior antes de reconstruir.

## Integridade e funcionamento

- ZIP aprovado: **353536208 bytes**, SHA256 `163fdb5e43bd27684056ecb11da9075618675c9b78b3c2fbbe2463b4f621d2a6`.
- Todos os binários Unity são preservados byte a byte. O wrapper do HUB mantém as mensagens de demonstração e retorno à biblioteca.
- Não há backend, chave de upload, login ChatGPT, R2 ou dependência do West Play nesta cópia.
- Este HUB não registra notas no Moodle. O ZIP SCORM original continua separado para uso no LMS.
- O progresso é local por navegador e origem. O progresso salvo no endereço anterior não migra automaticamente ao endereço GitHub Pages.
- A página e os arquivos publicados ficam públicos. O código/arte e os modelos continuam com seus direitos existentes; esta exportação não concede licença de redistribuição dos assets de terceiros.

## Limites da hospedagem

O GitHub Pages admite um site publicado de até 1 GB e possui limite flexível de tráfego de 100 GB/mês. Esta cópia mantém somente a versão atual. Acompanhe o uso antes de ampliar o catálogo ou distribuir para turmas grandes. O site é uma demonstração, sem vendas, pagamentos ou autenticação de alunos.

Referências: [limites do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [arquivos grandes](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github), [publicação por Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
