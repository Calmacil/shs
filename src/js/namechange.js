/**
 * Says «hello» and then changes character's name
 * @param {event} ev 
 */
var editCharName = (ev) => {
    console.log('ohayou sekai !')
    getAttrs(['charname', 'player'], v => {
        let display = v.player + ' - ' + v.charname;
        setAttrs({
            character_name: display
        })
    })
}

on('change:charname change:player', ev => {
    editCharName(ev)
})