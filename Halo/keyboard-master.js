/* Keyboard Master Adventure – Game Engine */
let lang = localStorage.getItem('kmaLang') || 'en';
let soundOn = localStorage.getItem('kmaSound') !== 'off';
let currentLevel = null;
let levelStartTime = null;
let timerInterval = null;
let typingInput = '';
let targetText = '';
let repeatCount = 0;
let specialKeysDone = new Set();
let quizIndex = 0;
let shortcutIndex = 0;
let pressedKeys = new Set();
let simState = {};
let activeKeyHandler = null;

function cleanupLevelHandlers() {
    if (activeKeyHandler) {
        document.removeEventListener('keydown', activeKeyHandler, true);
        activeKeyHandler = null;
    }
}

const SAVE_KEY = 'keyboardMasterSave';
let save = JSON.parse(localStorage.getItem(SAVE_KEY)) || {
    points: 0, xp: 0, stars: 0, completed: [], badges: [],
    bestWPM: 0, bestAcc: 0, levelStars: {}
};

const T = {
    en: {
        mapBtn: 'Map', lblPoints: 'Points', lblXP: 'XP', lblLevel: 'Level', lblStars: 'Stars',
        lblProgress: 'Overall Progress', welcomeTitle: '⌨️ Keyboard Master Adventure',
        welcomeSub: 'Learn typing, shortcuts & ICT skills through gamification',
        objectivesTitle: '🎯 Game Objectives', startGameBtn: '🚀 Start Adventure',
        mapTitle: '🗺️ Level Map', mapSub: 'Complete levels to unlock the next adventure',
        backMapBtn: '← Back to Map', certBackBtn: '← Back', certBtn: '🏆 View Certificate',
        certAwarded: 'This certificate is proudly awarded to', certWPMLabel: 'WPM',
        certAccLabel: 'Accuracy', certLevelsLabel: 'Levels Completed', certStatus: 'Status: PASSED ✅',
        certMsg: 'Congratulations! You have successfully completed the Keyboard Master Adventure and demonstrated competency in typing, keyboard shortcuts, and basic ICT computer operations.',
        modalContinue: 'Continue', enterName: 'Enter your name', generateCert: '📜 Generate Certificate',
        locked: '🔒 Locked', completed: '✅ Done', diffEasy: 'Easy', diffMedium: 'Medium',
        diffHard: 'Hard', diffVeryHard: 'Very Hard', mission: 'Mission', tasks: 'Tasks',
        typeHere: 'Start typing here...', accuracy: 'Accuracy', wpm: 'WPM', time: 'Time',
        progress: 'Progress', press: 'Press', repeat: 'Repeat', of: 'of', correct: 'Correct!',
        wrong: 'Try again!', levelComplete: 'Level Complete!', pointsEarned: 'Points earned',
        badgeEarned: 'Badge earned', pressShortcut: 'Press the correct shortcut keys',
        action: 'Action', keysPressed: 'Keys pressed', fileExplorer: 'File Explorer',
        wrongKey: 'Wrong key — try the shortcut shown above',
        stepComplete: 'Task complete! Click Next to continue.',
        nextTaskBtn: 'Next Task →',
        clickNextToContinue: '✅ Task done — click Next to continue',
        notepad: 'Notepad', runDialog: 'Run', typeNotepad: 'Type notepad and press Enter',
        winRunHint: '🪟 Windows: Press Win+R or Ctrl+Alt+R — or click the button below (browsers may block Win key)',
        openRunBtn: '🪟 Open Run Dialog',
        openNotepadBtn: '📝 Open Notepad',
        runOpenLabel: 'Open:',
        runOk: 'OK', runCancel: 'Cancel',
        notepadUntitled: 'Untitled - Notepad',
        notepadSaved: 'ICT_Report.txt - Notepad',
        charCount: 'Characters',
        fileSaved: '✅ File saved!',
        filePanel: 'File Explorer',
        winShortcutHelp: 'Use keyboard shortcuts shown in each task',
        objectives: [
            'Learn keyboard key locations', 'Improve typing accuracy', 'Increase typing speed',
            'Master common keyboard shortcuts', 'Type without looking at the keyboard',
            'Perform basic computer tasks using keyboard commands'
        ],
        scoringTitle: '📊 Scoring System',
        scoringRules: [
            'Correct Key = 10 Points', 'Correct Word = 20 Points', 'Correct Sentence = 50 Points',
            'Shortcut Task = 100 Points', 'File Management Task = 150 Points',
            '95% Accuracy Bonus = +200', '100% Accuracy Bonus = +500', 'Fast Completion Bonus = +300'
        ]
    },
    ta: {
        mapBtn: 'வரைபடம்', lblPoints: 'புள்ளிகள்', lblXP: 'அனுபவம்', lblLevel: 'நிலை',
        lblStars: 'நட்சத்திரங்கள்', lblProgress: 'மொத்த முன்னேற்றம்',
        welcomeTitle: '⌨️ விசைப்பலகை மாஸ்டர் சாகசம்',
        welcomeSub: 'விளையாட்டு மூலம் தட்டச்சு, குறுக்குவழி விசைகள் மற்றும் ICT திறன்களைக் கற்றுக்கொள்ளுங்கள்',
        objectivesTitle: '🎯 விளையாட்டு நோக்கங்கள்', startGameBtn: '🚀 சாகசத்தைத் தொடங்கு',
        mapTitle: '🗺️ நிலை வரைபடம்', mapSub: 'அடுத்த நிலையைத் திறக்க தற்போதைய நிலையை முடிக்கவும்',
        backMapBtn: '← வரைபடத்திற்கு', certBackBtn: '← பின்', certBtn: '🏆 சான்றிதழைக் காண்',
        certAwarded: 'இந்த சான்றிதழ் பெறுபவர்', certWPMLabel: 'சொற்கள்/நிமிடம்',
        certAccLabel: 'துல்லியம்', certLevelsLabel: 'முடிந்த நிலைகள்', certStatus: 'நிலை: தேர்ச்சி ✅',
        certMsg: 'வாழ்த்துகள்! நீங்கள் விசைப்பலகை மாஸ்டர் சாகசத்தை வெற்றிகரமாக முடித்து, தட்டச்சு, விசைப்பலகை குறுக்குவழிகள் மற்றும் அடிப்படை ICT கணினி செயல்பாடுகளில் திறமையை நிரூபித்துள்ளீர்கள்.',
        modalContinue: 'தொடரவும்', enterName: 'உங்கள் பெயரை உள்ளிடவும்', generateCert: '📜 சான்றிதழை உருவாக்கு',
        locked: '🔒 பூட்டப்பட்டது', completed: '✅ முடிந்தது', diffEasy: 'எளிது', diffMedium: 'நடுத்தரம்',
        diffHard: 'கடினம்', diffVeryHard: 'மிகக் கடினம்', mission: 'பணி', tasks: 'பணிகள்',
        typeHere: 'இங்கே தட்டச்சு செய்யத் தொடங்குங்கள்...', accuracy: 'துல்லியம்', wpm: 'சொற்கள்/நிமி',
        time: 'நேரம்', progress: 'முன்னேற்றம்', press: 'அழுத்தவும்', repeat: 'மீண்டும்',
        of: '/', correct: 'சரி!', wrong: 'மீண்டும் முயற்சிக்கவும்!', levelComplete: 'நிலை முடிந்தது!',
        pointsEarned: 'பெற்ற புள்ளிகள்', badgeEarned: 'பேட்ஜ் பெறப்பட்டது',
        pressShortcut: 'சரியான குறுக்குவழி விசைகளை அழுத்தவும்', action: 'செயல்',
        keysPressed: 'அழுத்தப்பட்ட விசைகள்', fileExplorer: 'கோப்பு நிர்வாகி',
        wrongKey: 'தவறான விசை — மேலே காட்டப்பட்ட குறுக்குவழியைப் பயன்படுத்தவும்',
        stepComplete: 'பணி முடிந்தது! தொடர அடுத்து என்பதை அழுத்தவும்.',
        nextTaskBtn: 'அடுத்த பணி →',
        clickNextToContinue: '✅ பணி முடிந்தது — தொடர அடுத்து என்பதை அழுத்தவும்',
        notepad: 'குறிப்பேடு', runDialog: 'இயக்கு', typeNotepad: 'notepad என தட்டச்சு செய்து Enter அழுத்தவும்',
        winRunHint: '🪟 Windows: Win+R அல்லது Ctrl+Alt+R அழுத்தவும் — அல்லது கீழே உள்ள பொத்தானை அழுத்தவும் (உலாவி Win விசையைத் தடுக்கலாம்)',
        openRunBtn: '🪟 இயக்கு உரையாடலைத் திற',
        openNotepadBtn: '📝 குறிப்பேட்டைத் திற',
        runOpenLabel: 'திற:',
        runOk: 'சரி', runCancel: 'ரத்து',
        notepadUntitled: 'பெயரிடப்படாதது - குறிப்பேடு',
        notepadSaved: 'ICT_Report.txt - குறிப்பேடு',
        charCount: 'எழுத்துகள்',
        fileSaved: '✅ கோப்பு சேமிக்கப்பட்டது!',
        filePanel: 'கோப்பு நிர்வாகி',
        winShortcutHelp: 'ஒவ்வொரு பணியிலும் காட்டப்பட்ட விசைப்பலகை குறுக்குவழிகளைப் பயன்படுத்தவும்',
        objectives: [
            'விசைப்பலகை விசை இருப்பிடங்களைக் கற்றுக்கொள்', 'தட்டச்சு துல்லியத்தை மேம்படுத்து',
            'தட்டச்சு வேகத்தை அதிகரி', 'பொதுவான விசைப்பலகை குறுக்குவழிகளை மாஸ்டர் செய்',
            'விசைப்பலகையைப் பார்க்காமல் தட்டச்சு செய்', 'விசைப்பலகை கட்டளைகள் மூலம் அடிப்படை கணினி பணிகளைச் செய்'
        ],
        scoringTitle: '📊 புள்ளி முறை',
        scoringRules: [
            'சரியான விசை = 10 புள்ளிகள்', 'சரியான சொல் = 20 புள்ளிகள்', 'சரியான வாக்கியம் = 50 புள்ளிகள்',
            'குறுக்குவழி பணி = 100 புள்ளிகள்', 'கோப்பு மேலாண்மை பணி = 150 புள்ளிகள்',
            '95% துல்லிய போனஸ் = +200', '100% துல்லிய போனஸ் = +500', 'விரைவான முடிவு போனஸ் = +300'
        ]
    }
};

