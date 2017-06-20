export class Dialog {
  constructor () {
    this.removeEdgeDialog = {
      ref: 'removeEdgeDialog',
      title: 'Aktion',
      ok: 'Ja',
      cancel: 'Nein',
      contentHtml: 'Soll die Verbindung entfernt werden?',
      value: ''
    }

    this.showNodeDialog = {
      ref: 'showNodeDialog',
      content: 'content',
      ok: 'Ausblenden'
    }

    this.showActorDialog = {
      ref: 'showActorDialog',
      content: 'content',
      ok: 'Ausblenden'
    }
  }

  setNodeDialog (p) {
    this.showNodeDialog.content =
    `
    <md-card>
        <md-card-media>
            <img src='https://image.flaticon.com/icons/svg/364/364172.svg' alt='processImage'>
        </md-card-media>

        <md-card-header>
            <div class='md-title'>Prozess</div>
            <div class='md-subhead'>Inhalt</div>
        </md-card-header>

        <md-card-content>
            id: ${p.id} <br>
            name: ${p.id}
        </md-card-content>
    </md-card>
    `
  }

  setActorDialog (a) {
    this.showActorDialog.content =
    `
    <md-card>
        <md-card-media>
            <img src='https://image.flaticon.com/icons/svg/364/364172.svg' alt='ActorInfo'>
        </md-card-media>

        <md-card-header>
            <div class='md-title'>Actor</div>
            <div class='md-subhead'>Inhalt</div>
        </md-card-header>

        <md-card-content>
            id: ${a.id} <br>
            name: ${a.name}
        </md-card-content>
    </md-card>
    `
  }
}
