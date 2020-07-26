const playersClass = 'mág'

// ============================ CLASSES ============================ // 

class Item{
    constructor(name, type, detail, buyPrice, sellPrice, attack, deffense, isOneHand, isEquipped, buyCode){
        this.name = name;
        this.type = type;
        this.detail = detail;
        this.buyPrice = buyPrice;
        this.sellPrice = sellPrice;
        this.attack = attack;
        this.deffense = deffense
        this.isOneHand = isOneHand;
        this.isEquipped = isEquipped;
        this.buyCode = buyCode;
    }

    addToInventory() {
        const item = document.createElement("li");
        const inventory = document.querySelector(".inventory-ul");
        const itemPosition = player.details.inventory.length;
        //assigns correct values to display on UI based on item properties
        const attackOrDef = this.type === "weapon" ? "útok: " : "obrana: ";
        const attackOrDefValue = this.type === "weapon" ? this.attack : this.deffense;
        const weaponOrArmorOrShield = this.type === "weapon" ? "zbraň" : this.type === "armor" ? "zbroj" : "štít";
        const oneOrTwoHand = this.type !== "weapon" ? "" : this.isOneHand ? "1 ručná" : "2 ručná";

        //add to player inventory
        player.details.inventory.push(this);
        //html UI inventory item containers hold item types for item manipulations, see eqipItem()
        item.className = this.type;

        //create UI Item
        //set ID on icons coresponding to item position in player inventory (array)
        item.innerHTML = `<div class="nazov-itemu">${this.name}</div>
                          <div class="popis-itemu">
                            <div>${weaponOrArmorOrShield}</div>
                            <div>${oneOrTwoHand}</div>
                            <div>${attackOrDef} ${attackOrDefValue}</div>
                          </div>
                          <div class="item-tlacitka">
                            <i class="fas fa-check ${this.type}" id="${itemPosition}"></i>
                            <i class="fas fa-ban" id="${itemPosition}"></i>
                          </div>`;

        //add to UI inventory
        inventory.appendChild(item);            
    }

    static equipItem() {
        const itemInUiInventory = document.querySelectorAll(".inventory-ul li");
        const playersInventory = player.details.inventory;
        const playerEquipped = player.details.equipped;
        const selectedItem = event.target.id;

        //checks which type of item is being equipped
        if(event.target.classList.contains("weapon")){
            //if already equipped, unequip and assign "empty weapon", else just equip :)
            if(playersInventory[selectedItem].isEquipped){
                setIsEquippedToFalse("weapon");
                playerEquipped.weapon = {attack: 0, isOneHand: true};
                removeUiEquippedEffect();
                player.updateAttack();
                TextField.emptyLine();
                TextField.log(`Momentálne nepoužívaš žiadnu zbraň`, "red");
                return; 
            }else{
                setIsEquippedToFalse("weapon");
                playerEquipped.weapon = playersInventory[selectedItem];
                //if item is marked as equipped, it can't be dropped or sold
                playersInventory[selectedItem].isEquipped = true;
                //if weapon is 2hand equip "empty shield"
                if(!playerEquipped.weapon.isOneHand){
                    playerEquipped.shield = {deffense: 0};
                    // and cancel shield equipped effect in UI
                    itemInUiInventory.forEach(itemUi => {
                        if(itemUi.classList.contains("shield")){
                            itemUi.id = "";
                        }
                    })
                    //and unequip all shield from player inventory
                    setIsEquippedToFalse("shield");
                }
                TextField.emptyLine();
                TextField.log(`Začal si používať: ${playerEquipped.weapon.name}`, "green");
            }
        }else if(event.target.classList.contains("armor")){
            if(playersInventory[selectedItem].isEquipped){
                setIsEquippedToFalse("armor");
                playerEquipped.armor = {deffense: 0};
                removeUiEquippedEffect();
                player.updateDeffense();
                TextField.emptyLine();
                TextField.log(`Momentálne nepoužívaš žiadnu zbroj`, "red");
                return; 
            }else{
                setIsEquippedToFalse("armor");
                playerEquipped.armor = playersInventory[selectedItem];
                playersInventory[selectedItem].isEquipped = true;
                TextField.emptyLine();
                TextField.log(`Začal si používať: ${playerEquipped.armor.name}`, "green");
            }
        }else if(event.target.classList.contains("shield")){
            if(playersInventory[selectedItem].isEquipped){
                setIsEquippedToFalse("shield");
                playerEquipped.shield = {deffense: 0};
                removeUiEquippedEffect();
                player.updateDeffense();
                TextField.emptyLine();
                TextField.log(`Momentálne nepoužívaš žiadny štít`, "red");
                return; 
            }else{
                setIsEquippedToFalse("shield");
                //only equip shield if current weapon is onehand, else error
                if(playerEquipped.weapon.isOneHand){
                    playerEquipped.shield = playersInventory[selectedItem];
                    playersInventory[selectedItem].isEquipped = true;
                    TextField.emptyLine();
                    TextField.log(`Začal si používať: ${playerEquipped.shield.name}`, "green");
                }else{
                    TextField.emptyLine();
                    TextField.log("Štít môžeš pouiť iba s jednoručnou zbraňou!", "red");
                    return;
                }
            }
        }

        removeUiEquippedEffect();
        player.updateAttack();
        player.updateDeffense();

        //add ui equipped effect for equipped item
        event.target.parentElement.parentElement.id = "equipped";

        //-------helper functions----

        //remove UI - equipped effect -  from all items of clicked item type
        function removeUiEquippedEffect(){
            itemInUiInventory.forEach(itemUi => {
                if(itemUi.classList.contains(playersInventory[selectedItem].type)){
                    itemUi.id = "";
                }
            })
        }

        //set isEquipped on each item of its type in inventory to false
        function setIsEquippedToFalse(type) {
            playersInventory.forEach(item => {
                if(item.type === type){
                    item.isEquipped = false;
                }
            })
        }
    }

    static dropItem() {
        const selectedItem = event.target.id;
        const restItemsDropBtn = document.querySelectorAll(".fa-ban");
        const restItemsEquipBtn = document.querySelectorAll(".fa-check");

        //chcek if item is in use, if so, it cant be dropped
        if(player.details.inventory[selectedItem].isEquipped){
            TextField.emptyLine();
            TextField.log("Nemôžeš vyhodiť vec, ktorú používaš", "red");
        }else{
            //reset items indexes in Ui inventory, starting from newLevel of removed item and above
            for(let i = selectedItem; i<restItemsDropBtn.length; i++){
                //with .id = i it always removed i+1 item, so i-1 fixes it
                restItemsDropBtn[i].id = i-1;
                restItemsEquipBtn[i].id = i-1;
            }

            //remove clicked item form UI inventory
            event.target.parentElement.parentElement.remove();
            //remove clicked item from player inventory
            player.details.inventory.splice(selectedItem, 1);
        }
    }

    static sellItem() {
        const selectedItem = event.target.id;
        const restItemsDropBtn = document.querySelectorAll(".fa-ban");
        const restItemsEquipBtn = document.querySelectorAll(".fa-check");

        //chcek if item is in use, if so, it cant be dropped
        if(player.details.inventory[selectedItem].isEquipped){
            TextField.emptyLine();
            TextField.log("Nemôžeš predať vec, ktorú používaš", "red");
        }else{
            //reset items indexes in Ui inventory, starting from newLevel of removed item and above
            for(let i = selectedItem; i<restItemsDropBtn.length; i++){
                //with .id = i it always removed i+1 item, so i-1 fixes it
                restItemsDropBtn[i].id = i-1;
                restItemsEquipBtn[i].id = i-1;
            }

            if(player.talkingTo.money < player.details.inventory[selectedItem].sellPrice){
                TextField.emptyLine();
                TextField.log(`${player.talkingTo.name} nemá dostatok peňazí na kúpu predmetu`, 'red');
                return;
            }

            //remove clicked item form UI inventory
            event.target.parentElement.parentElement.remove();
            //add to merchant inventory and remove clicked item from player inventory
            player.talkingTo.inventory.push(player.details.inventory[selectedItem]);

            player.talkingTo.money -= player.details.inventory[selectedItem].sellPrice;
            player.details.money += player.details.inventory[selectedItem].sellPrice;
            Character.pushMoneyToUI();
            TextField.emptyLine();
            TextField.log(`Predal si: ${player.details.inventory[selectedItem].name}`, 'green');
            TextField.emptyLine();
            TextField.logItemsToSell();

            player.details.inventory.splice(selectedItem, 1);
        }
    }

    //creates clone objects of .this Item, so player can have multiple 
    clone() {
        const cloneItem = new Item(this.name, this.type, this.detail, this.buyPrice, this.sellPrice, this.attack, this.deffense, this.isOneHand, this.isEquipped, this.buyCode);
        return (cloneItem);
    }

    static caluclateMoney(moneyPath){
        const gold = Math.floor(moneyPath / 10000);
        const silver = Math.floor((moneyPath - gold * 10000) / 100);
        const copper = (moneyPath - gold * 10000) - (silver * 100);

        const money = [gold, silver, copper];

        return money;
    }

