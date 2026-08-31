const fs = require('fs');
let s = fs.readFileSync('src/data/i18n.ts', 'utf8');

s = s.replace(/autoScroll: string;/, "autoScroll: string;\n  freezeBtn: string;\n  unfreezeBtn: string;");

s = s.replace(/autoScroll: 'Автопрокрутка',/, "autoScroll: 'Автопрокрутка',\n    freezeBtn: '❄️ Заморозить',\n    unfreezeBtn: '▶️ Разморозить',");
s = s.replace(/autoScroll: 'Автопрокрутка',/g, "autoScroll: 'Автопрокрутка',\n    freezeBtn: '❄️ Заморозити',\n    unfreezeBtn: '▶️ Розморозити',"); 
// wait, the second replace with the 'g' flag will replace the already modified one or the Ukrainian one. Let's do it carefully.
