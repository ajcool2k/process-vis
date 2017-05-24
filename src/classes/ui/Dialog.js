export class Dialog {

    static removeEdgeDialog = {
        ref: "removeEdgeDialog", 
        title: 'Aktion', 
        ok: 'Ja', 
        cancel: 'Nein', 
        contentHtml: 'Soll die Verbindung entfernt werden?', 
        value: ''
    };

    static showNodeDialog = { 
        ref: "showNodeDialog",
        content: 'content', 
        ok: 'Ausblenden' 
    };

    static setNodeDialog(p) { 
        Dialog.showNodeDialog.content =
        `
            <md-card>
            <md-card-media>
                <img src="https://image.flaticon.com/icons/svg/364/364172.svg" alt="processImage">
            </md-card-media>

            <md-card-header>
                <div class="md-title">Prozess</div>
                <div class="md-subhead">Inhalt</div>
            </md-card-header>

            <md-card-content>
                id: ${p.id} <br>
                name: ${p.id}
            </md-card-content>
            </md-card>
        `;
    };

    static useAll() {
        return {
            removeEdgeDialog: Dialog.removeEdgeDialog,
            showNodeDialog: Dialog.showNodeDialog,
        }
    };


}