const LEVELS = [
    {
        id: 1, icon: '🏠', diff: 'easy', diffKey: 'diffEasy', reward: 100, rewardType: 'xp',
        badge: { en: 'Home Row Hero', ta: 'முகப்பு வரிசை வீரர்' },
        title: { en: 'Home Row Hero', ta: 'முகப்பு வரிசை வீரர்' },
        mission: { en: 'Learn the correct finger position on the home row keys.', ta: 'முகப்பு வரிசை விசைகளில் சரியான விரல் நிலையைக் கற்றுக்கொள்ளுங்கள்.' },
        type: 'homeRow'
    },
    {
        id: 2, icon: '🔤', diff: 'easy', diffKey: 'diffEasy', reward: 0, rewardType: 'badge',
        badge: { en: 'Alphabet Badge', ta: 'எழுத்து பேட்ஜ்' },
        title: { en: 'Alphabet Explorer', ta: 'எழுத்து ஆராய்ச்சியாளர்' },
        mission: { en: 'Master all letter keys — A to Z, Z to A, uppercase and lowercase.', ta: 'அனைத்து எழுத்து விசைகளையும் மாஸ்டர் செய்யுங்கள் — A முதல் Z, Z முதல் A, பெரிய மற்றும் சிறிய எழுத்துகள்.' },
        type: 'alphabet', timeLimit: 120
    },
    {
        id: 3, icon: '💻', diff: 'easy', diffKey: 'diffEasy', reward: 0, rewardType: 'badge',
        badge: { en: 'Typing Star', ta: 'தட்டச்சு நட்சத்திரம்' },
        title: { en: 'Word Racer', ta: 'சொல் பந்தயம்' },
        mission: { en: 'Type ICT-related words with 95% accuracy.', ta: 'ICT தொடர்பான சொற்களை 95% துல்லியத்துடன் தட்டச்சு செய்யுங்கள்.' },
        type: 'words', words: ['Computer','Keyboard','Mouse','Monitor','Internet','Printer','Scanner','Software','Hardware','Network','Database','Programming','Technology','Application','Information'],
        goalAcc: 95
    },
    {
        id: 4, icon: '📝', diff: 'medium', diffKey: 'diffMedium', reward: 0, rewardType: 'badge',
        badge: { en: 'Silver Typist Badge', ta: 'வெள்ளி தட்டச்சாளர் பேட்ஜ்' },
        title: { en: 'Sentence Sprint', ta: 'வாக்கிய ஓட்டம்' },
        mission: { en: 'Type complete sentences within 3 minutes.', ta: '3 நிமிடங்களுக்குள் முழு வாக்கியங்களை தட்டச்சு செய்யுங்கள்.' },
        type: 'sentences',
        sentences: ['I am learning computer skills.','Practice makes perfect.','Technology helps people communicate.','Keyboard skills improve productivity.','ICT is important in modern education.'],
        timeLimit: 180
    },
    {
        id: 5, icon: '🔢', diff: 'medium', diffKey: 'diffMedium', reward: 0, rewardType: 'badge',
        badge: { en: 'Number Ninja Badge', ta: 'எண் நிஞ்ஜா பேட்ஜ்' },
        title: { en: 'Number Ninja', ta: 'எண் நிஞ்ஜா' },
        mission: { en: 'Master the number keys and type calculations.', ta: 'எண் விசைகளை மாஸ்டர் செய்து கணக்கீடுகளை தட்டச்சு செய்யுங்கள்.' },
        type: 'numbers',
        sequences: ['1234567890','0987654321','25 + 75 = 100','50 x 4 = 200','100 / 5 = 20']
    },
    {
        id: 6, icon: '⚔️', diff: 'medium', diffKey: 'diffMedium', reward: 0, rewardType: 'badge',
        badge: { en: 'Symbol Warrior Badge', ta: 'குறியீட்டு வீரர் பேட்ஜ்' },
        title: { en: 'Symbol Warrior', ta: 'குறியீட்டு வீரர்' },
        mission: { en: 'Use the Shift key correctly to type symbols with 100% accuracy.', ta: 'Shift விசையை சரியாகப் பயன்படுத்தி குறியீடுகளை 100% துல்லியத்துடன் தட்டச்சு செய்யுங்கள்.' },
        type: 'symbols',
        sequences: ['! @ # $ % ^ & * ( )','_ + { } | : " < > ?'],
        goalAcc: 100
    },
    {
        id: 7, icon: '⌨️', diff: 'medium', diffKey: 'diffMedium', reward: 0, rewardType: 'badge',
        badge: { en: 'Shortcut Master Badge', ta: 'குறுக்குவழி மாஸ்டர் பேட்ஜ்' },
        title: { en: 'Shortcut Hunter', ta: 'குறுக்குவழி வேட்டையாளர்' },
        mission: { en: 'Learn and practice common keyboard shortcuts.', ta: 'பொதுவான விசைப்பலகை குறுக்குவழிகளைக் கற்று பயிற்சி செய்யுங்கள்.' },
        type: 'shortcuts',
        shortcuts: [
            { action: { en: 'Copy', ta: 'நகலெடு' }, keys: ['Control','c'] },
            { action: { en: 'Paste', ta: 'ஒட்டு' }, keys: ['Control','v'] },
            { action: { en: 'Cut', ta: 'வெட்டு' }, keys: ['Control','x'] },
            { action: { en: 'Undo', ta: 'செயல்தவிர்' }, keys: ['Control','z'] },
            { action: { en: 'Save', ta: 'சேமி' }, keys: ['Control','s'] },
            { action: { en: 'Select All', ta: 'அனைத்தையும் தேர்ந்தெடு' }, keys: ['Control','a'] },
            { action: { en: 'Print', ta: 'அச்சிடு' }, keys: ['Control','p'] },
            { action: { en: 'Find', ta: 'தேடு' }, keys: ['Control','f'] }
        ]
    },
    {
        id: 8, icon: '👁️', diff: 'hard', diffKey: 'diffHard', reward: 0, rewardType: 'badge',
        badge: { en: 'Blind Typing Badge', ta: 'கண்ணற்ற தட்டச்சு பேட்ஜ்' },
        title: { en: 'Blind Typing Challenge', ta: 'கண்ணற்ற தட்டச்சு சவால்' },
        mission: { en: 'Type without looking at the keyboard. Goal: 90% accuracy.', ta: 'விசைப்பலகையைப் பார்க்காமல் தட்டச்சு செய்யுங்கள். இலக்கு: 90% துல்லியம்.' },
        type: 'paragraph',
        text: 'Learning keyboard skills improves productivity and confidence when using computers. Regular practice helps users type faster and more accurately. These skills are useful for education, office work, programming, and daily computer use.',
        goalAcc: 90
    },
    {
        id: 9, icon: '🏆', diff: 'very-hard', diffKey: 'diffVeryHard', reward: 0, rewardType: 'cert',
        badge: { en: 'ICT Keyboard Master Certificate', ta: 'ICT விசைப்பலகை மாஸ்டர் சான்றிதழ்' },
        title: { en: 'ICT Master Challenge', ta: 'ICT மாஸ்டர் சவால்' },
        mission: { en: 'Complete a real-world ICT task using only the keyboard.', ta: 'விசைப்பலகை மட்டும் பயன்படுத்தி நிஜ உலக ICT பணியை முடிக்கவும்.' },
        type: 'master'
    }
];