    static tryToBuyItem(){
        const item = player.talkingTo.inventory.filter( item => item.buyCode === playerInput.value)[0];

        if(!item){
            TextField.emptyLine();
            TextField.log('Obchodník takýto predmet nemá.', 'red');
            return;
        }else if(player.details.money < item.buyPrice){
            TextField.emptyLine();
            TextField.log('Nemáš dosť peňazí', 'red');
            return;
        }

        player.details.money -= item.buyPrice;
        player.talkingTo.money += item.buyPrice;
        Character.pushMoneyToUI(); 
        TextField.emptyLine();
        TextField.log(`Kúpil si: ${item.name}`, 'green');
        TextField.emptyLine();

        item.addToInventory();
        player.talkingTo.inventory = player.talkingTo.inventory.filter( items => items.buyCode !== item.buyCode);
        TextField.logItemsToSell();
    }
}

class Enemy {
    constructor(name, hp, atk, def, xp, drop){
        this.name = name;
        this.hp = hp;
        this.atk = atk;
        this.def = def;
        this.xp = xp;
        this.drop = drop;
    }

    startCombat(){
        //if isFighting player cant use items, coommand line, etc, only use abilities 
        player.isFighting = true;
        player.enemy = this;

        Enemy.attack();
    }

    //clones enemy types, co they dont share hp
    clone() {
        const cloneEnemy = new Enemy(this.name, this.hp, this.atk, this.def, this.xp, this.drop);
        return (cloneEnemy);
    }

    //calculates enemy attack values
    static attack(){
        const diceRollEnemy = Math.floor(Math.random() * 5) + 1; 
        const diceRollPlayer = Math.floor(Math.random() * 5) + 1; 
        const enemyAttack = player.enemy.atk + diceRollEnemy;
        const playerDef = player.details.combat.deffense + diceRollPlayer;
        const deathScreen = document.querySelector('.dead-block');
        let hitMsg = '';
        let missMsg = '';
        const hps = enemyAttack - playerDef === 1 ? 'život' : enemyAttack - playerDef < 5 ? 'životy' : 'životov';

        //generates different hit and miss messages for enemy
        switch(diceRollEnemy){
            case 1:
                hitMsg = `${player.enemy.name} ťa zranil za ${(enemyAttack - playerDef)} ${hps}`;
                missMsg = `${player.enemy.name} sa zahnal ale jeho útok minul`;
                break;
            case 2:
                hitMsg = `${player.enemy.name} ťa zasiahol a jeho útok ti uberá ${(enemyAttack - playerDef)} ${hps}`;
                missMsg = `${player.enemy.name} ťa zasiahol no jeho útok ti nespôsobil žiadne zranenie`;
                break;
            case 3:
                hitMsg = `${player.enemy.name} útočí a zraňuje ťa za ${(enemyAttack - playerDef)} ${hps}`;
                missMsg = `${player.enemy.name}ov útók ťa minul len o vlas`;
                break;
            case 4:
                hitMsg = `Snažil si sa kryť, no ${player.enemy.name}ov útok ťa zraňuje za ${(enemyAttack - playerDef)} ${hps}`;
                missMsg = `Vykril si ${player.enemy.name}ov útok`;
                break;
            case 5:
                hitMsg = `${player.enemy.name} ťa zranil za ${(enemyAttack - playerDef)} ${hps}`;
                missMsg = `${player.enemy.name} útočí no jeho útoku si sa úspešne vyhol`;
                break;
            case 6:
                hitMsg = `${player.enemy.name} zaútočil a spôsobil ti zranenia za ${(enemyAttack - playerDef)} ${hps}`;
                missMsg = `${player.enemy.name} sa zahnal no jeho útok minul`;
                break;
        }

        if(enemyAttack - playerDef > 0 ){
            player.details.vitals.currentHp -= (enemyAttack - playerDef);
            TextField.log(hitMsg);
            if(player.details.vitals.currentHp <= 0){
                deathScreen.style.display = 'flex';
                return;
            }
            player.setCurrentHp(player.details.vitals.currentHp);
        }else{
            TextField.log(missMsg);
        }
    }
        
    //if location has enemy, fight starts on enter
    static checkForEnemy() {
        if(player.position.enemy){
            if (!player.position.isCleared){
                player.position.enemy.startCombat();
            }
        }
    }
}


class Ability {
    constructor(name, atk, res, type, price, learnCode = null, callback = null, description = null){
        this.name = name;
        this.atk = atk;
        this.res = res;
        this.type = type;
        this.price = price;
        this.learnCode = learnCode;
        this.callback = callback;
        this.description = description;
    }

    addToAbilities() {
        const ability = document.createElement("li");
        const resources = document.querySelector(".desc-res").textContent;
        const abilityBar = document.querySelector(".abilities-ul");
        const text = this.type === 'magical' ? `magické poškodenie: ${this.atk}` : this.type === 'utility' ?  `${this.description}` :`fyzické poškodenie: + ${this.atk}`

        ability.className = "ability";
        //set html id to be equal with array position
        ability.id = player.details.abilities.length;

        ability.innerHTML= `<div class="ability-name">${this.name}</div>
                            <div class="ability-desc">${text}</div>
                            <div class="res-costs">${resources}: ${this.res}</div>`;

        abilityBar.appendChild(ability);

        player.details.abilities.push(this);
    }

    static useAbility(){
        //access correct array index thanx to html id, see one func above
        const abilityIndex = event.target.parentElement.id;
        //simulate dice roll of 6k dice
        const diceRoll = Math.floor(Math.random() * 5) + 1; 

        player.details.vitals.currentResources -= player.details.abilities[abilityIndex].res;
        //push current resources to UI
        player.setCurrentResources(player.details.vitals.currentResources);

        //different actions for different ability type - physicall add dice roll and subs armor
        if(player.details.abilities[abilityIndex].type === "physical"){
            return(player.details.combat.attack + player.details.abilities[abilityIndex].atk + diceRoll);
        // - magic ignore armor but doesnt add dice roll to dmg
        }else if(player.details.abilities[abilityIndex].type === "magical"){
            return(player.details.abilities[abilityIndex].atk);
        }else{
            return(player.details.abilities[abilityIndex].callback());
        }
    }
    
    static tryToLearnAbility(){
        const ability = player.talkingTo.teach.filter( ability => ability.learnCode === playerInput.value)[0];

        if(player.details.abilities.includes(ability)) {
            TextField.emptyLine();
            TextField.log('Takúto schopnosť sa naučiť nemôžeš, už ju ovládaš', 'red');
            return;
        }

        if(player.details.stats.statPoints < ability.price){
            TextField.emptyLine();
            TextField.log('Nemáš dostatok skúenostných bodv na naučenie', 'red');
            return;
        }

        TextField.emptyLine();
        TextField.log(`Naučil si sa ${ability.name}`, 'green');
        player.details.stats.spentStatPoints += ability.price;
        player.details.stats.statPoints -= ability.price;
        player.showStatsBtns();
        ability.addToAbilities();
    }

    static heal(){
        //if missing hp is less than heal potencial, heal max up to missing hp
        if(player.details.vitals.maxHp - player.details.vitals.currentHp < this.atk){
            player.setCurrentHp(player.details.vitals.currentHp += player.details.vitals.maxHp - player.details.vitals.currentHp);
            return;
        }
        player.setCurrentHp(player.details.vitals.currentHp += this.atk);
    }

    static invis() {
        //esceps players isfighting state so player is "invisible" to enemy until room reenter
        player.isFighting = false;
    }
}


const basicAttack = new Ability("Útok zbraňou", 0, 0, "physical", 0);

const swingStrike = new Ability("Útok švihom", 2, 5, "physical", 3, 'uš');
const fear = new Ability('Mocný krik', 0, 15, 'utility', 3, 'rev', Ability.invis, 'Vyplaší nepriatelov z boja');
const vypad = new Ability('Výpad', 5, 10, 'physical', 3, 'vyp');

const blueLightnings = new Ability("Modré blesky", 10, 10, "magical", 2, 'mb');
const fireball = new Ability('Ohnivá gula', 15, 15, 'magical', 2, 'og');
const invisibility = new Ability('Neviditelnost', 0, 15, 'utility', 3, 'nev', Ability.invis, 'spraví ťa neviditelným');

const flatStrike = new Ability('Úder na plocho', 2, 5, 'physical', 2, 'pu');
const heal = new Ability('Liečenie', 20, 10, 'utility', 3, 'li', Ability.heal, `pridá 20 života`);
const holyStrike = new Ability('Zásah svetlom', 10, 15, 'magical', 3, 'zs');


// =========================== ENEMY PROTOTYPES ============================ //

const skeleton = new Enemy("Kostráč", 20, 4, 4, 70);
const wolf = new Enemy("Vlk", 20, 5, 3, 70);
const bigSpider = new Enemy("Velký pavúk", 30, 5, 5, 100);
const giantSpider = new Enemy("Obrovský pavúk", 40, 7, 7, 150);
const maximus = new Enemy("MAximus", 60, 10, 10, 250);
const prizrak = new Enemy("Prízrak", 60, 10, 10, 250);
const vydriduch = new Enemy("Vydriduch", 60, 10, 10, 250);


// =========================== ITEMS PROTOTYPES ============================ //

