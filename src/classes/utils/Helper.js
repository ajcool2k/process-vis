export class Helper {

    /**
     * Methode liefert eine Integerzahl, wenn eine Zahl oder Stringzahl vorliegt
     * Ansonsten wird die normale Variable ausgeliefert.
     */
    static parse = x => Number.isNaN(parseInt(x)) ? x : Number.parseInt(x);

    /**
     * Methode liefert eine neue Id.
     * Es werden alle Objekte nach dem Attribute id durchsucht und die höchste Id um eins inkrementiert.
     */
    static nextId = x => {

        if (!x || typeof x !== 'object' || (x.length > 1 && !x[0].hasOwnProperty("id")) ) {
            console.warn("Helper: expected Array of Objects with Attribute id")
            return
        }

        let highestId = 0;
        x.forEach(elem => {
          highestId = Math.max(elem.id, highestId);   
        });

        highestId++;
        return highestId;
    }
}