const QUIZ = [
    { q: { en: 'Which keys are on the home row (left hand)?', ta: 'முகப்பு வரிசையில் (இடது கை) எந்த விசைகள் உள்ளன?' },
      opts: { en: ['A S D F', 'Q W E R', 'Z X C V', 'J K L ;'], ta: ['A S D F', 'Q W E R', 'Z X C V', 'J K L ;'] }, ans: 0 },
    { q: { en: 'Which finger presses the Spacebar?', ta: 'ஸ்பேஸ்பாரை எந்த விரல் அழுத்துகிறது?' },
      opts: { en: ['Thumbs', 'Index', 'Pinky', 'Middle'], ta: ['கட்டைவிரல்கள்', 'சுட்டுவிரல்', 'சிறிய விரல்', 'நடு விரல்'] }, ans: 0 },
    { q: { en: 'What does the Tab key do?', ta: 'Tab விசை என்ன செய்கிறது?' },
      opts: { en: ['Move cursor forward', 'Delete text', 'Save file', 'Print page'], ta: ['கர்சரை முன்னே நகர்த்து', 'உரையை நீக்கு', 'கோப்பை சேமி', 'பக்கத்தை அச்சிடு'] }, ans: 0 }
];

function t(key) { return T[lang][key] || key; }
function L(obj) { return obj[lang] || obj.en; }

function setLang(l) {
    lang = l;
    localStorage.setItem('kmaLang', l);
    document.getElementById('langEn').classList.toggle('active', l === 'en');
    document.getElementById('langTa').classList.toggle('active', l === 'ta');
    document.body.classList.toggle('tamil-text', l === 'ta');
    updateUI();
}

function toggleSound() {
    soundOn = !soundOn;
    localStorage.setItem('kmaSound', soundOn ? 'on' : 'off');
    document.getElementById('soundBtn').textContent = soundOn ? '🔊' : '🔇';
}

function playSound(type) {
    if (!soundOn) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        const freqs = { correct: 660, wrong: 200, complete: 880, badge: 1047 };
        osc.frequency.value = freqs[type] || 440;
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
}

function persist() { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }

function migrateSave() {
    if (save._migratedV2) return;
    const completed = new Set();
    (save.completed || []).forEach(id => {
        if (id === 8) return;
        if (id === 9) completed.add(8);
        else if (id === 10) completed.add(9);
        else completed.add(id);
    });
    save.completed = [...completed].sort((a, b) => a - b);
    const newStars = {};
    if (save.levelStars) {
        Object.entries(save.levelStars).forEach(([k, v]) => {
            const id = parseInt(k, 10);
            if (id === 8) return;
            if (id === 9) newStars[8] = Math.max(newStars[8] || 0, v);
            else if (id === 10) newStars[9] = Math.max(newStars[9] || 0, v);
            else newStars[id] = v;
        });
    }
    save.levelStars = newStars;
    save.badges = (save.badges || []).filter(b => !/File Manager|கோப்பு மேலாளர்/.test(b));
    save._migratedV2 = true;
    persist();
}

function updateHUD() {
    const total = LEVELS.length;
    document.getElementById('hudPoints').textContent = save.points;
    document.getElementById('hudXP').textContent = save.xp;
    document.getElementById('hudLevel').textContent = Math.min(save.completed.length + 1, total);
    document.getElementById('hudStars').textContent = save.stars;
    const pct = (save.completed.length / total) * 100;
    document.getElementById('overallProgress').style.width = pct + '%';
    document.getElementById('certBtn').style.display = save.completed.length >= total ? 'inline-block' : 'none';
}