const rustySword = new Item("Hrdzavý meč", "weapon", "", 1000, 500, 2, 0, true, false, 'hm');
const broadSword = new Item("Široký meč", "weapon", "", 2000, 1000, 5, 0, true, false, 'šm');
const bastardSword = new Item("Meč bastard", "weapon", "", 4000, 2000, 7, 0, true, false, 'mb');
const greatSword = new Item("Velký meč", "weapon", "", 5000, 2500, 9, 0, false, false, 'vm');
const woodenShield = new Item("Drevenný štít", "shield", "", 1000, 500, 0, 1, true, false, 'dš');
const metalShield = new Item("Kovový štít", "shield", "", 2000, 1000, 0, 3, true, false, 'kš');
const leatherArmor = new Item("Koženná zbroj", "armor", "", 1500, 700, 0, 3, true, false, 'kz');
const metalArmor = new Item("Krúžková zbroj", "armor", "", 3000, 1400, 0, 5, true, false, 'krz');
const arenaFightersArmor = new Item("Zbroj bojovíka arény", "armor", "", 15000, 7000, 0, 10, true, false, 'zba');
const fireMagesRobe = new Item("Rúcho mága ohňa", "armor", "", 15000, 7000, 0, 5, true, false, 'rmo');
const novicesArmor = new Item("Zbroj paladínskeho novica", "armor", "", 15000, 7000, 0, 7, true, false, 'zbn');



class TextField {
    static log(message, color = "black"){
        const textField = document.querySelector(".text-field");
        const pTag = document.createElement("p");

        pTag.textContent = `${message}`;
        pTag.style.color = color;

        textField.appendChild(pTag);

        //keeps scrolled down
        (function updateScroll(){
            textField.scrollTop = textField.scrollHeight;
        })();
    }

    static emptyLine(){
        const textField = document.querySelector(".text-field");
        textField.innerHTML += '<br>';
    }

    static underscoreLine(){
        const textField = document.querySelector(".text-field");
        textField.textContent += '_______________________________________';
    }

    //logs conversation with NPC
    static logConversationBranch(branch){
        //chooses conversation tree based on whether the quest is completed or not
        const whichConversation = player.talkingTo.isQuestCompleted ? 'completedConversation' : 'conversation';

        player.talkingTo[whichConversation][branch].forEach( (row, index) => {
            //doesnt log branches last position (array - contains valid responses selectors for selected branch)
            if(index < player.talkingTo[whichConversation][branch].length-1){
                //what NPC says
                if (index === 0){
                    TextField.emptyLine();
                    TextField.log(`${player.talkingTo.name}: ${row}`, '#01498c');
                    TextField.emptyLine();
                //player responses
                }else{
                    TextField.log(row);
                }
            }
        });
    }

    static logAbilitiesToTeach() {
        player.talkingTo.teach.forEach( ability => {
            const typ = ability.type === 'magical' ? 'magický' : 'fyzicky';
            TextField.log(`${ability.name} [${ability.learnCode}] - poškodenie: ${ability.atk},  spotreba zdrojov: ${ability.res},  typ: ${typ},  cena: ${ability.price} skúsenostných bodov`);
        })
    }

    static logItemsToSell() {
        let itemType;

        player.talkingTo.inventory.forEach( item => {
            const weaponHands = item.isOneHand ? '1r' : '2r';
            const defOrAtt = item.attack ? `útok: ${item.attack}` : `obrana: ${item.deffense}`; 

            switch (item.type) {
                case 'weapon':
                    itemType = `zbraň (${weaponHands})`;
                    break;
                case 'shield':
                    itemType = 'štít';
                    break;
                case 'armor':
                    itemType = 'zbroj';
                    break; 
            }

            TextField.log(`${ item.name } [${ item.buyCode }] - ${itemType}, ${defOrAtt}, cena: ${Item.caluclateMoney(item.buyPrice)[0]} zlaťákov, ${Item.caluclateMoney(item.buyPrice)[1]} strieborňákov a ${Item.caluclateMoney(item.buyPrice)[2]} meďákov`)
        })

        TextField.log(`${player.talkingTo.name} má k dispozícií ${Item.caluclateMoney(player.talkingTo.money)[0]} zlaťákov, ${Item.caluclateMoney(player.talkingTo.money)[1]} strieborňákov a ${Item.caluclateMoney(player.talkingTo.money)[2]} meďákov`);
    }
}


class NPC {
    constructor(name, haveItems, haveQuest){
        this.name = name;
        this.haveItems = haveItems;
        this.haveQuest = haveQuest;
    }
    static conversationBranch = 0;
    static prevConversationBranch = 0;

    //start conversation with npc after player command
    startConversation(){
        //class NPCs interact only with their own class
        if(this.className && this.className !== player.charClass.className){
            TextField.emptyLine();
            TextField.log(`${this.name}: Čo tu pohladávaš? s ${player.charClass.className}om sa nemám o čom baviť, choď si za svojími. `);
            return;
        //if player has quest in progress, NPC wont talk to him
        }else if(this.isQuestInProgress && !this.isQuestCompleted){
            TextField.emptyLine();
            TextField.log(`${this.name}: šup, šup, očakávame tvoj zdárny návrat`, '#01498c');
            return;
        }

        //if player completed quest for this NPC and NPC still have item (first encounter since completed)
        if(this.isQuestCompleted && this.haveItems){
            this.giveQuestReward();
        }

        player.isTalking = true;
        player.talkingTo = this;

        TextField.logConversationBranch(0);
    }

    //if player accept quest npc opens new location where to go
    static openLocation(openedLocation) {
        //accepted quest is alwas as 4th conversation branch
        if (NPC.conversationBranch >= 4){
            //current location is marked as cleared - it shows different text when player enter location (with new path description)
            player.position.isCleared = true;
            //assign new location path to forward move
            player.talkingTo.isQuestInProgress = true;
            if(player.position.newLocationPath){
                player.position.forward = openedLocation;
            }
        }
    }

    giveQuestReward(){
        player.details.xp += this.expReward;
        this.haveItems.addToInventory();
        TextField.emptyLine();
        TextField.log(`Dokončil si úlohu, za splnenie dostávaš ${this.haveItems.name} a ${this.expReward} skúseností.`, 'green');
        this.haveItems = false;
        player.levelUp();
    }

    static getAbilitiesLearnCode(npc){
        const codeList = [];
        npc.teach.forEach( ability => codeList.push(ability.learnCode));
        return codeList;
    }

    static getItemsToBuyCode(npc){
        const codeList = [];
        npc.inventory.forEach( item => codeList.push(item.buyCode));
        return codeList;
    }
}


class QuestNPC extends NPC {
    constructor(name, className, haveItems, expReward, isQuestInProgress, isQuestCompleted, opensLocation){
        super(name, haveItems);
        this.className = className;
        this.expReward = expReward;
        this.isQuestCompleted = isQuestCompleted;
        this.isQuestInProgress = isQuestInProgress;
        this.opensLocation = opensLocation;
    }
}

const trader = new NPC ('Obchodník', false, false);

trader.inventory = [
    broadSword.clone(),
    bastardSword.clone(),
    greatSword.clone(),
    woodenShield.clone(),
    metalShield.clone(),
    leatherArmor.clone(),
    metalArmor.clone(),
]

trader.NPCtype = 'merchant';
trader.money = 5000;

trader.conversation = {
    0: [
        'Nazdo, ponukam len tie najlepsie veci',
        'parada, mozem si nieco kupit? [o]',
        'Koniec [0]',
        ['0', 'o'],
    ],

    o: [
        'Samozrejme, len si prezri čo mám v ponuke:',
        'Koniec [0]',
        ['0', ...NPC.getItemsToBuyCode(trader)]
    ]
}

const villageMayor = new QuestNPC ('Starosta', null, null, null, false, false, null);

villageMayor.conversation = {
    0: [
        'Konečne že si hore. Trasiem s tebou už celú večnosť. Južnú bránu napadli nemŕtvi potrebujem aby si vyrazil do mesta a vyžiadal pomoc od Lorda Andreho, inak nemáme šancu sa ubrániť.',
        'Nemŕtvi? Myslel som, že oni niesu schopní koordinovaného útoku [1]',
        'Prečo mám ísť práve ja? [2]',
        'Ale cesta do mesta vedie predsa južnou cestou, ako sa tam mám dostať keď je pod útokom? [3]',
        'Koniec[0]',
        ['0', '1', '2', '3'],
    ],

    1: [
        'To som si doteraz myslel aj ja, fakt že sa to deje neveští nič dobré. Neviem koľko času nám ostáva',
        'Spať [-1]',
        ['-1'],
    ],

    2: [
        'Všetci vieme že tvoj otec býval veľký dobrodruh. Počul som, že slúžil aj priamo královi Réthorovi kým sa tu usadil. Určite si niečo z jeho schoponstí zdedil aj ty. Si naša najvačšia nádej.',
        'Spať [-1]',
        ['-1'],
    ],

    3: [
        'Do mesta sa dá dostať aj severnou cestou, no cesta je dlhšia vedie cez jaskynný komplex v ktorom nevieme čo sa skrýva. Momentálne nemáme inú možnosť.',
        'Dobre, pôjdem po pomoc [1]',
        'Koniec[0]',
        ['1', '0'],
    ],

    4: [
        'Výborne, vedel som, že sa na teba môžem spolahnúť. Doniesol som ti svoj starý meč - nieje to nič extra, ale aspoň niečo. Ak sa ti podarí dostať do môjho domu,, mal by tam byť aj štít.',
        'Vrátim sa čo najskôr [0]',
        ['0'],
    ]
}

