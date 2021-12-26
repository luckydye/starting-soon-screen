import { LitElement, html, css } from "lit";

// TODO: Make a file selection overlay on mouse over

function deserialize(lines, startKeyframesIndicator, endKeyframesIndicator) {
    let seq = false;

    const deserialized = [];

    for(let line of lines) {
        if(line == "") {
            continue;
        }

        if (line == startKeyframesIndicator) {
            seq = true;
        }
        if (line == endKeyframesIndicator) {
            seq = false;
        }

        if(seq) {
            const parts = line.split("\t");
            let i = 0;
            for(let part of parts) {
                if(!deserialized[i]) deserialized[i] = [];
                deserialized[i].push(part);
                i++;
            }
        }
    }

    return {
        "frame": deserialized[1].slice(1).map(d => +d),
        "x": deserialized[2].slice(1).map(d => +d),
        "y": deserialized[3].slice(1).map(d => +d),
    }
}

function getKeyValue(lines, key) {
    for(let line of lines) {
        if(line.match(key)) {
            return line.split("\t")[2];
        }
    }
}

async function getKeyframes() {
    const raw_data = await fetch(`../assets/${window.movieFiles[0]}.keyframes.txt`).then(res => {
        if(res.status !== 200) {
            throw new Error("Failed to fetch keyframe data.");
        }
        return res.text();
    });
    const lines = raw_data.split(/\n|\r/g);

    const startKeyframesIndicator = "	Frame	X pixels	Y pixels	";
    const endKeyframesIndicator = "End of Keyframe Data";

    const data = deserialize(lines, startKeyframesIndicator, endKeyframesIndicator);

    data.fps = +getKeyValue(lines, "Units Per Second");
    data.source_width = +getKeyValue(lines, "Source Width");
    data.source_height = +getKeyValue(lines, "Source Height");
    data.length = data.frame.length;

    return data;
}

window.addEventListener("DOMContentLoaded", async e => {
    const keyframes = await getKeyframes();
    console.log(keyframes);
    console.log('loaded');

    const iframe = document.querySelector("iframe");
    const video = document.querySelector("video-element").videoEle;

    pin(iframe, keyframes, [-570, -418], video, 1);
});

function pin(target, keyframes, offset = [0, 0], sync, scale = 1) {

    let lastFrame = 0;
    let acc = 0;
    let frame = 0;

    const fps = keyframes.fps;

    const loop = (ms = 0) => {

        const delta = ms - lastFrame;
        acc += delta;

        if(acc >= 1000 / fps) {
            frame++;
            acc = 0;

            if(frame > keyframes.length) {
                frame = 0;
            }

            frame = Math.round(sync.currentTime * fps);

            const x = keyframes.x[frame] + offset[0];
            const y = keyframes.y[frame] + offset[1];

            target.style.transform = `translateZ(0) translate(${x * scale}px, ${y * scale}px)`;
        }

        lastFrame = ms;
        setTimeout(() => loop(Date.now()), 1000 / 12);
    };

    loop();
}

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

        this.videoEle.src = window.movieFiles[0] + ".webm";
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