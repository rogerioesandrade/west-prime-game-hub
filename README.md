# West Group GAME HUB

Publicação de demonstração do **Galpão NR13 2.0.0**, para teste e aprovação. Treinamento consolidado com seis missões e dois perfis WebGL no mesmo pacote SCORM 1.2.

Site: https://rogerioesandrade.github.io/west-prime-game-hub/

## Perfis

- **Computador:** texturas e sombras de maior qualidade, teclado e mouse.
- **Smartphone:** texturas compactadas, sombras reduzidas, controles de toque e uso em paisagem. A interface mantém resolução própria para preservar a nitidez dos textos.

O navegador baixa somente o perfil escolhido. Ambos preservam quatro pesos de deformação do personagem. A cena aprovada foi mantida; a exportação foi feita em uma cópia isolada do projeto.

## Organização e publicação

- public/: HUB, apresentação e player com progresso local.
- game-release.json: versão, tamanho e SHA-256 do pacote e de cada arquivo.
- scripts/build.py: verifica o ZIP e monta o site em dist.
- scripts/validate.py: verifica links e integridade da saída.
- .github/workflows/pages.yml: publicação automática a partir de main.

O pacote compilado fica na GitHub Release **nr13-galpao-v2.0.0**, como pré-lançamento para aprovação, com o arquivo **WG_NR13_GALPAO_SCORM12_PC_SMARTPHONE_v2.0.0.zip**. Não contém o projeto Unity nem os ativos fontes. A versão anterior permanece em sua release histórica.

Para atualizar: publicar primeiro o ZIP na release, atualizar o manifesto e enviar as alterações para main. A automação baixa o pacote, verifica os hashes, monta e publica no GitHub Pages. Não colocar ZIPs ou dist no histórico Git.

## Prévia local

    python scripts/build.py --game-zip /caminho/WG_NR13_GALPAO_SCORM12_PC_SMARTPHONE_v2.0.0.zip
    python scripts/validate.py
    python -m http.server 8080 --directory dist

Abrir http://localhost:8080/. A montagem recusa substituir uma pasta dist existente.

## SCORM e validação

O ZIP pode ser importado como SCORM 1.2. Registra progresso, tempo, decisões da emergência e conclusão após a chegada ao ponto de encontro e confirmação da leitura final. A retomada preserva equipamentos, posição e etapa; a emergência reinicia suas decisões ao retomar.

No HUB, o registro é local ao navegador; não envia notas para um LMS. A chave de progresso da versão 2.0.0 é independente da sequência antiga. Não há migração automática de progresso entre origens ou versões.

Foram conferidos compilação, execução WebGL, caminhada, equipamentos, retomada no PC, toque e orientação em emulação móvel e protocolo SCORM com API de teste. A aprovação ainda exige percorrer as missões em smartphone físico e validar o pacote no LMS de destino. Não há desempenho medido em aparelho físico.

## Direitos e hospedagem

Os créditos e avisos aplicáveis acompanham o pacote e o menu Sobre. A publicação compilada não concede licença de redistribuição dos ativos de terceiros.

O site é público e destinado a demonstração, sem pagamentos ou autenticação de alunos. Monitorar armazenamento e tráfego antes de ampliar a distribuição. Referência: [limites do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).