const lee = new QuestNPC ('Lee', 'Bojovník', arenaFightersArmor.clone(), 300, false, false, 'arena');
lee.teach = [
    swingStrike,
    fear,
    vypad,
]

lee.conversation = {
    //different conversation branches, each with its own response possibilities
    0: [
        //first line is what NPC says
        'Hmm akoto že som ťa s tvojou postavou ešte nevidel bojovať v aréne?',
        //other lines are choices of response
        'V aréne? [1]',
        'Potrebujem sa dostať k Lordovi Andre, môžeš mi s tým pomôcť? [2]',
        'Môžeš ma niečo naučiť? [n]',
        'Koniec [0]',
        //last line is aray of possible choices - player cant select other possibility than what is in current branch
        ['0', '1', '2', 'n'],
    ],

    1: [
        'V aréne. Všetci schopní bojovníci zápasia o možnosť pridať sa do našich radov súbojmi v aréne. Ak chceš môžme ťa pred vstupom niečomu priučiť nech nezomrieš príliš rýchlo.',
        'Spať [-1]',
        'Čo ma môžeš naučiť? [n]', 
        ['-1', 'n'],
    ],

    2: [
        'Lord Andre si váži miestnych bojovníkov. Vie, že sa na nás bude môcť v zlých časoch obrátiť a že sme v boji omnoho efektívnejší ako tí jeho nablískaní paladínovia. Stráže ti nebudú stáť v ceste ak budeš jedným z nás, najskôr sa však musíš osvedčiť.',
        'Osvedčiť? [1]',
        'Koniec [0]',
        ['0', '1'],
    ],

    3: [
        'Aktuálnym kandidátom na člena je momentálne Maximus. Najschopnejší chlap aký tu za posledný mesiac bol. Poraz ho v aréne a jeho miesto je tvoje.',
        'Súhlasím [1]',
        'To zni príliš nebezpečne [0]',
        ['0', '1'],
    ],

    4: [
        'Výborne. Vela štastia, budeš ho potrebovať.',
        'koniec [0]',
        ['0'],
    ],

    n: [
        'Možem ťa naučiť následujúce:',
        'Koniec [0]',
        ['0', ...NPC.getAbilitiesLearnCode(lee)],
    ],

};

//conversation after quest has been completed
lee.completedConversation = {
    0: [
        'Aaaa tak si to zvládol a Maxima si zabil. Úprimne nebol som si istý či na to máš. Teraz vidím ako veľmi som sa mýlil.',
        'Pomôžeš mi teraz dostať sa k Lordovi Andremu? [1]',
        'Môžeš ma niečo naučiť? [n]',
        'Koniec [0]',
        ['0', '1', 'n'],
    ],

    1: [
        'Iste, ako som slúbil. Vezmi si túto zbroj bojovníka arény. Len tým najschopnejším sa k nej podarí dostať. Stráže ti nebudú stáť v ceste keď uvidia, že si skúseným bojovníkom arény',
        'Ďikičko [0]',
        ['0'],
    ],

    n: [
        'Možem ťa naučiť následujúce:',
        'Koniec [0]',
        ['0', ...NPC.getAbilitiesLearnCode(lee)],
    ],
};

const glen = new QuestNPC ('Lord Glen', 'Paladin', novicesArmor.clone(), 300, false, false, 'cellar');
glen.teach = [
    flatStrike,
    heal,
    holyStrike, 
]

glen.conversation = {
    0: [
        'Ty niesi jeden z mojich paladínov. V ktorej časti královstva si bol zasvatený?.',
        'Zasvatený? Čo tým myslíš? [1]',
        'Potrebujem sa dostať k Lordovi Andre, môžeš mi s tým pomôcť? [2]',
        'Môžeš ma niečo naučiť? [n]',
        'Koniec [0]',
        ['0', '1', '2', 'n'],
    ],

    1: [
        'Zaújímave. Ešte som nestretol nikoho kto cíti svetlo ale neprešiel paladínskym výcvikom. Ak by si mal záujem môžem ťa niečo priučiť',
        'Spať [-1]',
        'Čo ma môžeš naučiť? [n]', 
        ['-1', 'n'],
    ],

    2: [
        'Iste, Lord Andre je náš veliteľ. akonáhle stráže uvidia že si jedným z miestných paladínov neodvážia sa ti stáť v ceste. Najskôr však musíš splniť jednu formalitku..',
        'O čo sa jedná? [1]',
        'Koniec [0]',
        ['0', '1'], 
    ],

    3: [
        'Pochop, nemôžem rozdávať paladínsku výbavu výbavu hocikomu, aj keď cítim že je v tebe svetlo. Stačí ale splniť inciačný novicovský test a budeš oficiálne královským paladínom. Musíš zničiť zlo usadené v základoch tejto pevnosti.',
        'Súhlasím [1]',
        'Nmám záujem poradím si inak.[0]',
        ['0', '1'],
    ],

    4: [
        'Výborne. Zídi dole týmto schodiskom a znič prízrak, ktorý sa usadil v knižnici. [Sleduješ Glena ako pristupuje ku svietniku na stene. Po chvíli sa otvára tajný priechod do temnoty.]',
        'koniec [0]',
        ['0'],
    ],

    n: [
        'Možem ťa naučiť následujúce:',
        'Koniec [0]',
        ['0', ...NPC.getAbilitiesLearnCode(glen)],
    ],

};

glen.completedConversation = {
    0: [
        'Aaaa tak si to zvládol a Prízrak si zabil. Úprimne hneď ako si sa tu objavil som vedel, že to zvládneš',
        'Pomôžeš mi teraz dostať sa k Lordovi Andremu? [1]',
        'Môžeš ma niečo naučiť? [n]',
        'Koniec [0]',
        ['0', '1', 'n'],
    ],

    1: [
        'Iste, ako som slúbil. Vezmi si túto zbroj paladínskeho novica. Stráže ti nebudú stáť v ceste keď uvidia, že si jedným z nás',
        'Ďikičko [0]',
        ['0'],
    ],

    n: [
        'Možem ťa naučiť následujúce:',
        'Koniec [0]',
        ['0', ...NPC.getAbilitiesLearnCode(glen)],
    ],
};

const pyrokar = new QuestNPC ('Pyrokar', 'Mág', fireMagesRobe.clone(), 300, false, false, 'tortureChamber');

pyrokar.teach = [
    fireball,
    invisibility,
    blueLightnings
]

pyrokar.conversation = {
    0: [
        'Vitaj v našom chráme, dlho som nestretol mága čo nepatrí do našich radov.',
        'Ako vieš, že som mág? [1]',
        'Potrebujem sa dostať k Lordovi Andre, môžeš mi s tým pomôcť? [2]',
        'Môžeš ma niečo naučiť? [n]',
        'Koniec [0]',
        ['0', '1', '2', 'n'],
    ],

    1: [
        'Takže mág no bez tréningu, nezvyčajne... Každý kto ovlád mágiu vycíti jej blízkosť, to by si mal vedieť. Môžem ti s tréningom pomôcť ak by simal záujem',
        'Spať [-1]',
        'Čo ma môžeš naučiť? [n]', 
        ['-1', 'n'],
    ],

    2: [
        'Iste, my mágovia ohňa sme radcami paladínov ku ktorým Lord Andre patrí. Urob pre mňa niečo a dvere k nemu ti budú otvorené',
        'Ako ti môžem pomôcť? [1]',
        'Koniec [0]',
        ['0', '1'],
    ],

    3: [
        'Potrebujem aby si zabil démona z iného sveta - Vydriducha. Dokáže obrátiť silu mágov proti ním samotným, no ty, takmer bez tréningu by si mhol mať proti nemu výhodu, ktorú nebude čakať.',
        'Súhlasím [1]',
        'Démon zabíjajúci mágov? Tak do toho nejdem... [0]',
        ['0', '1'],
    ],

    4: [
        'Výborne. Prejdi týmto portálom, nájsť ho isto nebude obtiažné. Budem očakávať tvoj návrat. [Sleduješ Pyrokara ako predvádza nejaké kúzlo, po ktorom sa zjavil priamo pred tebou temný portál.]',
        'koniec [0]',
        ['0'],
    ],

    n: [
        'Možem ťa naučiť následujúce:',
        'Koniec [0]',
        ['0', ...NPC.getAbilitiesLearnCode(pyrokar)],
    ],

};

pyrokar.completedConversation = {
    0: [
        'Aaaa tak si to zvládol a Vydriducha si zabil. Úprimne nemyslel som, že to zvládneš',
        'Pomôžeš mi teraz dostať sa k Lordovi Andremu? [1]',
        'Môžeš ma niečo naučiť? [n]',
        'Koniec [0]',
        ['0', '1', 'n'],
    ],

    1: [
        'Iste, ako som slúbil. Vezmi si toto rúcho mága ohňa. Stráže ti nebudú stáť v ceste keď uvidia, že si jedným z nás',
        'Ďikičko [0]',
        ['0'],
    ],

    n: [
        'Možem ťa naučiť následujúce:',
        'Koniec [0]',
        ['0', ...NPC.getAbilitiesLearnCode(pyrokar)],
    ],
};