function updateUI() {
    ['lblPoints','lblXP','lblLevel','lblStars','lblProgress','mapBtn','welcomeTitle','welcomeSub',
     'objectivesTitle','startGameBtn','mapTitle','mapSub','backMapBtn','certBackBtn','certBtn',
     'certAwarded','certWPMLabel','certAccLabel','certLevelsLabel','certStatus','certMsg','modalContinue'
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el && T[lang][id]) el.textContent = T[lang][id];
    });
    document.getElementById('studentName').placeholder = t('enterName');
    const objList = document.getElementById('objectivesList');
    objList.innerHTML = t('objectives').map(o => `<li class="pending">${o}</li>`).join('');
    const scoreList = document.getElementById('scoringList');
    if (scoreList) scoreList.innerHTML = t('scoringRules').map(r => `<li class="pending">${r}</li>`).join('');
    const scoreTitle = document.getElementById('scoringTitle');
    if (scoreTitle) scoreTitle.textContent = t('scoringTitle');
    const genBtn = document.getElementById('generateCertBtn');
    if (genBtn) genBtn.textContent = t('generateCert');
    renderBadges();
    renderMap();
    updateHUD();
}

function renderBadges() {
    const el = document.getElementById('earnedBadges');
    el.innerHTML = save.badges.map(b => `<span class="badge">🏅 ${b}</span>`).join('');
}

function isUnlocked(id) { return id === 1 || save.completed.includes(id - 1); }

function renderMap() {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = LEVELS.map(lv => {
        const done = save.completed.includes(lv.id);
        const locked = !isUnlocked(lv.id);
        const stars = save.levelStars[lv.id] || 0;
        const starStr = '⭐'.repeat(stars) + (stars < 3 ? '☆'.repeat(3 - stars) : '');
        return `<div class="level-card ${lv.diff} ${done ? 'completed' : ''} ${locked ? 'locked' : ''}"
            onclick="${locked ? '' : `startLevel(${lv.id})`}">
            <div class="level-num">${lv.icon}</div>
            <div class="level-title">${L(lv.title)}</div>
            <span class="level-diff diff-${lv.diff}">${t(lv.diffKey)}</span>
            <div class="stars">${done ? starStr : (locked ? t('locked') : '')}</div>
            ${done ? `<div style="font-size:.8em;color:#4caf50;margin-top:4px">${t('completed')}</div>` : ''}
        </div>`;
    }).join('');
}

function showScreen(name) {
    if (name !== 'game') cleanupLevelHandlers();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const map = { welcome: 'screenWelcome', map: 'screenMap', game: 'screenGame', cert: 'screenCert' };
    document.getElementById(map[name]).classList.add('active');
    if (name === 'map') renderMap();
}

function calcStars(accuracy, onTime) {
    let s = 1;
    if (accuracy >= 90) s = 2;
    if (accuracy >= 95 && onTime) s = 3;
    return s;
}

function addScore(base, accuracy, fast) {
    let pts = base;
    if (accuracy >= 95) pts += 200;
    if (accuracy === 100) pts += 500;
    if (fast) pts += 300;
    save.points += pts;
    return pts;
}

function completeLevel(lv, accuracy, wpm, stars, bonusXP) {
    if (!save.completed.includes(lv.id)) save.completed.push(lv.id);
    save.levelStars[lv.id] = Math.max(save.levelStars[lv.id] || 0, stars);
    save.stars += stars;
    if (lv.rewardType === 'xp') save.xp += lv.reward;
    if (lv.rewardType === 'badge' || lv.rewardType === 'cert') {
        const badge = L(lv.badge);
        if (!save.badges.includes(badge)) save.badges.push(badge);
    }
    if (bonusXP) save.xp += bonusXP;
    if (wpm > save.bestWPM) save.bestWPM = wpm;
    if (accuracy > save.bestAcc) save.bestAcc = accuracy;
    persist();
    updateHUD();
    playSound('complete');
    confetti();
    const pts = addScore(50 * stars, accuracy, stars === 3);
    document.getElementById('modalIcon').textContent = stars === 3 ? '🌟' : '🎉';
    document.getElementById('modalTitle').textContent = t('levelComplete');
    document.getElementById('modalMsg').innerHTML = `${t('badgeEarned')}: <strong>${L(lv.badge)}</strong>`;
    document.getElementById('modalScore').textContent = `+${pts} ${t('pointsEarned')}`;
    document.getElementById('resultModal').classList.add('active');
}

function closeModal() {
    document.getElementById('resultModal').classList.remove('active');
    showScreen('map');
}

function confetti() {
    const colors = ['#f44336','#4caf50','#2196f3','#ff9800','#9c27b0','#ffd700'];
    for (let i = 0; i < 40; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 4000);
    }
}

function startLevel(id) {
    cleanupLevelHandlers();
    currentLevel = LEVELS.find(l => l.id === id);
    if (!currentLevel || !isUnlocked(id)) return;
    levelStartTime = Date.now();
    typingInput = '';
    repeatCount = 0;
    specialKeysDone = new Set();
    quizIndex = 0;
    shortcutIndex = 0;
    pressedKeys = new Set();
    simState = {
        explorerOpen: false, files: [], folderCreated: false, renamed: false,
        copied: false, deleted: false, restored: false, trash: null
    };
    clearInterval(timerInterval);
    document.getElementById('gameLevelTitle').textContent = `Level ${id}: ${L(currentLevel.title)}`;
    document.getElementById('gameMission').textContent = L(currentLevel.mission);
    showScreen('game');
    renderLevel();
}

function renderLevel() {
    const area = document.getElementById('gameArea');
    const lv = currentLevel;
    const renderers = {
        homeRow: renderHomeRow, alphabet: renderAlphabet, words: renderWords,
        sentences: renderSentences, numbers: renderNumbers, symbols: renderSymbols,
        shortcuts: renderShortcuts, paragraph: renderParagraph, master: renderMaster
    };
    area.innerHTML = '';
    (renderers[lv.type] || (() => {}))(area, lv);
}

