export class Helper {

    /**
     * Methode liefert eine Integerzahl, wenn eine Zahl oder Stringzahl vorliegt
     * Ansonsten wird die normale Variable ausgeliefert.
     */
    static parse = x => Number.isNaN(parseInt(x)) ? x : Number.parseInt(x);
}