const guard = new QuestNPC ('Strážca', null, null, 300, false, false, 'fort');

guard.conversation = {
    0: [
        'Čo tu chceš? Toto sú priestory Lorda Andreho',
        'Potrebujem ho vidieť, našu dedinu napadli nemŕtvi [1]',
        'Koniec [0]',
        ['0', '1'],
    ],

    1: [
        'Ha nemŕtvi a k tomu organizovaná skupina hej? To vieš komu hovor. Navyše k Lordovi sa múžeš dostať jedine s povolením jednej z miestých frakcií. Bez neho ťa pustit nemôžem.',
        'Ďakujem za ochotu teda.. [1]',
        'Čo je to za frakcie? [2]',
        'Koniec [0]', 
        ['0', '1', '2'],
    ],

    2: [
        'Inak to nejde, bohužial. Vráť sa s povolením, inak ťa nepustím.',
        'spat [-1]',
        'Koniec [0]',
        ['0', '-1'],
    ],

    3: [
        'Všetky nájdeš tu na námestí. Jedná sa o mágov, bojovníkov a paladínov',
        'Omrknem to [0]',
        ['0'],
    ],
}

guard.completedConversation = {
    0: [
        `To si zase ty. Nevedel som, že si jedným z ${playersClass}ov. Mal si to hneď povedať`,
        'Naozaj by ti stačilo moje slovo? [1]',
        'Keby som vedel, povedal by som [2]',
        'Koniec [0]',
        ['0', '1', '2'],
    ],

    1: [
        'Máš pravdu, takto oficiálne je to asi lepšie.',
        'Spať [-1]',
        'Koniec [0]', 
        ['0', '-1'],
    ],

    2: [
        'No to je teraz už jedno, stále potrebuješ ísť za Lordom Andrem?',
        'Nie už som si pomohol inak [1]',
        'Samozrejme [2]',
        'Koniec [0]',
        ['0', '1', '2'],
    ],

    3: [
        'Tak vidíš, asi to nebolo také dôležité',
        'Koniec [0]',
        ['0'],
    ],

    4: [
        'Poď, zavediem ťa za za ním.',
        'Poďme[0]',
        ['0'],
    ],
};

const andre = new QuestNPC ('Lord Andre', null, null, 300, false, false, null);

andre.conversation = {
    0: [
        `Dlho som u nás v meste nevidel nového ${playersClass}a, čo ťa ku mne privádza?`,
        'Na moju rodnú dedinu zaútočili nemŕtvi, potrebujeme tvoju pomoc. [1]',
        'Koniec [0]',
        ['0', '1'],
    ],

    1: [
        'Organizovaní nemŕtvi tak blízko? Počul som, že sa mobilizujú pri ťažobnej kolónii, no ak sú takto blźko je to ešte horšie než som myslel. Vyrazíme okamžite.',
        'Ďakujem [1]', 
        ['1'],
    ],

    2: [
        'Gratulujem, úspešne si zachránil svoju dedinu, týmto táto hra končí.',
        ['0'],
    ],
};

// ============================ INSTANCES MAPS =================================//

class Map {
    static village = {
        house: {
            forward: 'alley',
            back: false,
            left: false,
            right: false,
            description: 'Náhle zobudenia uprostred noci si nikdy nemal rád, až pár sekúund po tom, čo si otvoril oči si si uvedomil že starosta, ktorý stojí nad tebou má znepokojivý výraz. Možno to má niečo spoločné s tým zmatkom čo sa deje vonku.',
            search: 'Si vo svojom dome. Klasické obydlie pracujúcich ľudí. Posteľ, jednoduchý stôl a miesto na oheň. Vedla stolu je položený [Hrdzavý meč], ktorý tu inak nebýva.',
            items: rustySword.clone(),
            NPC: villageMayor,
        },
        alley: {
            forward: 'villageCenter',
            back: 'house',
            left: false,
            right: false,
            description: 'Vybehol si z domu a už jasne počuješ zvuk súboju ktorý sa ozýva všade po dedine',
            search: 'Blatistá ulička medzi domami vedie priame k mestskému námestiu',
            items: false,
        },
        villageCenter: {
            forward: 'mayorsHouse',
            back: 'alley',
            left: 'southGate',
            right: 'northGate',
            description: 'Prišiel si na námestie kam sa začínajú prebojovávať nemŕtvi. Ľudia sa snažia brániť, zatial úspešne, no ako dlho? Jeden z nemŕtvych ťa zahliadol a blíži sa k tebe.',
            descriptionCleared: 'Útočníci ktorí sa prebojovali až na námestie sú porazení. Nateraz. Ľudia ošetrujú zranených a posiluju obranu južnej brány.',
            search: 'Všade kam sa rozhliadneš vidíš ľudí z dediny ako sa márne snažia vzdorovať útoku nemŕtvych. Pred tebou cez námestie je starostov dom, napravo ulička k severnej bráne a nalavo zas k tej južnej.',
            items: false,
            enemy: skeleton.clone(),
            isCleared: false,
        },
        northGate: {
            forward: 'entry',
            back: 'villageCenter',
            left: false,
            right: false,
            description: 'Severná brána, konečne. Cesta pred tebou ťa zavedie priamo k jaskynným komplexom vedúcim k mestu severnou cestou.',
            search: 'Do tejto časti dediny sa zatiaľ nedostali, ktovie ako dlho to takto vydrží...',
            items: false,
            newLocationPath: 'cave',
        },
        mayorsHouse: {
            forward: false,
            back: 'villageCenter',
            left: false,
            right: false,
            description: 'Starostov dom, niekde by tu mal byť ten štít čo o ňom rozprával, ten by sa veru zišiel.',
            search: 'Omnoho krajšie zaiadený než ten tvoj, no to sa dalo čakať. Vedla postele je pohodený [Drevenný štít]',
            items: woodenShield.clone(),
        },
        southGate: {
            forward: false,
            back: 'villageCenter',
            left: false,
            right: false,
            description: 'Južná brána. Starosta vravel, že idú z juhu, ale takto zlé si to nečakal. Ledva si sa stihol zareagovať keď na teba kostrák zaútočil.',
            descriptionCleared: 'Situácia vyzerá stále beznádejne, nemal by si strácať čas.',
            search: 'Južná brána je komplet zabarikádovaná, no aj napriek tomu sa nemŕtvym darí dostať skrz. Jeden z mŕtvych spoluobčanov má na sebe [Koženná zbroj] čo už asi potrebovať nebude.',
            items: leatherArmor.clone(),
            enemy: skeleton.clone(),
            isCleared: false,
        }
    }

    static  cave = {
        entry: {
            forward: 'tunel',
            back: 'northGate',
            left: false,
            right: false,
            oldLocationPath: 'village',
            description: 'Severná cesta ťa po pár hodinách doviedla k vstupu do priechodu. Pred vchodom sa potuloval vlk, ktory sa na teba vrhol.',
            descriptionCleared: 'Vstup do severných jaskýň. Pred ním leží mŕtvola vlka.',
            isCleared: false,
            search: 'Kruhovitý otvor v kamennej stene isto vedie do jaskýň o ktorých vravel starosta.',
            items: false,
            enemy: wolf.clone(),
        },
        tunel: {
            forward: 'entryHall',
            back: false,
            left: false,
            right: false,
            description: 'Nachádzaš sa v dlhej chodbe vytesanej do kameňa, za tebou presvitá slnko dnu kruhovitým otvorom',
            search: 'Chodba je nízka, vyzerá ako vytesaná do kameňa, zvláštne, myslel si, že to majú byť prírodné jaskyne.',
            items: false,
        },
        entryHall: {
            forward: false,
            back: 'tunel',
            left: 'fountain',
            right: 'armory',
            description: 'Vyšiel si z tunelu a nachádzas sa v v nevelkej miestnosti, z ktorej vedu 2 východy.',
            search: 'Miestnosť hranatého tvar, oproti vstupnej chodbe však už vyzerá úplne inak. Obložená opracovaným kameňom s východom napravo aj nalavo',
            items: false,
        },
        armory: {
            forward: 'pass1',
            back: 'entryHall',
            left: false,
            right: false,
            description: 'Nachádzaš sa v zbrojnici, zaskočil ťa velký pavúk ktorý sa k tebe rýchlo približuje a útočí',
            descriptionCleared: 'Zbrojnica s mŕtvym kostrákom na zemi',
            enemy: bigSpider.clone(),
            isCleared: false,
            search: 'Na zemi sú pozostatky po velkom pavúkovi, toto miesto bolo zjavne kedysi zbrojnicou, v pravom zadnom rohu si našiel celkom schopný [Široký meč]. Cesta vedie len dopredu.',
            items: broadSword.clone(),
        },
        pass1:{
            forward: 'false',
            back: 'armory',
            left: false,
            right: false,
            description: 'Prešiel si chodbou vedúcou zo zbrojnice. Na jej konci si našiel masívne kamenné dvere. Je ti jasné, že s nimi nepohneš.',
            search: 'Nevieš presne kto tie dvere otváral a ako, ale v nie je v ludských silách to zvládnuť. Budeš sa musieť vrátiť.',
            items: false,
        },
        fountain: {
            forward: 'pass2',
            back: 'entryHall',
            left: false,
            right: false,
            description: 'Vošiel si do podivnej miestnosti obrastenej machom, v jej strede stojí kruhová fontána. Velký pavúk obývajúci túto miestnosť po tebe vyŠtartoval.',
            description: 'Miestnosť s fontánou a mŕtvym pavúkom',
            search: 'Zaujímalo by ťa na čo tak mohla slúžiť fontána v podzemi, ale teraz je to už jedno. Voda v nej nie e už zjavne veľmi dlhý čas. Východ z miestnosti je pred tebou.',
            enemy: bigSpider.clone(),
            items: false,
        },
        pass2: {
            forward: 'finalRoom',
            back: 'fountain',
            left: false,
            right: false,
            description: 'Pokračuješ chodbou dopredu. Vyzerá, že sa pred tebou začína otvárať do priestoru.',
            search: 'Chodba. Žeby si spred seba začínal cítiť závan čerstvého vzduchu?',
            items: false,
        },
        finalRoom: {
            forward: 'pass3',
            back: 'pass2',
            left: false,
            right: false,
            description: 'Obrovská miestnosť. Na prvý pohlad vidno, že táto je prírodného pôvodu a iná od zvyšku podzemia. Svojím vstupom si upútal pozornosť obrieho pavúka.',
            description: 'Ten pavúk je fakt mŕtvy, nechápeš ako si to zvládol.',
            search: 'Táto miestnosť viac sedí na starostov popis "jaskyňa".',
            enemy: giantSpider.clone(),
            items: false,
        },
        pass3:{
            forward: 'gates',
            back: 'finalRoom',
            left: false,
            right: false,
            newLocationPath: 'city',
            description: 'Ďalšia chodba. Pred sebou však vidíš náznaky denného svetla. Vyzerá to, že si dorazil na koniec tohto komplexu.',
            search: 'Ako si prešiel trochu viac je to isté, pred tebou je východ a cesta do mesta je konečne volná.',
            items: false,
        }
    }
    
