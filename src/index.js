import { LitElement, html, css } from "lit";

customElements.define("video-element", class VideoElement extends LitElement {

    static get styles() {
        return css`
            :host {
                pointer-events: none;
            }

            video {
                width: 100%;
                height: 100%;
            }
        `;
    }

    constructor() {
        super();

        this.videoEle = document.createElement("video");
    }

    connectedCallback() {
        super.connectedCallback();

        this.videoEle.src = "./assets/brb_1.mov";
        this.videoEle.muted = true;
        this.videoEle.loop = true;
        this.videoEle.oncanplay = () => {
            this.videoEle.play();
        }
    }

    render() {
        return html`
            ${this.videoEle}
        `;
    }

});

window.addEventListener('contextmenu', e => e.preventDefault());