/* ── Level 1: Home Row Hero ── */
function renderHomeRow(area) {
    const HOME_ROW_REPEATS = 3;
    const homeText = 'asdf jkl;';
    let phase = 'repeat'; // repeat | special | quiz
    let specialStep = 0;
    const specialList = [
        { key: ' ', label: { en: 'Spacebar', ta: 'ஸ்பேஸ்பார்' } },
        { key: 'Enter', label: { en: 'Enter', ta: 'எண்டர்' } },
        { key: 'Tab', label: { en: 'Tab', ta: 'டாப்' } },
        { key: 'Backspace', label: { en: 'Backspace', ta: 'பேக்ஸ்பேஸ்' } }
    ];

    function draw() {
        if (phase === 'repeat') {
            area.innerHTML = `
                <div class="key-hint">${lang === 'ta' ? `முகப்பு வரிசை விசைகளை ${HOME_ROW_REPEATS} முறை தட்டச்சு செய்யுங்கள்: asdf jkl;` : `Type the home row keys ${HOME_ROW_REPEATS} times: asdf jkl;`}</div>
                <div class="repeat-counter">${t('repeat')}: ${repeatCount} ${t('of')} ${HOME_ROW_REPEATS}</div>
                <div class="text-display" id="td"></div>
                <input class="type-input" id="ti" placeholder="${t('typeHere')}" autocomplete="off" spellcheck="false">
                <div class="stats-row"><div class="stat-box"><div class="stat-val" id="accV">100%</div><div>${t('accuracy')}</div></div></div>`;
            targetText = homeText;
            bindTyping(() => {
                if (typingInput === homeText) {
                    repeatCount++;
                    playSound('correct');
                    typingInput = '';
                    document.getElementById('ti').value = '';
                    document.getElementById('repeat-counter')?.remove();
                    area.querySelector('.repeat-counter').textContent = `${t('repeat')}: ${repeatCount} ${t('of')} ${HOME_ROW_REPEATS}`;
                    if (repeatCount >= HOME_ROW_REPEATS) { phase = 'special'; specialStep = 0; draw(); }
                }
            }, homeText);
        } else if (phase === 'special') {
            area.innerHTML = `
                <div class="key-hint">${lang === 'ta' ? 'ஒவ்வொரு சிறப்பு விசையையும் அழுத்தவும்:' : 'Press each special key:'}</div>
                <div class="special-key-box" id="skBox"></div>
                <p style="text-align:center;margin-top:12px;font-weight:600" id="skPrompt"></p>`;
            const box = document.getElementById('skBox');
            specialList.forEach((sk, i) => {
                const el = document.createElement('div');
                el.className = 'special-key' + (i < specialStep ? ' done' : '');
                el.textContent = L(sk.label);
                box.appendChild(el);
            });
            document.getElementById('skPrompt').textContent = `${t('press')}: ${L(specialList[specialStep].label)}`;
            const handler = (e) => {
                const sk = specialList[specialStep];
                const match = (sk.key === ' ' && e.key === ' ') || e.key === sk.key;
                if (match) {
                    playSound('correct');
                    specialStep++;
                    if (specialStep >= specialList.length) { document.removeEventListener('keydown', handler); phase = 'quiz'; draw(); }
                    else draw();
                }
            };
            document.addEventListener('keydown', handler);
        } else {
            renderQuiz(area, () => completeLevel(currentLevel, 100, 30, 3, 100));
        }
    }
    draw();
}

function renderQuiz(area, onDone) {
    if (quizIndex >= QUIZ.length) { onDone(); return; }
    const q = QUIZ[quizIndex];
    area.innerHTML = `
        <h3 style="color:#5e35b1;margin-bottom:12px">${lang === 'ta' ? 'விசைப்பலகை வினாடி வினா' : 'Keyboard Location Quiz'}</h3>
        <p style="font-size:1.1em;margin-bottom:16px;font-weight:600">${L(q.q)}</p>
        <div class="quiz-options" id="quizOpts"></div>
        <p style="text-align:center;margin-top:12px">${quizIndex + 1} / ${QUIZ.length}</p>`;
    const opts = document.getElementById('quizOpts');
    q.opts[lang].forEach((opt, i) => {
        const btn = document.createElement('div');
        btn.className = 'quiz-opt';
        btn.textContent = opt;
        btn.onclick = () => {
            if (i === q.ans) { playSound('correct'); btn.classList.add('correct'); quizIndex++; setTimeout(() => renderQuiz(area, onDone), 600); }
            else { playSound('wrong'); btn.classList.add('wrong'); save.points = Math.max(0, save.points - 10); updateHUD(); }
        };
        opts.appendChild(btn);
    });
}

/* ── Typing helpers ── */
function bindTyping(onMatch, text, onInput) {
    targetText = text;
    typingInput = '';
    const ti = document.getElementById('ti');
    const td = document.getElementById('td');
    renderChars(td, text, '');
    ti.focus();
    ti.oninput = () => {
        typingInput = ti.value;
        renderChars(td, text, typingInput);
        updateAcc();
        if (onInput) onInput();
        if (typingInput === text) onMatch();
    };
}

function renderChars(el, text, input) {
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
        const s = document.createElement('span');
        s.textContent = text[i];
        if (i < input.length) s.className = input[i] === text[i] ? 'correct' : 'incorrect';
        else if (i === input.length) s.className = 'current';
        el.appendChild(s);
    }
}

function getAccuracy(input, text) {
    if (!input.length) return 100;
    let c = 0;
    for (let i = 0; i < input.length; i++) if (input[i] === text[i]) c++;
    return Math.round((c / input.length) * 100);
}

function updateAcc() {
    const el = document.getElementById('accV');
    if (el) el.textContent = getAccuracy(typingInput, targetText) + '%';
}

function getWPM(text, seconds) {
    const words = text.trim().split(/\s+/).length;
    return seconds > 0 ? Math.round((words / seconds) * 60) : 0;
}

function startTimer(seconds, elId, onEnd) {
    let rem = seconds;
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = `${t('time')}: ${Math.floor(rem/60)}:${(rem%60).toString().padStart(2,'0')}`;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        rem--;
        el.textContent = `${t('time')}: ${Math.floor(rem/60)}:${(rem%60).toString().padStart(2,'0')}`;
        el.classList.toggle('ok', rem > 30);
        if (rem <= 0) { clearInterval(timerInterval); onEnd(); }
    }, 1000);
}