    static city = {
        gates: {
            forward: 'backSquare',
            back: 'pass3',
            left: false,
            right: false,
            oldLocationPath: 'cave',
            description: 'Dostal si sa von z jaskyne. Po pár hodinách si našiel cestu ktorá ťa doviedla úspešne až do mesta. Stojíš pred bránami mesta.',
            isCleared: false,
            search: 'V meste si nikdy nebol. Vyzerá byť omnoho vačšie ako si očakával. Ulička od brány by ťa mala zaviesť rovno až na námestie kde sídli aj Lord Andre.',
            items: false,
        },
        backSquare: {
            forward: 'frontSquare',
            back: 'gates',
            left: 'mages',
            right: 'merchant',
            description: 'Od brány si sa dostál na obrovské námestie. Sídlo Lorda Andreho by malo byť úplne až vzadu',
            isCleared: false,
            search: 'Na pravej strane vidíš stánok miestného predajcu zbraní. Nalavo je chrám mágov ohňa a pred tebou rozsiahle námestie.',
            items: false,
        },
        merchant: {
            forward: false,
            back: 'backSquare',
            left: false,
            right: false,
            description: 'Pristúpil si k obchodnikovmu stánku.',
            isCleared: false,
            search: 'Stánok plný nie moc kvalitných zbraní a zbrojí, podaktoré avšak vyzerajú, že by mohli byť účinnejšie než tie tvoje.',
            items: false,
            NPC: trader,
        },
        mages: {
            forward: false,
            back: 'backSquare',
            left: false,
            right: false,
            newLocationPath: 'darkRealm',
            description: 'Vošiel si do chrámu mágov ohňa, miestnosť je kamenistá s prostým drevenným nábytkom. Pred tebou je vyššie postavený mág so zvláštnym výrazom.',
            descriptionCleared: 'Si v budove mágov ohňa, po tom ako si súhlasil so zabitím Vydriducha sa ti zjavil portál, ktorý vedie do jeho ríše',
            isCleared: false,
            search: 'Okrem Pyrokara zazerajúceho na teba odkedy si vošiel tu nie je nič neobvyklé',
            items: false,
            NPC: pyrokar,
        },
        frontSquare: {
            forward: 'fortGate',
            back: 'backSquare',
            left: 'warriors',
            right: 'paladins',
            description: 'Nachádzaš sa v zadnej časti námestia',
            isCleared: false,
            search: 'Nalavo vidíš budovu pred ktorou stoja dvaja namakanci, zrejme patria k miestnym bojovníkom. Nalavo zas stojí mohutná pevnosť a nad jej vchodom znak paladínov. Priamo pred tebou je vstup do záhrad Lorda Andreho, stojí pred ňou však stráž.',
            items: false,
        },
        warriors: {
            forward: false,
            back: 'frontSquare',
            left: false,
            right: false,
            description: 'Pristúpil si bližšie k namakancom, nevieš či boli hrozivejší oni alebo rev ozývajúci sa z arény za nimi.',
            descriptionCleared: 'Si pred arénou, Lee s bratom sa pri pohlade na teba potmehútsky usmievajú',
            isCleared: false,
            search: 'Obaja značne skúsení bojovníci s mohutným svlastvom, jeden vyzbrojený dvoma sekerami a druhý širokým mečom s štítom, obaja muži si sú podobní, možno bratia...',
            NPC: lee,
            newLocationPath: 'arena',
        },
        paladins: {
            forward: false,
            back: 'frontSquare',
            left: false,
            right: false,
            description: 'Vošiel si do pevnosti paladínov, hneď po vstupe ťa jeden z novicov odviedol do pracovne Lorda Glena',
            descriptionCleared: 'Si v pracovne Lorda Glena, tvári sa spokojne, že ťa vidí',
            isCleared: false,
            search: 'Stojíš v širokej miestnosti vybavenej drahým umením a zlatými svietnikmi. Pred tebou je masívny stôl, za ktorým stojí mohutný chlap v plnej pancierovej zbroji s obrovským mečom na chrbte.',
            NPC: glen,
            newLocationPath: 'fortressUnderground',
        },
        fortGate: {
            forward: false,
            back: 'frontSquare',
            left: false,
            right: false,
            newLocationPath: 'city',
            description: 'Pristúpil si k bráne vojaci ťa však nechú pustiť ďalej bez povolenia',
            descriptionCleared: 'Po urputnej ceste si sa konečne dostal k Lordovi Andremu a tvoja dedina sa dočká vytúženej pomoci.',
            isCleared: false,
            search: 'Stráž brány vyzerá že ti má čo povedať',
            items: false,
            NPC: guard,
        },
        fort: {
            forward: false,
            back: 'fortGate',
            left: false,
            right: false,
            description: 'Strážny ťa zaviedol do koncelárie Lorda Andreho. ',
            isCleared: false,
            search: 'Zvládol si to',
            items: false,
            NPC: andre,
        }
    }

    static darkRealm = {
        tortureChamber: {
            forward: false,
            back: 'mages',
            left: false,
            right: false,
            oldLocationPath: 'city',
            description: 'Prešiel si portálom do temnej ríše. Čakal tu nateba démonický Vydriduch, ktorý na teba útočí',
            isCleared: false,
            completsQuestFor: [pyrokar, guard],
            enemy: vydriduch.clone(),
            search: 'Všade kam sa rozhliadneš je len temnota. Prekvapivé..',
            items: false,
        }
    }

    static fortressUnderground = {
        cellar: {
            forward: false,
            back: 'paladins',
            left: false,
            right: false,
            oldLocationPath: 'city',
            description: 'Zišiel si tajným schodiskom do podzemnej knižnice. Prízrak ktorý Lord Glen spomínal na teba okamžite útočí.',
            isCleared: false,
            completsQuestFor: [glen, guard],
            enemy: prizrak.clone(),
            search: 'Obrovská knižnica plná prastarých vedomostí, zlaté svietniky a mŕtvy prízrak. Zvláštny spôsob testovania novicov.',
            items: false,
        }
    }

    static arena = {
        arena: {
            forward: false,
            back: 'warriors',
            left: false,
            right: false,
            oldLocationPath: 'city',
            description: 'Dostal si sa do arény. Vášnivé davy sa rozburácali ešte viac keď na teba zaútočil obrovský protivník..',
            isCleared: false,
            completsQuestFor: [lee, guard],
            enemy: maximus.clone(),
            search: 'Kruhova aréna plná piesku v ktorom sa nepohybuje moc príjemne. Značná plocha je pokrytá krvou mŕtvych bojovníkov',
            items: false,
        }
    }
}

// ============================ SOME MORE CLASSES ============================ // 

class Character {
    constructor(name, charClass){
        this.name = name;
        this.charClass = charClass; 
    }

    details = {        
        xp: 0,
        level: 0,
        inventory: [],
        abilities: [],
        equipped: {
            weapon: {attack: 0, isOneHand: true},
            armor: {deffense: 0},
            shield: {deffense: 0}
        },
        combat: {
            attack: 0,
            deffense: 0
        },
        stats: {
            str: 0,
            dex: 0,
            con: 0,
            int: 0,
            totalStatPoints: 10,
            spentStatPoints: 0,
            statPoints: 0
        },
        vitals: {
            maxHp: 0,
            currentHp: 0,
            maxResources: 0,
            currentResources: 0
        },
        money: 5000,
    }

