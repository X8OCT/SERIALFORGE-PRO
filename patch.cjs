const fs = require('fs');

let i18n = fs.readFileSync('src/data/i18n.ts', 'utf8');

// revert the mess
i18n = fs.readFileSync('src/data/i18n.ts', 'utf8');

// I will do multi-replace using precise strings.
i18n = i18n.replace(/autoScroll: string;/, "autoScroll: string;\n  freezeBtn: string;\n  unfreezeBtn: string;");

i18n = i18n.replace(/autoScroll: 'Автопрокрутка',\n\s*clearBtn: 'Очистить',/g, 
  "autoScroll: 'Автопрокрутка',\n    freezeBtn: '❄️ Заморозить',\n    unfreezeBtn: '▶️ Разморозить',\n    clearBtn: 'Очистить',");

i18n = i18n.replace(/autoScroll: 'Автопрокрутка',\n\s*clearBtn: 'Очистити',/g, 
  "autoScroll: 'Автопрокрутка',\n    freezeBtn: '❄️ Заморозити',\n    unfreezeBtn: '▶️ Розморозити',\n    clearBtn: 'Очистити',");

i18n = i18n.replace(/autoScroll: 'Auto-scroll',\n\s*clearBtn: 'Clear',/g, 
  "autoScroll: 'Auto-scroll',\n    freezeBtn: '❄️ Freeze',\n    unfreezeBtn: '▶️ Resume',\n    clearBtn: 'Clear',");

fs.writeFileSync('src/data/i18n.ts', i18n);