/* ── Level 2: Alphabet ── */
function renderAlphabet(area, lv) {
    const tasks = [
        { text: 'abcdefghijklmnopqrstuvwxyz', label: { en: 'Type A to Z', ta: 'A முதல் Z வரை தட்டச்சு செய்' } },
        { text: 'zyxwvutsrqponmlkjihgfedcba', label: { en: 'Type Z to A', ta: 'Z முதல் A வரை தட்டச்சு செய்' } },
        { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', label: { en: 'Type UPPERCASE letters', ta: 'பெரிய எழுத்துகளை தட்டச்சு செய்' } },
        { text: 'abcdefghijklmnopqrstuvwxyz', label: { en: 'Type lowercase letters', ta: 'சிறிய எழுத்துகளை தட்டச்சு செய்' } }
    ];
    let taskIdx = 0;
    let timedOut = false;

    function nextTask() {
        if (taskIdx >= tasks.length) {
            const elapsed = (Date.now() - levelStartTime) / 1000;
            const acc = 95;
            const wpm = getWPM(tasks.map(x=>x.text).join(' '), elapsed);
            const stars = calcStars(acc, elapsed < lv.timeLimit);
            completeLevel(lv, acc, wpm, stars, 0);
            return;
        }
        const task = tasks[taskIdx];
        area.innerHTML = `
            <div class="timer" id="timerEl"></div>
            <div class="key-hint">${L(task.label)} — ${lang === 'ta' ? '2 நிமிடங்களுக்குள் முடிக்கவும்' : 'Finish within 2 minutes'}</div>
            <div class="text-display" id="td"></div>
            <input class="type-input" id="ti" placeholder="${t('typeHere')}" autocomplete="off" spellcheck="false">
            <div class="stats-row">
                <div class="stat-box"><div class="stat-val" id="accV">100%</div><div>${t('accuracy')}</div></div>
                <div class="stat-box"><div class="stat-val" id="progV">1/4</div><div>${t('progress')}</div></div>
            </div>`;
        if (taskIdx === 0) startTimer(lv.timeLimit, 'timerEl', () => { timedOut = true; });
        document.getElementById('progV').textContent = `${taskIdx + 1}/4`;
        bindTyping(() => { taskIdx++; playSound('correct'); nextTask(); }, task.text);
    }
    nextTask();
}

/* ── Level 3: Word Racer ── */
function renderWords(area, lv) {
    let wordIdx = 0;
    const words = lv.words;
    function showWord() {
        if (wordIdx >= words.length) {
            const acc = 96;
            completeLevel(lv, acc, 40, calcStars(acc, true), 0);
            return;
        }
        const w = words[wordIdx];
        area.innerHTML = `
            <div class="key-hint">${lang === 'ta' ? 'ICT சொல்லை தட்டச்சு செய் — இலக்கு 95% துல்லியம்' : 'Type the ICT word — Goal: 95% Accuracy'}</div>
            <div style="text-align:center;font-size:2em;font-weight:700;color:#5e35b1;margin:16px 0">${w}</div>
            <div class="text-display" id="td"></div>
            <input class="type-input" id="ti" placeholder="${t('typeHere')}" autocomplete="off" spellcheck="false">
            <div class="stats-row">
                <div class="stat-box"><div class="stat-val" id="accV">100%</div><div>${t('accuracy')}</div></div>
                <div class="stat-box"><div class="stat-val">${wordIdx}/${words.length}</div><div>${t('progress')}</div></div>
            </div>`;
        bindTyping(() => {
            const acc = getAccuracy(typingInput, w);
            if (acc >= 95) { playSound('correct'); save.points += 20; wordIdx++; showWord(); }
            else { playSound('wrong'); save.points = Math.max(0, save.points - 10); typingInput = ''; document.getElementById('ti').value = ''; }
            updateHUD();
        }, w);
    }
    showWord();
}

/* ── Level 4: Sentence Sprint ── */
function renderSentences(area, lv) {
    let sIdx = 0;
    const sents = lv.sentences;
    const endTime = Date.now() + lv.timeLimit * 1000;

    function timeLeft() { return Math.max(0, Math.floor((endTime - Date.now()) / 1000)); }

    function showSent() {
        if (sIdx >= sents.length) {
            clearInterval(timerInterval);
            const elapsed = (Date.now() - levelStartTime) / 1000;
            completeLevel(lv, 92, getWPM(sents.join(' '), elapsed), calcStars(92, elapsed < lv.timeLimit), 0);
            return;
        }
        const s = sents[sIdx];
        const rem = timeLeft();
        area.innerHTML = `
            <div class="timer ${rem > 30 ? 'ok' : ''}" id="timerEl">${t('time')}: ${Math.floor(rem/60)}:${(rem%60).toString().padStart(2,'0')}</div>
            <div class="key-hint">${lang === 'ta' ? 'வாக்கியத்தை முழுமையாக தட்டச்சு செய் — 3 நிமிடங்கள்' : 'Type the complete sentence — 3 minute limit'}</div>
            <div class="text-display" id="td"></div>
            <input class="type-input" id="ti" placeholder="${t('typeHere')}" autocomplete="off" spellcheck="false">
            <div class="stats-row"><div class="stat-box"><div class="stat-val">${sIdx+1}/${sents.length}</div><div>${t('progress')}</div></div></div>`;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const r = timeLeft();
            const el = document.getElementById('timerEl');
            if (el) el.textContent = `${t('time')}: ${Math.floor(r/60)}:${(r%60).toString().padStart(2,'0')}`;
            if (r <= 0) { clearInterval(timerInterval); completeLevel(lv, 70, 20, 1, 0); }
        }, 1000);
        bindTyping(() => { playSound('correct'); save.points += 50; sIdx++; showSent(); updateHUD(); }, s);
    }
    showSent();
}

/* ── Level 5: Number Ninja ── */
function renderNumbers(area, lv) {
    let seqIdx = 0;
    const seqs = lv.sequences;
    function showSeq() {
        if (seqIdx >= seqs.length) {
            completeLevel(lv, 98, 35, 3, 0);
            return;
        }
        const s = seqs[seqIdx];
        area.innerHTML = `
            <div class="key-hint">${lang === 'ta' ? 'எண்களை தட்டச்சு செய் — விசைப்பலகையைப் பார்க்காமல்!' : 'Type the numbers — without looking at the keyboard!'}</div>
            <div class="text-display" id="td"></div>
            <input class="type-input" id="ti" placeholder="${t('typeHere')}" autocomplete="off" spellcheck="false">
            <div class="stats-row"><div class="stat-box"><div class="stat-val">${seqIdx+1}/${seqs.length}</div><div>${t('progress')}</div></div></div>`;
        bindTyping(() => { playSound('correct'); save.points += 10 * s.length; seqIdx++; showSeq(); updateHUD(); }, s);
    }
    showSeq();
}

/* ── Level 6: Symbol Warrior ── */
function renderSymbols(area, lv) {
    let seqIdx = 0;
    function showSeq() {
        if (seqIdx >= lv.sequences.length) {
            completeLevel(lv, 100, 30, 3, 0);
            return;
        }
        const s = lv.sequences[seqIdx];
        area.innerHTML = `
            <div class="key-hint">${lang === 'ta' ? 'Shift விசையைப் பயன்படுத்தி குறியீடுகளை தட்டச்சு செய் — 100% துல்லியம்' : 'Use Shift to type symbols — 100% accuracy required'}</div>
            <div class="text-display" id="td"></div>
            <input class="type-input" id="ti" placeholder="${t('typeHere')}" autocomplete="off" spellcheck="false">
            <div class="stats-row"><div class="stat-box"><div class="stat-val" id="accV">100%</div><div>${t('accuracy')}</div></div></div>`;
        bindTyping(() => {
            const acc = getAccuracy(typingInput, s);
            if (acc === 100) { playSound('correct'); seqIdx++; showSeq(); }
            else { playSound('wrong'); save.points = Math.max(0, save.points - 10); typingInput = ''; document.getElementById('ti').value = ''; }
        }, s);
    }
    showSeq();
}

/* ── Level 7: Shortcut Hunter ── */
function renderShortcuts(area, lv) {
    let idx = 0;
    let currentKeys = [];

    function showShortcut() {
        if (idx >= lv.shortcuts.length) {
            save.points += 100 * lv.shortcuts.length;
            updateHUD();
            completeLevel(lv, 100, 0, 3, 0);
            return;
        }
        const sc = lv.shortcuts[idx];
        currentKeys = [];
        area.innerHTML = `
            <div class="key-hint">${t('pressShortcut')}</div>
            <div class="shortcut-prompt">
                <div>${t('action')}: <strong>${L(sc.action)}</strong></div>
                <div class="shortcut-keys" id="keyDisplay">?</div>
                <div style="font-size:.8em;margin-top:8px;opacity:.8">${idx+1} / ${lv.shortcuts.length}</div>
            </div>
            <ul class="task-list" id="scList"></ul>`;
        const list = document.getElementById('scList');
        lv.shortcuts.forEach((s, i) => {
            list.innerHTML += `<li class="${i < idx ? 'done' : 'pending'}">${L(s.action)} = Ctrl + ${s.keys[1].toUpperCase()}</li>`;
        });

        const handler = (e) => {
            e.preventDefault();
            const key = e.key.toLowerCase();
            if (e.ctrlKey || e.metaKey) currentKeys = ['Control', key];
            else if (key === 'control' || key === 'meta') currentKeys = ['Control'];
            else currentKeys.push(key);

            document.getElementById('keyDisplay').textContent = currentKeys.map(k => k === 'Control' ? 'Ctrl' : k.toUpperCase()).join(' + ');

            const needed = sc.keys.map(k => k.toLowerCase());
            const hasCtrl = e.ctrlKey || e.metaKey;
            if (hasCtrl && key === needed[1]) {
                playSound('correct');
                save.points += 100;
                updateHUD();
                idx++;
                document.removeEventListener('keydown', handler);
                setTimeout(showShortcut, 400);
            }
        };
        document.addEventListener('keydown', handler);
    }
    showShortcut();
}