    isTalking = false;
    talkingTo = {};

    isFighting = false;
    enemy = {};

    reqExp = [0, 250, 500, 800, 1200, 1700, 2500];

    location = Map.village;
    position = Map.village.house;

    static pushMoneyToUI() {
        const goldUI = document.querySelector('.zl-mnozstvo');
        const silverUI = document.querySelector('.st-mnozstvo');
        const copperUI = document.querySelector('.md-mnozstvo');

        goldUI.textContent = Item.caluclateMoney(player.details.money)[0];
        silverUI.textContent = Item.caluclateMoney(player.details.money)[1];
        copperUI.textContent = Item.caluclateMoney(player.details.money)[2];
    }

    levelUp() {
        const uiLevelField = document.querySelector(".level");
        const uiExpField = document.querySelector(".xp");
        let level = 0;

        //check players exp compared to lvl requirement, store level
        player.reqExp.forEach((expForNewLevel, newLevel) => {
            if (player.details.xp >= expForNewLevel) {
                level = newLevel;
            }
        })

        //if exp req is met, level up
        if(player.details.level < level){
            player.details.level = level;
            uiLevelField.textContent = level;
            player.calculateStatPoints();
            player.showStatsBtns();
            TextField.emptyLine();
            TextField.log('Gratulujem, postúpil si na vyššiu úroveň', 'green');
        }

        uiExpField.textContent = `${player.details.xp}/${player.reqExp[level+1]}`;
    }

    calculateStatPoints(){
        player.details.stats.totalStatPoints = player.details.level * 5;
        player.details.stats.statPoints = player.details.stats.totalStatPoints - player.details.stats.spentStatPoints;
    }

    pushBasicsToUi() {
        const charName = document.querySelector(".name");
        const charClass = document.querySelector(".class");

        charName.textContent = this.name;
        charClass.textContent = this.charClass.className;
    }

    updateAttack() {
        const attack = document.querySelector(".att");

        this.details.combat.attack = this.details.equipped.weapon.attack + Math.floor(this.details.stats.str/5);
        attack.textContent = this.details.combat.attack.toString();
    }

    updateDeffense() {
        const deffense = document.querySelector(".def");

        this.details.combat.deffense = this.details.equipped.armor.deffense + this.details.equipped.shield.deffense + Math.floor(this.details.stats.dex/5);
        deffense.textContent = this.details.combat.deffense.toString();
    }

    setMaxHp() {
        const maxHp = document.querySelector(".max-hp");

        this.details.vitals.maxHp = this.charClass.maxHp + this.details.stats.con;
        maxHp.textContent = this.details.vitals.maxHp;
    }

    setCurrentHp(hpValue) {
        const currentHp = document.querySelector(".current-hp");
        const hpBar = document.querySelector(".actual-hp");

        if(hpValue >= 0){
            this.details.vitals.currentHp = hpValue;
            currentHp.textContent = hpValue;
        }else{
            this.details.vitals.currentHp = this.details.vitals.maxHp;
            currentHp.textContent = this.details.vitals.currentHp;
        }

        hpBar.style.width = `${(this.details.vitals.currentHp/this.details.vitals.maxHp)*100}%`;
    }

    setResourcesBar() {
        const description = document.querySelector(".desc-res");
        const backBarColor = document.querySelector(".full-resources");
        const frontBarColor = document.querySelector(".actual-resources");

        if (this.charClass === paladin || this.charClass === mage) {
            description.textContent = "Mana";
            backBarColor.style.backgroundColor = "rgb(43, 127, 236)";
            backBarColor.style.border = "2px solid rgb(31, 102, 255)";
            frontBarColor.style.backgroundColor = "rgb(31, 102, 255)";
        }
    }

    setMaxResources() {
        const maxRes = document.querySelector(".max-res");

        this.details.vitals.maxResources = this.charClass.maxRes + this.details.stats.int;
        maxRes.textContent = this.details.vitals.maxResources;
    }

    setCurrentResources(resValue) {
        const currentRes = document.querySelector(".current-res");
        const resBar = document.querySelector(".actual-resources");

        if(resValue >= 0){
            this.details.vitals.currentResources = resValue;
            currentRes.textContent = resValue;
        }else{
            this.details.vitals.currentResources = this.details.vitals.maxResources;
            currentRes.textContent = this.details.vitals.currentResources;
        }

        resBar.style.width = `${(this.details.vitals.currentResources/this.details.vitals.maxResources)*100}%`;
    }

    setStats() {
        const str = document.querySelector(".str");
        const dex = document.querySelector(".dex");
        const con = document.querySelector(".con");
        const int = document.querySelector(".int");
        const playersStats = this.details.stats;

        playersStats.str = this.charClass.str;
        playersStats.dex = this.charClass.dex;
        playersStats.con = this.charClass.con;
        playersStats.int = this.charClass.int;

        str.textContent = playersStats.str;
        dex.textContent = playersStats.dex;
        con.textContent = playersStats.con;
        int.textContent = playersStats.int;
    }

    distributeStatPoints(stat) {
        const sparePoints = document.querySelectorAll(".pridaj");
        const uiStat = document.querySelector(`.${stat}`);

        this.details.stats[stat]++;
        this.details.stats.statPoints--;
        this.details.stats.spentStatPoints++;

        sparePoints.forEach( btn => {
            btn.textContent = this.details.stats.statPoints
        })

        uiStat.textContent = this.details.stats[stat];

        if(this.details.stats.statPoints === 0){
            sparePoints.forEach(btn => btn.style.display = "none");
        }

        player.updateUi(player.details.vitals.currentHp, player.details.vitals.currentResources);
    }

    showStatsBtns() {
        const sparePoints = document.querySelectorAll(".pridaj");

        sparePoints.forEach( btn => btn.textContent = this.details.stats.statPoints);
        sparePoints.forEach(btn => btn.style.display = "block");
    }

    updateUi(curHp, curRes){
        this.updateAttack();
        this.updateDeffense()
        this.setMaxHp();
        this.setCurrentHp(curHp);
        this.setMaxResources();
        this.setCurrentResources(curRes); 
        Character.pushMoneyToUI(); 
    }

    static combatTurn(){
        const diceRollEnemy = Math.floor(Math.random() * 5) + 1; 
        const enemyDef = player.enemy.def + diceRollEnemy;
        //print correct resources based by char class
        const resources = player.charClass === warrior ? "zúrivosti" : "many";
    
        //only register click on abilities
        if(event.target.parentElement.id){
            //abilities can be used only in fights
            if(!player.isFighting){
                TextField.log("Schopnosti sa môžu používať iba v boji.", "red")
            }else{
                //checks if player has enough resources to use ability, if not return error message
                if(player.details.abilities[event.target.parentElement.id].res > player.details.vitals.currentResources){
                    TextField.emptyLine();
                    TextField.log(`Nemáš dostatok ${resources}`);
                    return;
                }else{
                    const playerAttack = Ability.useAbility();
                     //slovak grammar stuff - its all about hp
                    const hps = playerAttack - enemyDef === 1 ? 'život' : playerAttack - enemyDef < 5 ? 'životy' : 'životov';
                    const magicHps = playerAttack === 1 ? 'život' : playerAttack < 5 ? 'životy' : 'životov';
                    const enemyHps = player.enemy.hp === 1 ? 'život' : player.enemy.hp < 5 ? 'životy' : 'životov';

                    //warrior only check - regenerate rage by basic attacks (id=0)
                    if(player.charClass === warrior && event.target.parentElement.id == 0 && player.details.vitals.currentResources < player.details.vitals.maxResources){
                        player.details.vitals.currentResources ++;
                        player.setCurrentResources(player.details.vitals.currentResources);
                    }
    
                    //calculating attack for physical abilities
                    if(player.details.abilities[event.target.parentElement.id].type === "physical"){
                        if(playerAttack <= enemyDef){
                            TextField.emptyLine();
                            TextField.log(`Zahnal si sa, no ${player.enemy.name}a si netrafil`);
                        }else{
                            player.enemy.hp -= (playerAttack - enemyDef);
                            TextField.emptyLine();
                            TextField.log(`Zaútočil si a zranil ${player.enemy.name}a za ${playerAttack - enemyDef} ${hps}`);
                            TextField.log(`${player.enemy.name}ovi ostáva ${player.enemy.hp} ${enemyHps}`)
                        }
                    //calculating attack for magical abilities
                    }else if (player.details.abilities[event.target.parentElement.id].type === "magical"){
                        player.enemy.hp -= (playerAttack);
                        TextField.emptyLine();
                        TextField.log(`Použil si ${player.details.abilities[event.target.parentElement.id].name} a zranil ${player.enemy.name}a za ${player.details.abilities[event.target.parentElement.id].atk} ${magicHps}`);
                        TextField.log(`${player.enemy.name}ovi ostáva ${player.enemy.hp} ${enemyHps}`);
                    }else{
                        TextField.emptyLine();
                        TextField.log(`Použil si kúzlo: ${player.details.abilities[event.target.parentElement.id].name}`);
                        if(player.details.abilities[event.target.parentElement.id].callback === Ability.invis){
                            console.log(player.details.abilities[event.target.parentElement.id].callback = Ability.invis)
                            return;
                        }
                    }
    
                    //if enemy is dead
                    if(player.enemy.hp <= 0){
                        if(player.position.completsQuestFor){
                            player.position.completsQuestFor.forEach(npc => npc.isQuestCompleted = true);
                        }
                        player.details.xp += player.enemy.xp;
                        player.isFighting = false;
                        TextField.emptyLine();
                        TextField.log(`${player.enemy.name} je mŕtvy, za jeho zabitie získavaš ${player.enemy.xp} skúseností.`, "green")
                        player.enemy = {};
                        player.levelUp();
                        player.position.isCleared = true;
                        return;
                    }
    
                    //at end of turn, if enemy is alive, perform enemy attack
                    Enemy.attack();
                }
            }   
        }
    }
}


