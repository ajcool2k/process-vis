export class TouchSupport {

    static hasSupport() {
        return ('ontouchstart' in window);
    }

    static init() {

        // disable long press context menu
        window.oncontextmenu = function(event) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        };    
    }
}