/* ── Level 8: Blind Typing ── */
function renderParagraph(area, lv) {
    area.innerHTML = `
        <div class="key-hint">${lang === 'ta' ? '⚠️ விசைப்பலகையைப் பார்க்காமல் தட்டச்சு செய்யுங்கள்! இலக்கு: 90% துல்லியம்' : '⚠️ Type without looking at the keyboard! Goal: 90% accuracy'}</div>
        <div class="text-display" id="td"></div>
        <input class="type-input" id="ti" placeholder="${t('typeHere')}" autocomplete="off" spellcheck="false">
        <div class="stats-row">
            <div class="stat-box"><div class="stat-val" id="accV">100%</div><div>${t('accuracy')}</div></div>
            <div class="stat-box"><div class="stat-val" id="wpmV">0</div><div>${t('wpm')}</div></div>
        </div>`;
    const text = lv.text;
    bindTyping(() => {
        const acc = getAccuracy(typingInput, text);
        const elapsed = (Date.now() - levelStartTime) / 1000;
        const wpm = getWPM(text, elapsed);
        if (acc >= lv.goalAcc) completeLevel(lv, acc, wpm, calcStars(acc, true), 0);
        else { playSound('wrong'); alert(lang === 'ta' ? `${lv.goalAcc}% துல்லியம் தேவை. மீண்டும் முயற்சிக்கவும்!` : `Need ${lv.goalAcc}% accuracy. Try again!`); typingInput = ''; document.getElementById('ti').value = ''; }
    }, text, () => {
        const elapsed = (Date.now() - levelStartTime) / 1000;
        document.getElementById('wpmV').textContent = getWPM(typingInput, elapsed);
    });
}

/* ── Level 9: ICT Master Challenge (Windows + In-page Notepad) ── */
function isWinShortcut(e) {
    return e.metaKey || e.getModifierState?.('Meta') || e.getModifierState?.('OS');
}

