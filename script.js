document.addEventListener('DOMContentLoaded', () => {

    // --- Definisi Database ---

    const itemDB = {
        'shortSword': { name: 'Short Sword', type: 'weapon', slot: 'rightHand', stats: { str: 4 }, image: 'images/shortsword.webp' },
        'woodenBuckler': { name: 'Wooden Buckler', type: 'shield', slot: 'leftHand', stats: { end: 2 }, image: 'images/buckler.webp' },
        'longSword': { name: 'Long Sword', type: 'weapon', slot: 'rightHand', stats: { str: 5 }, image: 'images/longsword.webp' },
        'woodenShield': { name: 'Wooden Shield', type: 'shield', slot: 'leftHand', stats: { end: 3 }, image: 'path/to/wooden_shield.png' },
        'morningStar': { name: 'Morning Star', type: 'weapon', slot: 'rightHand', stats: { str: 4 }, image: 'path/to/morning_star.png' },
        'bow': { name: 'Bow', type: 'weapon', slot: 'rightHand', stats: { str: 3, spd: 1 }, image: 'path/to/bow.png' },
        'battleAxe': { name: 'Battle Axe', type: 'weapon', slot: 'rightHand', stats: { str: 6 }, image: 'path/to/battle_axe.png' },
        'dagger': { name: 'Dagger', type: 'weapon', slot: 'rightHand', slot: 'leftHand', stats: { str: 1, spd: 2 }, image: 'images/dagger.webp' },
        'spear': { name: 'Spear', type: 'weapon', slot: 'rightHand', stats: { str: 4 }, image: 'path/to/spear.png' },
        'woodenStaff': { name: 'Wooden Staff', type: 'weapon', slot: 'rightHand', stats: { mag: 3 }, image: 'images/woodenstaff.png' },
        'ironStaff': { name: 'Iron Staff', type: 'weapon', slot: 'rightHand', stats: { mag: 5 }, image: 'path/to/iron_staff.png' },
        
        'goblinEar': { name: 'Goblin Ear', type: 'material', stackable: true, image: 'path/to/goblin_ear.png' },
        'goblinEye': { name: 'Goblin Eye', type: 'material', stackable: true, image: 'path/to/goblin_eye.png' },
        'skeletonBone': { name: 'Skeleton Bone', type: 'material', stackable: true, image: 'path/to/skeleton_bone.png' },
    };

    const skillDB = {
        'fireball': { name: 'Fireball', cost: 10, type: 'magic', damage: 15 },
        'minorHeal': { name: 'Minor Heal', cost: 8, type: 'magic', heal: 20 }
    };

    const classDB = {
        'Knight': {
            baseStats: { str: 15, end: 10, spd: 5, mag: 5 },
            startEquip: ['longSword'],
            skills: []
        },
        'Outlander': {
            baseStats: { str: 10, end: 15, spd: 5, mag: 5 },
            startEquip: ['shortSword', 'woodenBuckler'],
            skills: []
        },
        'Mercenary': {
            baseStats: { str: 10, end: 5, spd: 15, mag: 5 },
            startEquip: ['dagger', 'dagger'], // Note: equip logic needs to handle 2 daggers
            skills: []
        },
        'Priest': {
            baseStats: { str: 5, end: 5, spd: 5, mag: 15 },
            startEquip: ['woodenStaff'],
            skills: ['fireball', 'minorHeal']
        }
    };

    const enemyDB = {
        'tier1': [
            { name: 'Goblin', tier: 1, hp: 30, stats: { str: 5, end: 2, spd: 5 }, xp: 10, image: 'images/goblin1.gif', drops: [{ id: 'goblinEar', chance: 0.5 }, { id: 'goblinEye', chance: 0.2 }, {id: 'longSword', chance: 0.1}] },
            { name: 'Skeleton', tier: 1, hp: 25, stats: { str: 4, end: 1, spd: 3 }, xp: 8, image: 'images/skeleton1.webp', drops: [{ id: 'skeletonBone', chance: 0.5 }] }
        ],
        'tier2': [
            { name: 'Hobgoblin', tier: 2, hp: 60, stats: { str: 8, end: 4, spd: 4 }, xp: 25, image: 'path/to/hobgoblin.png', drops: [{ id: 'goblinEar', chance: 0.8 }, { id: 'goblinEye', chance: 0.4 }] },
            { name: 'Armed Skeleton', tier: 2, hp: 50, stats: { str: 7, end: 3, spd: 5 }, xp: 22, image: 'path/to/armed_skeleton.png', drops: [{ id: 'skeletonBone', chance: 0.8 }, { id: 'shortSword', chance: 0.1 }] }
        ],
        'tier3': [
            { name: 'Goblin Raider', tier: 3, hp: 100, stats: { str: 12, end: 6, spd: 8 }, xp: 50, image: 'path/to/goblin_raider.png', drops: [{ id: 'goblinEar', chance: 1.0 }, { id: 'goblinEye', chance: 0.5 }, { id: 'spear', chance: 0.1 }] },
            { name: 'Skeleton Mage', tier: 3, hp: 80, stats: { str: 5, end: 4, spd: 6, mag: 10 }, xp: 60, image: 'path/to/skeleton_mage.png', drops: [{ id: 'skeletonBone', chance: 1.0 }, { id: 'woodenStaff', chance: 0.1 }] }
        ]
    };

    // --- Variabel Game State ---
    let player = {};
    let currentEnemy = {};
    let isPlayerTurn = true;
    let playerIsGuarding = false;
    let currentEncounterTier = 1;
    let currentScreenId = 'main-menu-screen'; 

    // --- Elemen DOM ---
    const screens = document.querySelectorAll('.screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const prologueScreen = document.getElementById('prologue-screen');
    const classSelectionScreen = document.getElementById('class-selection-screen');
    const combatScreen = document.getElementById('combat-screen');
    const gameWorldScreen = document.getElementById('game-world-screen');
    const inventoryScreen = document.getElementById('inventory-screen');
    const statsScreen = document.getElementById('stats-screen');

    const btnStart = document.getElementById('btn-start');
    const btnLoad = document.getElementById('btn-load');
    const btnContinuePrologue = document.getElementById('btn-continue-prologue');
    const classCards = document.querySelectorAll('.class-card');

    const btnAttack = document.getElementById('btn-attack');
    const btnGuard = document.getElementById('btn-guard');
    const btnMagic = document.getElementById('btn-magic');
    const magicMenu = document.getElementById('magic-menu');
    const combatLog = document.getElementById('combat-log');
    const combatActions = document.getElementById('combat-actions');

    const btnContinueAdventure = document.getElementById('btn-continue-adventure');
    const btnOpenInventory = document.getElementById('btn-open-inventory');
    const btnOpenStats = document.getElementById('btn-open-stats');
    const btnCloseInventory = document.getElementById('btn-close-inventory');
    const btnCloseStats = document.getElementById('btn-close-stats');
    const statPointButtons = document.querySelectorAll('.btn-add-stat');
    
    // Elemen untuk Musik (BARU)
    const bgMusic = document.getElementById('bg-music');
    const btnMusicToggle = document.getElementById('btn-music-toggle');

    // --- Fungsi Utama ---

    function init() {
        if (localStorage.getItem('empireOfIsleSave')) {
            btnLoad.style.display = 'block';
        }
        showScreen('main-menu-screen');

        // --- LOGIKA MUSIK DIMULAI DI SINI ---
        if (bgMusic) {
            bgMusic.volume = 0.3; // Set volume awal 30%
        }

        if (btnMusicToggle && bgMusic) {
            btnMusicToggle.addEventListener('click', () => {
                if (bgMusic.paused) {
                    bgMusic.play().then(() => {
                        btnMusicToggle.innerText = "Music: ON";
                        btnMusicToggle.style.color = "#f0e6d2"; 
                    }).catch(error => {
                        console.log("Autoplay dicegah browser atau file tidak ditemukan:", error);
                        alert("Gagal memutar musik. Pastikan file 'music/theme.mp3' ada.");
                    });
                } else {
                    bgMusic.pause();
                    btnMusicToggle.innerText = "Music: OFF";
                    btnMusicToggle.style.color = "#aaa"; 
                }
            });
        }
        // --- LOGIKA MUSIK SELESAI ---

        // Event Listeners
        btnStart.addEventListener('click', showPrologue);
        btnLoad.addEventListener('click', loadGame);
        btnContinuePrologue.addEventListener('click', showClassSelection);
        classCards.forEach(card => card.addEventListener('click', selectClass));

        btnAttack.addEventListener('click', () => handlePlayerAction('attack'));
        btnGuard.addEventListener('click', () => handlePlayerAction('guard'));
        btnMagic.addEventListener('click', () => handlePlayerAction('magic'));

        btnContinueAdventure.addEventListener('click', startNextEncounter);
        btnOpenInventory.addEventListener('click', () => showScreen('inventory-screen'));
        btnOpenStats.addEventListener('click', () => showScreen('stats-screen'));
        btnCloseInventory.addEventListener('click', () => showScreen('game-world-screen'));
        btnCloseStats.addEventListener('click', () => showScreen('game-world-screen'));

        statPointButtons.forEach(btn => btn.addEventListener('click', allocateStatPoint));
    }

    function showScreen(screenId) {
        currentScreenId = screenId; 
        
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        // Refresh UI saat layar tertentu muncul
        if (screenId === 'stats-screen') updateStatsScreen();
        if (screenId === 'inventory-screen') updateInventoryScreen();
        if (screenId === 'combat-screen') updateCombatUI();
    }

    function showPrologue() {
        showScreen('prologue-screen');
    }

    function showClassSelection() {
        showScreen('class-selection-screen');
    }

    function selectClass(event) {
        const className = event.currentTarget.dataset.class;
        const classData = classDB[className];

        player = {
            name: "Hero",
            class: className,
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            statPoints: 0,
            stats: { ...classData.baseStats },
            skills: [...classData.skills],
            equipment: {
                rightHand: null, leftHand: null, head: null, torso: null,
                legging: null, boots: null, accessory1: null, accessory2: null
            },
            inventory: []
        };

        // Equip starting items
        classData.startEquip.forEach((itemId, index) => {
            const item = { ...itemDB[itemId] };
            if (className === 'Mercenary' && index === 1) {
                player.equipment.leftHand = item; // Mercenary dual wield
            } else {
                player.equipment[item.slot] = item;
            }
        });

        calculateDerivedStats();
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        player.sp = player.maxSp;

        currentEnemy = {};
        
        saveGame();
        startNextEncounter();
    }

    function calculateDerivedStats() {
        // Hitung total stats dari base + equipment
        player.totalStats = { ...player.stats };
        for (const slot in player.equipment) {
            const item = player.equipment[slot];
            if (item && item.stats) {
                for (const stat in item.stats) {
                    player.totalStats[stat] += item.stats[stat];
                }
            }
        }

        player.maxHp = 50 + player.totalStats.end * 10;
        player.maxMp = 20 + player.totalStats.mag * 5;
        player.maxSp = 50 + player.totalStats.spd * 5;

        // Pastikan HP/MP/SP tidak melebihi max baru
        if (player.hp > player.maxHp) player.hp = player.maxHp;
        if (player.mp > player.maxMp) player.mp = player.maxMp;
        if (player.sp > player.maxSp) player.sp = player.maxSp;
    }

    function saveGame() {
        const gameState = {
            player: player,
            currentEnemy: currentEnemy,
            activeScreen: currentScreenId,
            isPlayerTurn: isPlayerTurn
        };
        
        localStorage.setItem('empireOfIsleSave', JSON.stringify(gameState));
        console.log("Game State Saved!");
    }

    function loadGame() {
        try {
            const savedData = localStorage.getItem('empireOfIsleSave');
            if (savedData) {
                const gameState = JSON.parse(savedData);

                // Validasi save data (cek apakah ini save data baru atau lama)
                if (!gameState.player || !gameState.activeScreen) {
                    throw new Error("Save data tidak kompatibel.");
                }

                // PERBAIKAN BUG "ZOMBIE SAVE"
                if (gameState.activeScreen === 'combat-screen' && 
                   (!gameState.currentEnemy || !gameState.currentEnemy.name)) 
                {
                    gameState.activeScreen = 'game-world-screen';
                    gameState.currentEnemy = {}; 
                    console.warn("Mendeteksi save pasca-pertarungan, mengalihkan ke hub...");
                }

                // Kembalikan semua data dari save
                player = gameState.player;
                currentEnemy = gameState.currentEnemy || {}; 
                isPlayerTurn = gameState.isPlayerTurn;
                currentScreenId = gameState.activeScreen; 

                calculateDerivedStats();
                console.log("Game Loaded!");
                
                showScreen(currentScreenId);

                // Jika memuat ke pertarungan yang valid
                if (currentScreenId === 'combat-screen') {
                    addCombatLog("--- Game Loaded ---");
                    if (isPlayerTurn) {
                        enableCombatActions();
                    } else {
                        disableCombatActions();
                        setTimeout(enemyTurn, 1000);
                    }
                }
            } else {
                alert("No save data found!");
            }
        } catch (error) {
            console.error("Gagal memuat game:", error);
            alert("Gagal memuat game! Save data mungkin rusak atau dari versi lama. Menghapus save data yang rusak...");
            localStorage.removeItem('empireOfIsleSave'); 
            btnLoad.style.display = 'none'; 
            showScreen('main-menu-screen'); 
        }
    }

    function startNextEncounter() {
        if (player.level >= 5) currentEncounterTier = 3;
        else if (player.level >= 3) currentEncounterTier = 2;
        else currentEncounterTier = 1;

        const enemyList = enemyDB[`tier${currentEncounterTier}`];
        const randomEnemy = { ...enemyList[Math.floor(Math.random() * enemyList.length)] };
        
        currentEnemy = {
            ...randomEnemy,
            maxHp: randomEnemy.hp,
            stats: { ...randomEnemy.stats } 
        };

        isPlayerTurn = player.totalStats.spd >= (currentEnemy.stats.spd || 5);
        playerIsGuarding = false;

        clearCombatLog();
        addCombatLog(`Seekor ${currentEnemy.name} muncul!`);
        showScreen('combat-screen');
        
        // Simpan game SETELAH musuh baru muncul dan layar berganti
        saveGame(); 

        if (!isPlayerTurn) {
            disableCombatActions();
            setTimeout(enemyTurn, 1000);
        } else {
            enableCombatActions();
        }
    }

    // --- Logika Pertarungan ---

    function handlePlayerAction(action) {
        if (!isPlayerTurn) return;
        disableCombatActions();
        playerIsGuarding = false;

        let actionTaken = false;

        if (action === 'attack') {
            const damage = Math.max(1, player.totalStats.str - (currentEnemy.stats.end || 0));
            currentEnemy.hp -= damage;
            addCombatLog(`Anda menyerang ${currentEnemy.name} dan memberikan ${damage} damage!`);
            actionTaken = true;
        } 
        else if (action === 'guard') {
            playerIsGuarding = true;
            addCombatLog(`Anda bersiap untuk bertahan!`);
            actionTaken = true;
        } 
        else if (action === 'magic') {
            showMagicMenu();
            return; 
        }
        else if (action.type === 'skill') {
            const skill = skillDB[action.id];
            if (player.mp >= skill.cost) {
                player.mp -= skill.cost;
                if (skill.damage) {
                    const damage = skill.damage + player.totalStats.mag;
                    currentEnemy.hp -= damage;
                    addCombatLog(`Anda menggunakan ${skill.name} dan memberikan ${damage} magic damage!`);
                } else if (skill.heal) {
                    player.hp = Math.min(player.maxHp, player.hp + skill.heal);
                    addCombatLog(`Anda menggunakan ${skill.name} dan menyembuhkan ${skill.heal} HP!`);
                }
                actionTaken = true;
            } else {
                addCombatLog(`Mana tidak cukup untuk ${skill.name}!`);
                enableCombatActions(); 
                return;
            }
        }
        
        hideMagicMenu();
        updateCombatUI();

        if (actionTaken) {
            isPlayerTurn = false; 
            checkCombatEnd();
        }
    }

    function enemyTurn() {
        if (!currentEnemy || currentEnemy.hp <= 0) return;

        let baseDamage = 0;
        switch (currentEnemy.tier) {
            case 1: baseDamage = 5; break;
            case 2: baseDamage = 10; break;
            case 3: baseDamage = 15; break;
            default: baseDamage = 5;
        }

        let rawDamage = baseDamage + (currentEnemy.stats.str || 0);

        let reductionPercent = Math.min(0.75, player.totalStats.end * 0.005);
        let damageAfterReduction = rawDamage * (1 - reductionPercent);

        let finalDamage = damageAfterReduction;
        if (playerIsGuarding) {
            finalDamage = Math.floor(finalDamage / 2); 
            addCombatLog(`${currentEnemy.name} menyerang, tapi Anda menahannya!`);
        } else {
            addCombatLog(`${currentEnemy.name} menyerang Anda!`);
        }

        finalDamage = Math.max(3, Math.ceil(finalDamage));

        player.hp -= finalDamage;
        addCombatLog(`Anda menerima ${finalDamage} damage.`);

        playerIsGuarding = false;
        isPlayerTurn = true;
        updateCombatUI();
        checkCombatEnd();
    }

    function checkCombatEnd() {
        if (currentEnemy && currentEnemy.name && currentEnemy.hp <= 0) {
            currentEnemy.hp = 0;
            updateCombatUI();
            
            handleVictory();
            return;
        }

        if (player.hp <= 0) {
            player.hp = 0;
            updateCombatUI();
            addCombatLog(`Anda telah dikalahkan...`);
            setTimeout(() => {
                alert("Game Over! Memuat ulang dari save terakhir.");
                loadGame();
            }, 2000);
            return;
        }

        if (player.name) {
            saveGame();
        }

        if (!isPlayerTurn) {
            setTimeout(enemyTurn, 1000);
        } else {
            enableCombatActions();
        }
    }

    function handleVictory() {
        const defeatedEnemyName = currentEnemy.name;
        const defeatedEnemyXP = currentEnemy.xp;
        const defeatedEnemyDrops = currentEnemy.drops || []; 

        addCombatLog(`Anda telah mengalahkan ${defeatedEnemyName}!`);

        addXP(defeatedEnemyXP);
        addCombatLog(`Anda mendapatkan ${defeatedEnemyXP} XP.`);

        defeatedEnemyDrops.forEach(drop => {
            if (Math.random() < drop.chance) {
                addItemToInventory(drop.id);
                addCombatLog(`Anda mendapatkan ${itemDB[drop.id].name}!`);
            }
        });

        currentEnemy = {};
        saveGame(); 

        setTimeout(() => {
            showScreen('game-world-screen');
            saveGame(); // Simpan lagi SETELAH pindah ke hub
        }, 2000);
    }


    function addXP(amount) {
        player.xp += amount;
        while (player.xp >= player.xpToNextLevel) {
            player.xp -= player.xpToNextLevel;
            levelUp();
        }
    }

    function levelUp() {
        player.level++;
        player.statPoints += 3; 
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
        
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        player.sp = player.maxSp;

        alert(`Level Up! Anda mencapai level ${player.level}. Anda mendapatkan 3 poin stat!`);
    }

    // --- Fungsi Bantuan UI ---

    function showMagicMenu() {
        magicMenu.innerHTML = '';
        magicMenu.style.display = 'flex';
        combatActions.style.display = 'none';

        if (player.skills.length === 0) {
            magicMenu.innerHTML = '<p>Tidak ada skill.</p>';
        }

        player.skills.forEach(skillId => {
            const skill = skillDB[skillId];
            const btn = document.createElement('button');
            btn.innerText = `${skill.name} (${skill.cost} MP)`;
            btn.disabled = player.mp < skill.cost;
            btn.onclick = () => handlePlayerAction({ type: 'skill', id: skillId });
            magicMenu.appendChild(btn);
        });

        const btnCancel = document.createElement('button');
        btnCancel.innerText = 'Cancel';
        btnCancel.onclick = () => {
            hideMagicMenu();
            enableCombatActions();
        };
        magicMenu.appendChild(btnCancel);
    }

    function hideMagicMenu() {
        magicMenu.style.display = 'none';
        combatActions.style.display = 'flex';
    }

    function addCombatLog(text) {
        combatLog.innerHTML += `<p>${text}</p>`;
        combatLog.scrollTop = combatLog.scrollHeight;
    }

    function clearCombatLog() {
        combatLog.innerHTML = '';
    }

    function enableCombatActions() {
        btnAttack.disabled = false;
        btnGuard.disabled = false;
        btnMagic.disabled = false;
    }

    function disableCombatActions() {
        btnAttack.disabled = true;
        btnGuard.disabled = true;
        btnMagic.disabled = true;
    }

    function updateCombatUI() {
        // Player
        if (player && player.name) {
            document.getElementById('player-name').innerText = player.name;
            document.getElementById('player-hp').innerText = Math.ceil(player.hp);
            document.getElementById('player-max-hp').innerText = player.maxHp;
            document.getElementById('player-mp').innerText = player.mp;
            document.getElementById('player-max-mp').innerText = player.maxMp;
            document.getElementById('player-sp').innerText = player.sp;
            document.getElementById('player-max-sp').innerText = player.maxSp;
            document.getElementById('player-image').innerText = ``;
        }
        
        // Enemy
        if (currentEnemy && currentEnemy.name) {
            document.getElementById('enemy-name').innerText = currentEnemy.name;
            document.getElementById('enemy-hp').innerText = Math.ceil(currentEnemy.hp);
            document.getElementById('enemy-max-hp').innerText = currentEnemy.maxHp;
            document.getElementById('enemy-image').innerHTML = `<img src="${currentEnemy.image}" alt="${currentEnemy.name}">`;
        } else {
            document.getElementById('enemy-name').innerText = "Enemy";
            document.getElementById('enemy-hp').innerText = "?";
            document.getElementById('enemy-max-hp').innerText = "?";
            document.getElementById('enemy-image').innerHTML = `

[Image of Enemy]
`;
        }
    }

    function updateStatsScreen() {
        calculateDerivedStats(); 
        document.getElementById('stat-level').innerText = player.level;
        document.getElementById('stat-xp').innerText = player.xp;
        document.getElementById('stat-xp-next').innerText = player.xpToNextLevel;
        document.getElementById('stat-points').innerText = player.statPoints;

        document.getElementById('stat-str').innerText = player.stats.str;
        document.getElementById('stat-end').innerText = player.stats.end;
        document.getElementById('stat-spd').innerText = player.stats.spd;
        document.getElementById('stat-mag').innerText = player.stats.mag;

        statPointButtons.forEach(btn => {
            btn.style.display = player.statPoints > 0 ? 'inline-block' : 'none';
        });
    }

    function allocateStatPoint(event) {
        const stat = event.target.dataset.stat;
        if (player.statPoints > 0) {
            player.statPoints--;
            player.stats[stat]++;
            calculateDerivedStats(); 
            saveGame();
            updateStatsScreen();
        }
    }

    function updateInventoryScreen() {
        const equipmentSlots = document.querySelectorAll('.equipment-slots .slot');
        equipmentSlots.forEach(slotDiv => {
            slotDiv.innerHTML = slotDiv.dataset.slot; 
            slotDiv.onclick = null; 
        });

        for (const slot in player.equipment) {
            const item = player.equipment[slot];
            if (item) {
                const slotDiv = document.getElementById(`equip-${slot}`);
                slotDiv.innerHTML = `<img src="${item.image}" alt="${item.name}" title="${item.name}">`;
                slotDiv.onclick = () => unequipItem(slot);
            }
        }

        const bagDiv = document.getElementById('inventory-bag');
        bagDiv.innerHTML = '<h3>Bag</h3>';
        player.inventory.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-slot';
            itemDiv.innerHTML = `<img src="${item.image}" alt="${item.name}" title="${item.name}">`;
            itemDiv.onclick = () => equipItem(index);
            bagDiv.appendChild(itemDiv);
        });
    }

    function addItemToInventory(itemId) {
        const item = { ...itemDB[itemId] };
        player.inventory.push(item);
    }

    function equipItem(inventoryIndex) {
        const item = player.inventory[inventoryIndex];
        const slot = item.slot;

        if (!slot) {
            alert("Item ini tidak bisa di-equip.");
            return;
        }

        const currentItem = player.equipment[slot];
        if (currentItem) {
            player.inventory.push(currentItem);
            player.equipment[slot] = item;
            player.inventory.splice(inventoryIndex, 1);
        } else {
            player.equipment[slot] = item;
            player.inventory.splice(inventoryIndex, 1);
        }

        calculateDerivedStats();
        saveGame();
        updateInventoryScreen();
        updateCombatUI(); 
    }

    function unequipItem(slot) {
        const item = player.equipment[slot];
        if (item) {
            player.inventory.push(item);
            player.equipment[slot] = null;
            calculateDerivedStats();
            saveGame();
            updateInventoryScreen();
            updateCombatUI();
        }
    }

    // --- Mulai Game ---
    init();
});