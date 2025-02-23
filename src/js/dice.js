
const baseRoll = "&{template:_TPL_} {{roll=[[3d_D_>_DIFF_]]}} {{mod=[[_MOD_dF]]}} {{label=_LABEL_}} {{totalSuccesses=[[0]]}} {{trueMod=[[0]]}} {{sides=[[0]]}}"
const askForMod = "!{{template:default}}{{ask=![[?{Bonus / Malus ?|0}]]}}"
const diceLetters = '0abcdefghij'
const fateLetters = '−0+'
const dicify = dice => dice.map(x => diceLetters[x])
const fatify = dice => dice.map(x => fateLetters[1+x])

var attributeRoll = async (attrName, isExpert=false, label='', specificMod=0, template='simple', sublabel='') => {
    let customMod = await startRoll(askForMod)

    getAttrs([attrName, 'woundsMalus'], async v => {
        let attrVal = parseInt(v[attrName])||8
        let woundsMod = Math.abs(parseInt(v.woundsMalus)||0)
        let totalMod = specificMod + customMod.results.ask.result - woundsMod
        let modIsMalus = (totalMod < 0)
        let sides = isExpert ? 10 : 8

        let rollString = baseRoll.replace('_TPL_', template)
            .replace('_D_', sides)
            .replace('_DIFF_', attrVal)
            .replace('_MOD_', Math.min(Math.abs(totalMod), 5))
            .replace('_LABEL_', label)

        let roll = await startRoll(rollString)

        // Compute mod dice result
        let modSuccesses = 0;
        roll.results.mod.dice.forEach(die => {
            if (modIsMalus && die < 0) {
                modSuccesses--;
            } else if (!modIsMalus && die > 0) {
                modSuccesses++
            }
        })
        console.log(roll)

        let successes = roll.results.roll.result + modSuccesses
        allDice = dicify(roll.results.roll.dice)
        console.log(roll.results.roll.dice)

        finishRoll(roll.rollId, {
            totalSuccesses: successes,
            trueMod: modSuccesses,
            roll: dicify(roll.results.roll.dice).join(' '),
            mod: fatify(roll.results.mod.dice).join(' '),
            sides: sides,
            label: sublabel
        })
    })
}