function renderMaster(area, lv) {
    cleanupLevelHandlers();

    const steps = [
        { key: 'run', label: { en: 'Open Run dialog (Win + R)', ta: 'இயக்கு உரையாடலைத் திற (Win + R)' } },
        { key: 'notepad_cmd', label: { en: 'Type "notepad" and press Enter', ta: '"notepad" தட்டச்சு செய்து Enter அழுத்தவும்' } },
        { key: 'type_text', label: { en: 'Type a paragraph (50+ characters)', ta: 'ஒரு பத்தியை தட்டச்சு செய் (50+ எழுத்துகள்)' } },
        { key: 'save', label: { en: 'Save file (Ctrl + S)', ta: 'கோப்பை சேமி (Ctrl + S)' } },
        { key: 'folder', label: { en: 'Create folder (Ctrl+Shift+N)', ta: 'கோப்புறை உருவாக்கு (Ctrl+Shift+N)' } },
        { key: 'rename', label: { en: 'Rename file (F2)', ta: 'கோப்பை மறுபெயரிடு (F2)' } },
        { key: 'copy', label: { en: 'Copy file (Ctrl + C)', ta: 'கோப்பை நகலெடு (Ctrl + C)' } },
        { key: 'move', label: { en: 'Move file (Ctrl + X)', ta: 'கோப்பை நகர்த்து (Ctrl + X)' } },
        { key: 'delete', label: { en: 'Delete file (Delete)', ta: 'கோப்பை நீக்கு (Delete)' } },
        { key: 'restore', label: { en: 'Restore file (Ctrl + Z)', ta: 'கோப்பை மீட்டெடு (Ctrl + Z)' } },
        { key: 'close', label: { en: 'Close Notepad (Alt + F4)', ta: 'குறிப்பேட்டை மூடு (Alt + F4)' } }
    ];

    let mStep = 0;
    let runInput = '';
    let noteText = '';
    let levelFinished = false;
    let feedback = '';

    simState = {
        runOpen: false, notepadOpen: false, saved: false,
        folderOk: false, renamed: false, copied: false, moved: false,
        deleted: false, restored: false, closed: false,
        files: [], trash: null, fileName: 'ICT_Report.txt'
    };

    function currentStep() { return steps[mStep]; }

    function finishMaster() {
        if (levelFinished) return;
        levelFinished = true;
        cleanupLevelHandlers();
        save.points += 750;
        updateHUD();
        completeLevel(lv, 95, save.bestWPM || 45, 3, 0);
    }

    function advance() {
        playSound('correct');
        feedback = '';
        mStep++;
        if (mStep >= steps.length) finishMaster();
        else draw();
    }

    function openRun() {
        if (mStep !== 0 || simState.runOpen) return;
        simState.runOpen = true;
        playSound('correct');
        mStep = 1;
        draw();
    }

    function openNotepad() {
        if (mStep !== 1) return;
        if (runInput.toLowerCase().trim() !== 'notepad') {
            feedback = lang === 'ta' ? '"notepad" என தட்டச்சு செய்யவும்' : 'Type "notepad" in the box';
            draw();
            return;
        }
        simState.notepadOpen = true;
        simState.runOpen = false;
        playSound('correct');
        mStep = 2;
        draw();
    }

    function draw() {
        const step = currentStep();
        const showRun = simState.runOpen && !simState.notepadOpen;
        const showNotepad = simState.notepadOpen && !simState.closed;
        const showFiles = simState.saved && mStep >= 4;

        area.innerHTML = `
            <div class="key-hint">${t('winRunHint')}</div>
            <div class="win-desktop">
                ${!simState.runOpen && !simState.notepadOpen ? `
                    <div style="text-align:center;padding:50px 20px;color:rgba(255,255,255,.7)">
                        <div style="font-size:3em;margin-bottom:12px">🪟</div>
                        <p>${lang === 'ta' ? 'Windows பணிமேசை — Win+R அழுத்தவும்' : 'Windows Desktop — Press Win+R'}</p>
                        <div class="win-action-row" style="margin-top:20px">
                            <button class="btn btn-primary" id="btnOpenRun">${t('openRunBtn')}</button>
                        </div>
                    </div>
                ` : ''}
                ${showRun ? `
                    <div class="win-run-dialog" id="runDialog">
                        <div class="win-run-title">🏃 ${t('runDialog')}</div>
                        <div class="win-run-body">
                            <label class="win-run-label">${t('runOpenLabel')}</label>
                            <input class="win-run-input" id="runInput" value="${runInput}" placeholder="notepad" autocomplete="off" spellcheck="false">
                            <div class="win-run-btns">
                                <button class="win-btn" id="runCancelBtn">${t('runCancel')}</button>
                                <button class="win-btn primary" id="runOkBtn">${t('runOk')}</button>
                            </div>
                            <div class="win-fallback">
                                <button class="btn btn-success" id="btnOpenNotepad" style="margin-top:10px;font-size:.9em">${t('openNotepadBtn')}</button>
                            </div>
                        </div>
                    </div>
                ` : ''}
                ${showNotepad ? `
                    <div class="win-notepad" id="notepadWin">
                        <div class="win-notepad-title">
                            <span>📝 ${simState.saved ? t('notepadSaved') : t('notepadUntitled')}</span>
                            <span>— □ ✕</span>
                        </div>
                        <div class="win-notepad-menu">
                            <span>File</span><span>Edit</span><span>Format</span><span>View</span><span>Help</span>
                        </div>
                        <textarea class="sim-notepad" id="noteArea" placeholder="${lang === 'ta' ? 'உங்கள் ICT பத்தியை இங்கே தட்டச்சு செய்யுங்கள்...' : 'Type your ICT paragraph here...'}">${noteText}</textarea>
                        <div class="win-notepad-status">
                            <span id="noteCharCount">${noteText.length} ${t('charCount')}</span>
                            <span>${simState.saved ? t('fileSaved') : 'Ln 1, Col 1'}</span>
                        </div>
                    </div>
                ` : ''}
                ${showFiles ? `
                    <div class="win-file-panel">
                        <strong>📁 ${t('filePanel')}</strong>
                        <div id="fileList" style="margin-top:8px">
                            ${simState.files.length ? simState.files.map(f => `<div class="win-file-item">📄 ${f}</div>`).join('') : `<em>${lang === 'ta' ? 'கோப்புகள் இல்லை' : 'No files'}</em>`}
                        </div>
                    </div>
                ` : ''}
            </div>
            <ul class="task-list" id="masterTasks"></ul>
            <p style="text-align:center;font-weight:600;margin-top:12px;color:#5e35b1" id="masterPrompt"></p>
            <p style="text-align:center;color:#f44336;min-height:22px" id="masterFeedback">${feedback}</p>
            <div class="stats-row"><div class="stat-box"><div class="stat-val">${mStep}/${steps.length}</div><div>${t('progress')}</div></div></div>`;

        const list = document.getElementById('masterTasks');
        steps.forEach((s, i) => {
            const done = i < mStep;
            const active = i === mStep;
            list.innerHTML += `<li class="${done ? 'done' : 'pending'}" style="${active ? 'background:#e8eaf6;border:2px solid #5e35b1;font-weight:700' : ''}">${L(s.label)}${active ? ' 👈' : ''}</li>`;
        });
        if (mStep < steps.length) {
            document.getElementById('masterPrompt').textContent = `👉 ${L(step.label)}`;
        }

        document.getElementById('btnOpenRun')?.addEventListener('click', openRun);
        document.getElementById('runOkBtn')?.addEventListener('click', openNotepad);
        document.getElementById('btnOpenNotepad')?.addEventListener('click', openNotepad);
        document.getElementById('runCancelBtn')?.addEventListener('click', () => {
            simState.runOpen = false; mStep = 0; runInput = ''; draw();
        });

        const runIn = document.getElementById('runInput');
        if (runIn) {
            runIn.focus();
            runIn.oninput = () => { runInput = runIn.value; };
            runIn.onkeydown = (e) => {
                if (e.key === 'Enter') { e.preventDefault(); openNotepad(); }
                if (e.key === 'Escape') { simState.runOpen = false; mStep = 0; runInput = ''; draw(); }
            };
        }

        const noteArea = document.getElementById('noteArea');
        if (noteArea) {
            noteArea.focus();
            noteArea.oninput = () => {
                noteText = noteArea.value;
                const cc = document.getElementById('noteCharCount');
                if (cc) cc.textContent = `${noteText.length} ${t('charCount')}`;
                if (mStep === 2 && noteText.length >= 50) advance();
            };
            noteArea.onkeydown = (e) => {
                if (mStep === 3 && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                    e.preventDefault();
                    simState.saved = true;
                    simState.files.push(simState.fileName);
                    advance();
                }
                if (e.altKey && e.key === 'F4' && mStep === 10) {
                    e.preventDefault();
                    simState.closed = true;
                    advance();
                }
            };
        }
    }

    activeKeyHandler = (e) => {
        if (levelFinished || mStep >= steps.length) return;

        // Step 0: Open Run — Win+R or Ctrl+Alt+R (Windows browser fallback)
        if (mStep === 0) {
            const winR = isWinShortcut(e) && e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.altKey && !e.shiftKey;
            const altR = e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r';
            if (winR || altR) { e.preventDefault(); openRun(); }
            return;
        }

        // Step 1: handled in run input
        if (mStep === 1) return;

        // Step 2: typing in notepad
        if (mStep === 2) return;

        // Step 3: Ctrl+S — also handled in noteArea
        if (mStep === 3) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && simState.notepadOpen) {
                e.preventDefault();
                simState.saved = true;
                if (!simState.files.includes(simState.fileName)) simState.files.push(simState.fileName);
                advance();
            }
            return;
        }

        // File management steps (4-9) — only after save
        if (!simState.saved) return;

        let matched = false;
        if (mStep === 4 && (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
            e.preventDefault(); simState.folderOk = true; simState.files.push('New_Folder'); matched = true;
        } else if (mStep === 5 && e.key === 'F2' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault(); simState.renamed = true;
            const idx = simState.files.indexOf(simState.fileName);
            if (idx >= 0) simState.files[idx] = 'ICT_Final.txt';
            matched = true;
        } else if (mStep === 6 && (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'c') {
            e.preventDefault(); simState.copied = true; matched = true;
        } else if (mStep === 7 && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
            e.preventDefault(); simState.moved = true; matched = true;
        } else if (mStep === 8 && e.key === 'Delete') {
            e.preventDefault(); simState.deleted = true; simState.trash = simState.files.pop(); matched = true;
        } else if (mStep === 9 && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault(); if (simState.trash) { simState.files.push(simState.trash); simState.restored = true; } matched = true;
        } else if (mStep === 10 && e.altKey && e.key === 'F4') {
            e.preventDefault(); simState.closed = true; matched = true;
        }

        if (matched) { advance(); draw(); }
    };

    document.addEventListener('keydown', activeKeyHandler, true);
    draw();
}

function showCertificate() {
    showScreen('cert');
    document.getElementById('certWPM').textContent = save.bestWPM || 0;
    document.getElementById('certAcc').textContent = (save.bestAcc || 0) + '%';
    const certCount = document.getElementById('certLevelCount');
    if (certCount) certCount.textContent = `${LEVELS.length}/${LEVELS.length}`;
    const name = localStorage.getItem('kmaStudentName') || '';
    if (name) document.getElementById('studentName').value = name;
}

function generateCert() {
    const name = document.getElementById('studentName').value.trim();
    if (!name) { alert(t('enterName')); return; }
    localStorage.setItem('kmaStudentName', name);
    document.getElementById('certStudentName').textContent = name;
    playSound('badge');
    confetti();
}

document.addEventListener('DOMContentLoaded', () => {
    migrateSave();
    setLang(lang);
    document.getElementById('soundBtn').textContent = soundOn ? '🔊' : '🔇';
});
