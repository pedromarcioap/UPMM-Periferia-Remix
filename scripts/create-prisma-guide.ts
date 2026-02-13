const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle, 
        WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

// Color palette - "Midnight Code" for tech documentation
const colors = {
  primary: "#020617",      // Midnight Black - titles
  body: "#1E293B",         // Deep Slate Blue - body text
  secondary: "#64748B",    // Cool Blue-Gray - subtitles
  accent: "#94A3B8",       // Steady Silver - UI/Decor
  tableBg: "#F8FAFC",      // Glacial Blue-White - table backgrounds
};

const tableBorder = { style: BorderStyle.SINGLE, size: 8, color: colors.accent };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "step-list",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "Passo %1:", alignment: AlignmentType.LEFT,
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
        children: [new TextRun({ text: "Guia Prisma - UPMM", color: colors.secondary, size: 18 })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Página ", color: colors.secondary, size: 18 }), 
          new TextRun({ children: [PageNumber.CURRENT], color: colors.secondary, size: 18 }), 
          new TextRun({ text: " de ", color: colors.secondary, size: 18 }), 
          new TextRun({ children: [PageNumber.TOTAL_PAGES], color: colors.secondary, size: 18 })
        ]
      })] })
    },
    children: [
      // Title
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("Guia Completo: Banco de Dados Prisma")] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
        children: [new TextRun({ text: "Plataforma UPMM - Unidos Por Um Mundo Melhor", color: colors.secondary, size: 24 })] }),

      // Section 1
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. O que é Prisma?")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Prisma é um ORM (Object-Relational Mapping) moderno para Node.js e TypeScript. Ele facilita o trabalho com bancos de dados, oferecendo uma experiência de desenvolvimento mais segura e produtiva. O Prisma permite que você defina seus modelos de dados em um arquivo schema declarativo, gerando automaticamente um cliente TypeScript com tipagem forte e autocompletar inteligente.", color: colors.body })
      ]}),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "A principal vantagem do Prisma é sua capacidade de eliminar o código SQL manual, reduzindo drasticamente a possibilidade de erros e injeções de SQL. Além disso, o Prisma Studio oferece uma interface visual intuitiva para visualizar e editar dados diretamente no navegador, tornando a gestão do banco de dados muito mais acessível para desenvolvedores de todos os níveis.", color: colors.body })
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Características Principais")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Schema Declarativo: Você define seus modelos em um arquivo schema.prisma com sintaxe clara e intuitiva", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Type Safety: Autocomplete e verificação de tipos no código, prevenindo erros em tempo de compilação", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Prisma Client: API intuitiva e expressiva para consultas ao banco de dados", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Migrations: Controle de versão do banco de dados com histórico de alterações", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 400 },
        children: [new TextRun({ text: "Prisma Studio: Interface visual para gerenciar dados sem necessidade de SQL", color: colors.body })] }),

      // Section 2
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Estrutura do Banco de Dados UPMM")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "O banco de dados da plataforma UPMM utiliza SQLite como SGBD (Sistema Gerenciador de Banco de Dados), uma escolha ideal para aplicações de pequeno e médio porte devido à sua simplicidade, portabilidade e ausência de configuração de servidor. O arquivo do banco fica localizado em /home/z/my-project/db/custom.db e contém todas as tabelas necessárias para o funcionamento da plataforma.", color: colors.body })
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Localização dos Arquivos")] }),
      new Table({
        columnWidths: [3500, 5860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3500, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Arquivo", bold: true, color: colors.primary })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 5860, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Descrição", bold: true, color: colors.primary })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "prisma/schema.prisma", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 5860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Definição dos modelos e estrutura do banco", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "prisma/seed.ts", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 5860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Script para popular dados iniciais", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "db/custom.db", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 5860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Arquivo do banco SQLite com todos os dados", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: ".env", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 5860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Variáveis de ambiente incluindo DATABASE_URL", color: colors.body })] })] })
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 300 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "Tabela 1: Localização dos arquivos do banco de dados", color: colors.secondary, size: 18, italics: true })
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Modelos do Banco de Dados")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "O banco de dados UPMM possui 9 modelos principais que trabalham em conjunto para suportar todas as funcionalidades da plataforma, desde autenticação de usuários até o sistema de batalhas de fotos.", color: colors.body })
      ]}),

      new Table({
        columnWidths: [2000, 3500, 3860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2000, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Modelo", bold: true, color: colors.primary })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3500, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Descrição", bold: true, color: colors.primary })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3860, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Campos Principais", bold: true, color: colors.primary })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "User", bold: true, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Usuários da plataforma", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "email, name, vibePoints, role", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Photo", bold: true, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Fotos enviadas", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "title, imageUrl, latitude, city", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Remix", bold: true, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Remakes de fotos", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "imageUrl, originalPhotoId, vibeCount", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Comment", bold: true, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Comentários", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "content, userId, photoId", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Like", bold: true, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Curtidas", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "userId, photoId, remixId", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Badge", bold: true, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Conquistas disponíveis", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "name, description, icon", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Notification", bold: true, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Notificações", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "userId, type, title, isRead", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "BattleVote", bold: true, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Votos em batalhas", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3860, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "userId, photo1Id, photo2Id, winnerId", color: colors.body })] })] })
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 400 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "Tabela 2: Modelos do banco de dados UPMM", color: colors.secondary, size: 18, italics: true })
      ]}),

      // Section 3
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Configuração do Ambiente")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "A configuração correta do ambiente é fundamental para o funcionamento do Prisma. O erro mais comum é a variável DATABASE_URL não estar corretamente configurada. Esta seção detalha todos os passos necessários para configurar o ambiente de desenvolvimento.", color: colors.body })
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Passo 1: Verificar o arquivo .env")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "O arquivo .env deve estar localizado na raiz do projeto e conter a variável DATABASE_URL apontando para o arquivo do banco SQLite. É crucial usar caminho absoluto para evitar problemas de resolução de caminho.", color: colors.body })
      ]}),
      new Paragraph({ spacing: { after: 100 }, children: [
        new TextRun({ text: "Conteúdo correto do arquivo .env:", bold: true, color: colors.body })
      ]}),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 200 },
        children: [new TextRun({ text: "DATABASE_URL=file:/home/z/my-project/db/custom.db", font: "Courier New", size: 20 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Passo 2: Gerar o Prisma Client")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "O Prisma Client é uma biblioteca gerada automaticamente que fornece tipagem forte e autocompletar para suas consultas. Este comando deve ser executado sempre que o schema for alterado.", color: colors.body })
      ]}),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 200 },
        children: [new TextRun({ text: "cd /home/z/my-project && bunx prisma generate", font: "Courier New", size: 20 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Passo 3: Sincronizar o Banco")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Se o banco de dados não existir ou estiver desatualizado em relação ao schema, use os comandos abaixo para sincronizar. O comando db push aplica as alterações do schema no banco sem criar migrations.", color: colors.body })
      ]}),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 100 },
        children: [new TextRun({ text: "bunx prisma db push    # Sincroniza schema com banco", font: "Courier New", size: 20 })] }),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 400 },
        children: [new TextRun({ text: "bunx prisma db seed    # Popula com dados iniciais", font: "Courier New", size: 20 })] }),

      // Section 4
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Comandos Essenciais")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "O Prisma oferece uma série de comandos via CLI (Command Line Interface) para gerenciar o banco de dados. Conhecer esses comandos é essencial para o desenvolvimento e manutenção da aplicação.", color: colors.body })
      ]}),

      new Table({
        columnWidths: [3000, 3000, 3360],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3000, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Comando", bold: true, color: colors.primary })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3000, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Descrição", bold: true, color: colors.primary })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3360, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Quando Usar", bold: true, color: colors.primary })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "prisma generate", font: "Courier New", size: 18, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Gera o Prisma Client", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Após mudar o schema", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "prisma studio", font: "Courier New", size: 18, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Abre interface visual", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Visualizar/editar dados", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "prisma db push", font: "Courier New", size: 18, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Sincroniza schema", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Desenvolvimento", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "prisma db seed", font: "Courier New", size: 18, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Executa script seed", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Popular dados iniciais", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "prisma validate", font: "Courier New", size: 18, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Valida o schema", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Verificar erros", color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "prisma format", font: "Courier New", size: 18, color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Formata o schema", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Organizar código", color: colors.body })] })] })
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 400 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "Tabela 3: Comandos essenciais do Prisma CLI", color: colors.secondary, size: 18, italics: true })
      ]}),

      // Section 5
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Visualizando Dados com Prisma Studio")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Prisma Studio é uma ferramenta visual incrível que permite visualizar, editar e gerenciar os dados do banco de forma intuitiva, sem necessidade de escrever SQL. É uma das funcionalidades mais populares do Prisma, especialmente útil durante o desenvolvimento e debugging.", color: colors.body })
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Como Abrir o Prisma Studio")] }),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 200 },
        children: [new TextRun({ text: "cd /home/z/my-project && bunx prisma studio", font: "Courier New", size: 20 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Após executar o comando, o Prisma Studio será aberto automaticamente no navegador no endereço http://localhost:5555. A interface mostra todas as tabelas do banco e permite navegar entre elas de forma simples e intuitiva.", color: colors.body })
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Funcionalidades Principais")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Visualizar todas as tabelas: Clique em cada modelo na barra lateral para ver todos os registros", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Filtrar dados: Use a barra de busca e filtros para encontrar registros específicos", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Editar registros: Clique diretamente em uma célula para editar o valor", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Adicionar registros: Use o botão 'Add record' para criar novos registros", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 400 },
        children: [new TextRun({ text: "Exportar dados: Exporte os dados em formato JSON ou CSV para análise externa", color: colors.body })] }),

      // Section 6 - Solution of Problems
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Solução de Problemas")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Durante o desenvolvimento, você pode encontrar alguns erros comuns relacionados ao Prisma. Esta seção apresenta os problemas mais frequentes e suas soluções detalhadas.", color: colors.body })
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Erro: Environment variable not found: DATABASE_URL")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Este é o erro mais comum e indica que o Prisma não consegue encontrar a variável de ambiente DATABASE_URL. Geralmente ocorre quando o arquivo .env não existe, está em local incorreto, ou contém erros de formatação.", color: colors.body })
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Solução Passo a Passo")] }),
      new Paragraph({ numbering: { reference: "step-list", level: 0 },
        children: [new TextRun({ text: "Verifique se o arquivo .env existe na raiz do projeto", color: colors.body })] }),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 100 },
        children: [new TextRun({ text: "ls -la /home/z/my-project/.env", font: "Courier New", size: 20 })] }),
      new Paragraph({ numbering: { reference: "step-list", level: 0 },
        children: [new TextRun({ text: "Verifique o conteúdo do arquivo", color: colors.body })] }),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 100 },
        children: [new TextRun({ text: "cat /home/z/my-project/.env | grep DATABASE_URL", font: "Courier New", size: 20 })] }),
      new Paragraph({ numbering: { reference: "step-list", level: 0 },
        children: [new TextRun({ text: "Se necessário, crie ou corrija o arquivo com caminho absoluto", color: colors.body })] }),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 100 },
        children: [new TextRun({ text: "echo 'DATABASE_URL=file:/home/z/my-project/db/custom.db' >> .env", font: "Courier New", size: 20 })] }),
      new Paragraph({ numbering: { reference: "step-list", level: 0 }, spacing: { after: 300 },
        children: [new TextRun({ text: "Regenere o Prisma Client", color: colors.body })] }),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 400 },
        children: [new TextRun({ text: "bunx prisma generate", font: "Courier New", size: 20 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Erro: Table does not exist")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Este erro indica que o banco de dados existe, mas as tabelas não foram criadas. Isso pode acontecer se o banco foi deletado ou se é uma nova instalação.", color: colors.body })
      ]}),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 400 },
        children: [new TextRun({ text: "bunx prisma db push", font: "Courier New", size: 20 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Erro: Prisma Client not generated")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Este erro ocorre quando o cliente Prisma não foi gerado após a instalação ou após mudanças no schema. A solução é simples e rápida.", color: colors.body })
      ]}),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 400 },
        children: [new TextRun({ text: "bunx prisma generate", font: "Courier New", size: 20 })] }),

      // Section 7 - Backup
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Backup e Restore")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Fazer backup regular do banco de dados é uma prática essencial para qualquer projeto. Como o SQLite usa um único arquivo, o processo de backup é particularmente simples e direto.", color: colors.body })
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Fazer Backup")] }),
      new Paragraph({ spacing: { after: 100 }, children: [
        new TextRun({ text: "Método 1: Copiar o arquivo (mais simples)", bold: true, color: colors.body })
      ]}),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 200 },
        children: [new TextRun({ text: "cp /home/z/my-project/db/custom.db /home/z/my-project/db/backup_$(date +%Y%m%d).db", font: "Courier New", size: 20 })] }),
      new Paragraph({ spacing: { after: 100 }, children: [
        new TextRun({ text: "Método 2: Usar dump SQL para exportação completa", bold: true, color: colors.body })
      ]}),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 400 },
        children: [new TextRun({ text: "sqlite3 /home/z/my-project/db/custom.db .dump > backup.sql", font: "Courier New", size: 20 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Restaurar Backup")] }),
      new Paragraph({ spacing: { after: 100 }, children: [
        new TextRun({ text: "Método 1: Restaurar arquivo copiado", bold: true, color: colors.body })
      ]}),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 200 },
        children: [new TextRun({ text: "cp /home/z/my-project/db/backup_20240115.db /home/z/my-project/db/custom.db", font: "Courier New", size: 20 })] }),
      new Paragraph({ spacing: { after: 100 }, children: [
        new TextRun({ text: "Método 2: Restaurar de dump SQL", bold: true, color: colors.body })
      ]}),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 400 },
        children: [new TextRun({ text: "sqlite3 /home/z/my-project/db/custom.db < backup.sql", font: "Courier New", size: 20 })] }),

      // Section 8 - Script
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Script de Verificação")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "A plataforma UPMM inclui um script utilitário para verificar o status do banco de dados. Este script mostra estatísticas, lista usuários e fotos por bairro, e confirma se o banco está funcionando corretamente.", color: colors.body })
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Executar o Script")] }),
      new Paragraph({ shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, spacing: { after: 200 },
        children: [new TextRun({ text: "bun run scripts/check-db.ts", font: "Courier New", size: 20 })] }),

      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "O script exibirá informações detalhadas sobre o banco de dados, incluindo contagem de registros em cada tabela, lista de usuários cadastrados com seus respectivos pontos e níveis, e distribuição de fotos por bairro. Esta ferramenta é especialmente útil para diagnosticar problemas e verificar se os dados estão corretos.", color: colors.body })
      ]}),

      // Summary Table
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Resumo dos Comandos Principais")] }),
      new Table({
        columnWidths: [4680, 4680],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4680, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tarefa", bold: true, color: colors.primary })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4680, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Comando", bold: true, color: colors.primary })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Gerar cliente Prisma", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "bunx prisma generate", font: "Courier New", size: 18, color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Abrir Prisma Studio", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "bunx prisma studio", font: "Courier New", size: 18, color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Sincronizar banco", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "bunx prisma db push", font: "Courier New", size: 18, color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Popular dados iniciais", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "bunx prisma db seed", font: "Courier New", size: 18, color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Validar schema", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "bunx prisma validate", font: "Courier New", size: 18, color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Verificar banco", color: colors.body })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "bun run scripts/check-db.ts", font: "Courier New", size: 18, color: colors.body })] })] })
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 400 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "Tabela 4: Resumo dos comandos principais", color: colors.secondary, size: 18, italics: true })
      ]}),

      // Links
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Links Úteis")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Documentação Oficial: ", color: colors.body }), new TextRun({ text: "https://www.prisma.io/docs", color: colors.secondary })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Prisma Studio: ", color: colors.body }), new TextRun({ text: "https://www.prisma.io/studio", color: colors.secondary })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "SQLite Documentation: ", color: colors.body }), new TextRun({ text: "https://www.sqlite.org/docs.html", color: colors.secondary })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 400 },
        children: [new TextRun({ text: "Prisma Cheat Sheet: ", color: colors.body }), new TextRun({ text: "https://pris.ly/d/cheatsheet", color: colors.secondary })] }),

      // Footer
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [
        new TextRun({ text: "Guia criado para a plataforma UPMM - Unidos Por Um Mundo Melhor", color: colors.secondary, italics: true, size: 20 })
      ]}),
    ]
  }]
});

Packer.toBuffer(doc).then((buffer: Buffer) => {
  fs.writeFileSync("/home/z/my-project/download/GUIA_PRISMA_BANCO_DADOS.docx", buffer);
  console.log("✅ Documento criado com sucesso!");
  console.log("📄 Arquivo: /home/z/my-project/download/GUIA_PRISMA_BANCO_DADOS.docx");
});
