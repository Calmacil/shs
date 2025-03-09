
//
const askForStrategy = "!{{template:default}}"
    + "{{strategy=![[?{Stratégie ?|Combat rapproché (faire face), 0|Combat rapproché (fuite), 1|Distance, 2}]]}}"

const askForMeleeMod = "!{{template:default}}"
    + "{{surpriseMod=![[?{Adversaire surpris ?|Non, 0|Oui, 2}]]}}"
    + "{{lethalAtk=![[?{Attaque expéditive ?|Non, 0|Oui, -2}]]}}"

const askForDistMod = "!{{template:default}}"
    + "{{aimedMod=![[?{Tir ajusté au tour précédent ?|Non, 0|Oui, 2}]]}}"
    + "{{lethalAtk=![[?{Attaque expéditive ?|Non, 0|Oui, -2}]]}}"

const distanceUnnarmed = "&{template:goldorak} {{roll=[[0]]}}"

const attackVars = "{{surprise=[[0]]}}{{lethal=[[0]]}}{{aimed=[[0]]}}"

/**
 * Returns a range modifier for long range attacks
 *
 * @param {string} char A string representing a range
 * @returns The range modifier
 */
const rangeMod = char => {
    switch(char.trim()) {
        case 'C':
        case 'P':
            return 1
        case 'M':
            return 0
        case 'L':
            return -1
        default:
            return 0
    }
}

/**
 * Performs the pre-roll for melee attacks
 *
 * @returns Pre roll data
 */
const preMelee = async () => {
    let roll = await startRoll(askForMeleeMod)
    let lethalMod = parseInt(roll.results.lethalAtk.result)||0
    let surpriseMod = parseInt(roll.results.surpriseMod.result)
    let response = {
        specificMod: lethalMod + surpriseMod,
        conditions: {
            lethal: lethalMod&&1,
            surprise: surpriseMod&&1
        }
    }

    return response
}

/**
 * Performs the pre-roll for long range attacks
 *
 * @returns Pre roll data
 */
const preDistance = async () => {
    let roll = await startRoll(askForDistMod)
    let lethalMod = parseInt(roll.results.lethalAtk.result)||0
    let aimedMod = parseInt(roll.results.aimedMod.result)||0
    let response = {
        specificMod: lethalMod + aimedMod,
        conditions: {
            lethal: lethalMod&&1,
            aimed: aimedMod&&1
        }
    }

    return response
}

const attackRoll = async (strategy, wpnName, isExpert, range, impact, isArmed) => {
    // Case strategy 0 Aggressive
    attr = 'carrure'
    sublabel = 'Combat rapproché (Carrure)'

    let preRoll = {};
    if (strategy === 2) {
        attr = 'sangfroid'
        sublabel = 'Combat à distance (Sang-froid)'
        preRoll = await preDistance()
    } else {
        preRoll = await preMelee()
        if (strategy === 1) {
            attr = 'motricite'
            sublabel = 'Combat rapproché (Motricité - Fuite)'
        }
    }

    attributeRoll(attr, (isExpert === 1), wpnName, preRoll.specificMod + isArmed, 'attack', sublabel, preRoll.conditions)
}

on('clicked:unnarmed-attack', async ev => {
    let strategyroll = await startRoll(askForStrategy)
    let strategy = parseInt(strategyroll.results.strategy.result)||0

    if (strategy === 2) {
        let oops = await startRoll(distanceUnnarmed)
        finishRoll(oops.rollId)
    } else {
        getAttrs(['unnarmed-exp'], (v) => {
            console.log(v)
            let wpName = 'Mains nues'
            let isExpert = parseInt(v['unnamred-exp'])||0
            let range = 'C'
            let impact = 0
            let isArmed = 0

            attackRoll(strategy, wpName, isExpert, range, impact, isArmed)
        })
    }
})

on('clicked:repeating_weapons:attack', async ev => {
    strategyroll = await startRoll(askForStrategy)
    let strategy = parseInt(strategyroll.results.strategy.result)||0

    let toGet = ['name', 'impact', 'range', 'exp'].map(a => 'repeating_weapons_' + a)
    console.error(toGet)
    getAttrs(toGet, v => {
        console.log(v)
        let wpName = v.repeating_weapons_name
        let isExpert = parseInt(v.repeating_weapons_exp)||0
        let range = v.repeating_weapons_range
        let impact = parseInt(v.repeating_weapons_impact)||0
        let isArmed = 1

        attackRoll(strategy, wpName, isExpert, range, impact, isArmed)
    })
})