class CharClass{
    constructor(className, maxHp, maxRes, maxResDesc, str, dex, con, int){
        this.className = className;
        this.maxHp = maxHp;
        this.maxRes = maxRes;
        this.maxResDesc = maxResDesc;
        this.str = str;
        this.dex = dex;
        this.con = con;
        this.int = int;
    }

    static addClassSpell(){
        if (player.charClass.className === 'Bojovník'){
            swingStrike.addToAbilities();
        }else if(player.charClass.className === 'Mág'){
            blueLightnings.addToAbilities();
        }else{
            heal.addToAbilities();
        }
    }
}


//checks for valid control commands
class CommandLine {
    static playerMovement(){
        const validMovement = ["chod dopredu", "chod naspat", "chod doprava", "chod dolava"];
        if(validMovement.includes(playerInput.value)){
            //cases for all 4 movements types - forward, back, right, left  
            if (playerInput.value === validMovement[0] && player.position.forward){
                //transition to new locations on edge map positions
                if (player.position.newLocationPath){
                    player.location = Map[player.position.newLocationPath];
                }
                player.position = player.location[player.position.forward];
            }else if(playerInput.value === validMovement[1] && player.position.back){
                //transition to old locations on edge map positions
                if (player.position.oldLocationPath){
                    player.location = Map[player.position.oldLocationPath];
                }
                player.position = player.location[player.position.back];
            }else if(playerInput.value === validMovement[2] && player.position.right){
                player.position = player.location[player.position.right];
            }else if(playerInput.value === validMovement[3] && player.position.left){
                player.position = player.location[player.position.left];
            //invalid path
            }else{
                TextField.emptyLine();
                TextField.log('Tade sa ísť nedá');
            }
            
            //prints different text if location has been completed (basicly only after enemy kill)
            const description = player.position.isCleared ? player.position.descriptionCleared : player.position.description;
            TextField.log(description);
        }
    }
    
    static pickUp() {
        if(player.position.items) {
            const itemName = player.position.items.name;
    
            if(playerInput.value.includes("vezmi")){
                if(itemName && playerInput.value.includes(itemName)){
                    player.position.items.addToInventory();
                    TextField.emptyLine();
                    TextField.log(`Zobral si ${itemName}`, 'green');
                }else{
                    TextField.emptyLine();
                    TextField.log('Taký predmet tu nie je');
                }
            }
        }

    }
    
    static search() {
        if(playerInput.value === 'preskumaj'){
            TextField.log(player.position.search)
        }
    }

    static talkTo() {
        if (playerInput.value === 'zacni rozhovor'){
            player.position.NPC.startConversation();
        }
    }

    static conversation() {
        const whichConversation = player.talkingTo.isQuestCompleted ? 'completedConversation' : 'conversation';
        const conversationArrayLocation = player.talkingTo[whichConversation][NPC.conversationBranch].length-1;
        const possibleConversationPaths =  player.talkingTo[whichConversation][NPC.conversationBranch][conversationArrayLocation];

        if(possibleConversationPaths.includes(playerInput.value)){
            if(playerInput.value === '0'){
                player.isTalking = false;
                player.talkingTo = {};
                NPC.prevConversationBranch = 0;
                NPC.conversationBranch = 0;
                TextField.emptyLine();
                TextField.log('Ukončil si rozhovor');
            }else if(playerInput.value === '-1'){
                NPC.conversationBranch = NPC.prevConversationBranch;
                TextField.logConversationBranch(NPC.conversationBranch);
            }else if(NPC.conversationBranch === 'n') {
                Ability.tryToLearnAbility();
            }else if(NPC.conversationBranch === 'o') {
                Item.tryToBuyItem();
            }else{
                if(playerInput.value === 'n') {
                    NPC.conversationBranch = 'n';
                    TextField.logConversationBranch('n');
                    TextField.logAbilitiesToTeach();
                }else if(playerInput.value === 'o'){
                    NPC.conversationBranch = 'o';
                    TextField.logConversationBranch('o');
                    TextField.logItemsToSell();
                }else {
                    NPC.prevConversationBranch = NPC.conversationBranch;
                    NPC.conversationBranch += parseInt(playerInput.value);
                    TextField.logConversationBranch(NPC.conversationBranch);
                }
            }
    
            NPC.openLocation(player.talkingTo.opensLocation);
        }else{
            TextField.emptyLine();
            TextField.log('Takáto možnosť v tomto rozhovore nie je', 'red');
        }
    }

    static meditation(){
        if(playerInput.value === 'relaxuj'){
            if(player.location === Map.city || player.location === Map.village){
                player.setCurrentResources(player.details.vitals.maxResources);
                player.setCurrentHp(player.details.vitals.maxHp);
                TextField.emptyLine();
                TextField.log('Zrelaxoval si si.', 'green');
                TextField.emptyLine();
            }else{
                TextField.emptyLine();
                TextField.log('Relaxovať sa dá iba v mestách.', 'red');
                TextField.emptyLine();
            }
        }
    }

    static mainCommandLineLogic(){
        //on enter keypress
        if (event.keyCode === 13) {
            if(player.isFighting){
                TextField.log('Toto nemôžeš robiť počas boja', 'red');
            }else if(player.isTalking){
                CommandLine.conversation();
            }else if (!player.isTalking && !player.isFighting){
                CommandLine.playerMovement();
                CommandLine.pickUp();
                CommandLine.search();
                CommandLine.talkTo();
                CommandLine.meditation();
                Enemy.checkForEnemy();
            }else{
                TextField.log('Toto nie je platný príkaz', 'red');
            }
            playerInput.value = '';
        }
    }
}


// =============================================== VAR DECLARATIONS AND GAME INITIALIZATION ================================================= //


const warrior = new CharClass ("Bojovník", 100, 10, "Energy", 15, 10, 15, 5);
const paladin = new CharClass ("Paladin", 80, 10, "Mana", 10, 15, 10, 10);
const mage = new CharClass ("Mág", 60, 20, "Mana", 5, 10, 10, 20);

const player = new Character("", paladin);

const addStatBtn = document.querySelectorAll(".pridaj");
const equipItem = document.querySelectorAll(".inventory-ul");
const useAbility = document.querySelectorAll(".abilities-ul");
const playerInput = document.querySelector(".player-input");
const selectClassBtn = document.querySelectorAll(".class-btn");
const nameInput = document.querySelector(".name-input");
const introMenu = document.querySelector(".intro-menu");





// ============================================================ EVENT LISTENERS ================================================================ //

selectClassBtn.forEach(btn => btn.addEventListener("click", event => {
    let selectedClass;

    switch(event.target.id) {
        case 'warrior':
            selectedClass = warrior;
            break;
        case 'paladin':
            selectedClass = paladin;
            break;
        default:
            selectedClass = mage;
      } 

    if(nameInput.value){
        player.name = nameInput.value;
        player.charClass = selectedClass;
        introMenu.style.display = 'none';
        player.pushBasicsToUi();
        player.pushBasicsToUi();
        player.setResourcesBar();
        player.setStats();
        player.updateUi();
        basicAttack.addToAbilities();
        CharClass.addClassSpell();
        nameInput.value = "";
    }else{
        nameInput.placeholder = "musíš zadať meno postavy!";
    }
}))

addStatBtn.forEach( btn => btn.addEventListener("click", (element) => {
    if(player.isFighting){
        TextField.log("Toto nemôžeš robiť počas súboju", "red");
    }else{
        player.distributeStatPoints(element.target.id);
    }
}))

equipItem.forEach(item => item.addEventListener("click", () => {
    //unable to use items in fight
    if(player.isFighting && event.target.classList.contains("fa-check") || player.isFighting && event.target.classList.contains("fa-ban")){
        TextField.log("Toto nemôžeš robiť počas súboju", "red");
    }else{
        if(event.target.classList.contains("fa-check")){
            Item.equipItem();
        }else if(event.target.classList.contains("fa-ban")){
            if(player.talkingTo.NPCtype = 'merchant'){
                Item.sellItem();
                return;
            }

            Item.dropItem();
        }
    }
}))

useAbility.forEach(ability => ability.addEventListener("click", ()=> Character.combatTurn()));

playerInput.addEventListener("focus", () => playerInput.style.borderBottom = "rgb(204, 10, 10) solid 2px");
playerInput.addEventListener("blur", () => playerInput.style.borderBottom = "gray solid 2px");
playerInput.addEventListener("keyup", () => CommandLine.mainCommandLineLogic());

TextField.log(player.position.description);





