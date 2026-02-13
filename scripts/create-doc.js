/* eslint-disable @typescript-eslint/no-require-imports */
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, 
        AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType, 
        ShadingType, VerticalAlign, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

// Color palette - UPMM theme
const colors = {
  primary: "#FFB800",
  dark: "#2D2A26",
  accent: "#E5A600",
  lightBg: "#FDFCFB",
  gray: "#666666",
  lightGray: "#F5F5F5"
};

// Table borders
const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.dark, font: "Times New Roman" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: colors.dark, font: "Times New Roman" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: colors.dark, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: colors.dark, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "user-flow",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "story-list-1",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "US-%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "story-list-2",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "US-%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "story-list-3",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "US-%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "story-list-4",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "US-%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "story-list-5",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "US-%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ 
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "UPMM Platform - Documentacao MVP", size: 18, color: colors.gray })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Pagina ", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 }), new TextRun({ text: " de ", size: 18 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 })]
      })] })
    },
    children: [
      // Title Page
      new Paragraph({ spacing: { before: 2000 } }),
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("UPMM Platform")] }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "Unidos Por Um Mundo Melhor", size: 28, color: colors.gray })]
      }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "Documentacao do MVP", size: 36, bold: true, color: colors.dark })]
      }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "User Flow e User Stories", size: 24, color: colors.gray })]
      }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { before: 1000 },
        children: [new TextRun({ text: "Versao 1.0 - 2024", size: 20, color: colors.gray })]
      }),
      
      // Page Break
      new Paragraph({ children: [new PageBreak()] }),
      
      // Section 1: User Flow
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. User Flow - Fluxo do Usuario")] }),
      
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [new TextRun({ text: "O fluxo do usuario descreve a jornada completa desde o cadastro ate a criacao do primeiro remix, passando por todas as interacoes principais da plataforma UPMM.", size: 22 })]
      }),
      
      // User Flow Steps
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 Jornada Principal: Do Cadastro ao Primeiro Remix")] }),
      
      new Paragraph({ numbering: { reference: "user-flow", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Descoberta e Acesso: ", bold: true }), new TextRun("O usuario acessa a plataforma UPMM atraves de um link compartilhado, rede social ou busca organica. A landing page apresenta a galeria principal com fotos da comunidade, destacando imagens populares e recentes.")] }),
      
      new Paragraph({ numbering: { reference: "user-flow", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Exploracao Anonima: ", bold: true }), new TextRun("O visitante pode navegar pela galeria, filtrar por tags (#Graffiti, #Arquitetura, #Rua), ordenar por popularidade ou data, e visualizar detalhes das fotos sem necessidade de login.")] }),
      
      new Paragraph({ numbering: { reference: "user-flow", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Motivacao para Cadastro: ", bold: true }), new TextRun("Ao tentar curtir (Vibe), comentar ou remixar uma foto, o sistema solicita autenticacao. O usuario pode optar por login com Google ou cadastro via email.")] }),
      
      new Paragraph({ numbering: { reference: "user-flow", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Cadastro/Login: ", bold: true }), new TextRun("O usuario preenche nome, email e senha (cadastro) ou usa login social (Google). Apos autenticacao, recebe automaticamente um perfil inicial e a badge \"Primeiro Click\" se for novo usuario.")] }),
      
      new Paragraph({ numbering: { reference: "user-flow", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Interacao com a Comunidade: ", bold: true }), new TextRun("O usuario autenticado pode curtir fotos (ganha 2 pontos Vibe), comentar (ganha 5 pontos Vibe), e seguir outros criadores. O sistema de gamificacao incentiva a participacao ativa.")] }),
      
      new Paragraph({ numbering: { reference: "user-flow", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Primeiro Upload: ", bold: true }), new TextRun("O usuario clica em \"Upload\" e e apresentado as Diretrizes Eticas (popup). Apos aceitar, seleciona uma foto, adiciona titulo, descricao e 3-5 tags. Ao publicar, ganha a badge \"Primeiro Click\" se for seu primeiro upload.")] }),
      
      new Paragraph({ numbering: { reference: "user-flow", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Entrada no Estudio Criativo: ", bold: true }), new TextRun("O usuario encontra uma foto que deseja remixar e clica no botao \"Remixar\". O editor in-browser abre com a foto carregada e ferramentas de edicao disponiveis.")] }),
      
      new Paragraph({ numbering: { reference: "user-flow", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Criacao do Remix: ", bold: true }), new TextRun("No editor, o usuario pode: aplicar filtros urbanos (Fim de Tarde, Concreto, Neon), adicionar stickers da biblioteca UPMM, inserir texto com fontes e cores personalizadas, e ajustar brilho/contraste/saturacao.")] }),
      
      new Paragraph({ numbering: { reference: "user-flow", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Salvamento e Compartilhamento: ", bold: true }), new TextRun("Ao salvar, o remix e publicado na galeria com creditos automaticos ao fotografo original. O usuario ganha a badge \"Alquimista\" pelo primeiro remix.")] }),
      
      new Paragraph({ numbering: { reference: "user-flow", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Progressao e Niveis: ", bold: true }), new TextRun("Com atividades continuas (uploads, remixes, comentarios), o usuario acumula pontos Vibe e Responsa, subindo de nivel: Observador (Nivel 1) -> Criador (Nivel 2) -> Ativista Visual (Nivel 3).")] }),
      
      // User Flow Diagram
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 Diagrama de Fluxo Simplificado")] }),
      
      new Table({
        columnWidths: [2340, 2340, 2340, 2340],
        margins: { top: 100, bottom: 100, left: 150, right: 150 },
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: "FFB800", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Acesso", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Exploracao", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cadastro", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Interacao", size: 20 })] })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "->", size: 28, bold: true, color: "FFB800" })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "->", size: 28, bold: true, color: "FFB800" })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "->", size: 28, bold: true, color: "FFB800" })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "->", size: 28, bold: true, color: "FFB800" })] })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Upload", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Remix", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: "FFB800", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Gamificacao", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Niveis", size: 20 })] })] }),
            ]
          }),
        ]
      }),
      
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "Tabela 1: Fluxo principal do usuario na plataforma UPMM", size: 18, italics: true, color: colors.gray })] }),
      
      // Section 2: User Stories
      new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 600 }, children: [new TextRun("2. User Stories - Historias de Usuario")] }),
      
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [new TextRun({ text: "As User Stories descrevem as funcionalidades do ponto de vista do usuario, seguindo o formato padrao: \"Como [tipo de usuario], quero [acao] para [beneficio]\". As historias estao organizadas por modulo e prioridade.", size: 22 })]
      }),
      
      // Module 1: Authentication
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Modulo de Usuario e Comunidade")] }),
      
      new Paragraph({ numbering: { reference: "story-list-1", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como visitante, quero me cadastrar com email e senha para ter acesso completo a plataforma.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Formulario com validacao de email unico, senha minima de 6 caracteres, confirmacao de senha, e feedback visual de sucesso/erro.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-1", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como visitante, quero fazer login com minha conta Google para agilizar o acesso.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Botao de login social visivel, fluxo OAuth funcional, redirecionamento correto apos autenticacao.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-1", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario autenticado, quero visualizar meu perfil com minhas estatisticas e badges.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Exibir foto, nome, bio, pontos Vibe/Responsa, nivel atual, badges conquistadas, e contagem de fotos/remixes.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-1", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario autenticado, quero editar meu perfil para personalizar minha presenca na plataforma.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Permitir edicao de nome, username unico, bio (max 200 caracteres), e foto de perfil.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-1", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero ver uma galeria com as fotos mais recentes e populares da comunidade.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Grid responsivo, lazy loading, filtros por tags, ordenacao por data/popularidade, e paginacao infinita.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-1", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario autenticado, quero curtir (Vibe) fotos para expressar minha apreciacao.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Botao de curtir com animacao, contador atualizado em tempo real, toggle para descurtir, e ganho de 2 pontos Vibe.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-1", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario autenticado, quero comentar em fotos para interagir com a comunidade.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Campo de texto com limite de caracteres, lista de comentarios ordenados por data, e ganho de 5 pontos Vibe.", size: 20, color: colors.gray })] }),
      
      // Module 2: Upload
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Modulo de Upload e Acervo Base")] }),
      
      new Paragraph({ numbering: { reference: "story-list-2", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario autenticado, quero fazer upload de fotos para compartilhar minha visao da periferia.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Suporte a JPG/PNG/WEBP ate 10MB, preview da imagem, e upload com feedback de progresso.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-2", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero ver as diretrizes eticas antes de fazer upload para entender o que e apropriado.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Modal com regras claras sobre privacidade, estetica urbana, respeito a comunidade, e licenca Creative Commons.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-2", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero adicionar titulo, descricao e tags as minhas fotos para categoriza-las adequadamente.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Titulo obrigatorio (max 100 caracteres), descricao opcional (max 500 caracteres), selecao de 3-5 tags pre-definidas.", size: 20, color: colors.gray })] }),
      
      // Module 3: Editor
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.3 Estudio Criativo (Editor)")] }),
      
      new Paragraph({ numbering: { reference: "story-list-3", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero clicar em \"Remixar\" em qualquer foto para abrir o editor.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Botao visivel no card da foto, abre modal em tela cheia, carrega a imagem original automaticamente.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-3", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero aplicar filtros urbanos predefinidos para estilizar minha imagem.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Filtros: Fim de Tarde, Concreto, Neon, Vibrante, Vintage. Preview em tempo real e aplicacao com um clique.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-3", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero ajustar brilho, contraste e saturacao manualmente.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Sliders com valores 0-200%, preview em tempo real, e botao de reset para valores padrao.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-3", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero adicionar stickers da biblioteca UPMM sobre a imagem.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Biblioteca com 8+ stickers SVG, drag-and-drop para posicionar, redimensionamento, e remocao.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-3", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero adicionar texto personalizado sobre a imagem.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Campo de entrada de texto, selecao de cor (color picker), escolha de fonte, e posicionamento.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-3", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero salvar meu remix com creditos automaticos ao autor original.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Salvar como nova imagem, creditos formatados \"Remix por [Artista] sobre foto de [Fotografo]\", e badge Alquimista para primeiro remix.", size: 20, color: colors.gray })] }),
      
      // Module 4: Gamification
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.4 Sistema de Gamificacao")] }),
      
      new Paragraph({ numbering: { reference: "story-list-4", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero ganhar pontos Vibe ao interagir com a plataforma.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "+2 Vibe por curtir, +5 Vibe por comentar, +10 Vibe quando seu remix e curtido. Contador visivel no perfil.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-4", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como criador, quero ganhar pontos Responsa quando minha foto e aprovada na curadoria.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "+50 Responsa por foto marcada como \"Padrao Ouro\", +100 Responsa por foto sincronizada externamente.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-4", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero ver meu nivel atual e progresso para o proximo nivel.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Niveis: Observador (0+ pts), Criador (100+ pts), Ativista Visual (500+ pts). Barra de progresso visual.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-4", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como usuario, quero conquistar badges por conquistas especificas.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Badges MVP: Primeiro Click (primeiro upload), Alquimista (primeiro remix), Comunidade (10 comentarios). Exibicao no perfil.", size: 20, color: colors.gray })] }),
      
      // Module 5: Admin
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.5 Curadoria e Administracao")] }),
      
      new Paragraph({ numbering: { reference: "story-list-5", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como admin, quero ver um dashboard com estatisticas da plataforma.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Total de usuarios, fotos, remixes, comentarios. Contadores de fotos padrao ouro e sincronizadas.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-5", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como admin, quero ver as fotos com mais Vibe para identificar conteudo de destaque.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Lista ordenada por popularidade, com preview, autor, contadores, e acoes rapidas.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-5", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como admin, quero marcar fotos como \"Padrao Ouro\" para destacar o melhor conteudo.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Botao de acao, badge visual na foto, e notificacao ao autor com ganho de pontos Responsa.", size: 20, color: colors.gray })] }),
      
      new Paragraph({ numbering: { reference: "story-list-5", level: 0 }, spacing: { before: 150 },
        children: [new TextRun({ text: "Como admin, quero marcar fotos como sincronizadas para indicar exportacao externa.\n", size: 22 }), new TextRun({ text: "Criterios de Aceitacao: ", bold: true, size: 20 }), new TextRun({ text: "Icone de globo na foto, data de sincronizacao, e lista separada de fotos sincronizadas.", size: 20, color: colors.gray })] }),
      
      // Section 3: Tech Stack
      new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 600 }, children: [new TextRun("3. Stack Tecnologica")] }),
      
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [new TextRun({ text: "A stack tecnologica foi escolhida priorizando velocidade de desenvolvimento, baixo custo inicial, escalabilidade e experiencia moderna do usuario.", size: 22 })]
      }),
      
      new Table({
        columnWidths: [2340, 2340, 4680],
        margins: { top: 100, bottom: 100, left: 150, right: 150 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: "2D2A26", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Camada", bold: true, size: 22, color: "FFFFFF" })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: "2D2A26", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tecnologia", bold: true, size: 22, color: "FFFFFF" })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: "2D2A26", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Justificativa", bold: true, size: 22, color: "FFFFFF" })] })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Frontend", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Next.js 15 + React 19", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "SSR/SSG, App Router, otimizacao automatica, grande ecossistema", size: 20 })] })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Estilizacao", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tailwind CSS + shadcn/ui", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "Desenvolvimento rapido, componentes acessiveis, customizacao total", size: 20 })] })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Backend", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Next.js API Routes", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "Serverless, sem configuracao de servidor, deploy simplificado", size: 20 })] })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Banco de Dados", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "SQLite + Prisma ORM", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "Zero configuracao, ideal para MVP, migracao facil para PostgreSQL", size: 20 })] })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Autenticacao", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NextAuth.js", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "OAuth integrado, sessoes seguras, multiplos providers", size: 20 })] })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Estado Global", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Zustand", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "Leve, simples, sem boilerplate, TypeScript nativo", size: 20 })] })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Animacoes", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Framer Motion", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "Animacoes fluidas, gestures, performance otimizada", size: 20 })] })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Deploy", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Vercel", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "CI/CD automatico, CDN global, SSL gratuito, escalabilidade", size: 20 })] })] }),
            ]
          }),
        ]
      }),
      
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "Tabela 2: Stack tecnologica recomendada para o MVP da UPMM", size: 18, italics: true, color: colors.gray })] }),
      
      // Closing
      new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 600 }, children: [new TextRun("4. Consideracoes Finais")] }),
      
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [new TextRun({ text: "Este documento apresenta a especificacao funcional completa do MVP da plataforma UPMM. O desenvolvimento seguiu uma abordagem mobile-first com foco na experiencia do usuario e na identidade visual da marca. As funcionalidades foram implementadas de forma modular, permitindo evolucao incremental e adicao de novos recursos em futuras iteracoes.", size: 22 })]
      }),
      
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [new TextRun({ text: "O sistema de gamificacao foi projetado para incentivar a participacao ativa da comunidade, enquanto o modulo de curadoria permite a gestao de qualidade do conteudo. O editor de imagens in-browser representa o diferencial principal da plataforma, permitindo a co-criacao sem necessidade de ferramentas externas.", size: 22 })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/UPMM_UserFlow_UserStories.docx", buffer);
  console.log("Document created: /home/z/my-project/download/UPMM_UserFlow_UserStories.docx");
});
