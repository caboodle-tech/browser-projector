class BrowserProjectorClass {

    #devices = {
        audio: [],
        video: []
    };

    #stream;

    constructor() {
    // Enforce singleton class.
        if (window.BrowserProjector
            && window.BrowserProjector.constructor.name.includes('BrowserProjector')) {
            // eslint-disable-next-line no-constructor-return
            return window.BrowserProjector;
        }
        window.BrowserProjector = this;
        this.#initialize();
    }

    async #attachListeners() {
        const btn = document.getElementById('bp-choose-selections');
        btn.addEventListener('click', this.#powerOn);
    }

    async #initialize() {
        try {
            // Ask/check for permission to access webcams and microphones.
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            // Release (turn off) any connections to default devices.
            await this.#powerOff(stream);
            // We have to receive permission before we can check for devices.
            await this.#updateDevices();
            await this.#updateSelectors();
            await this.#attachListeners();
        } catch (err) {
            // Permission denied.
        }
    }

    async #powerOn(evt) {
    // TODO: Dynamically build obj.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        document.getElementById('bp-stream').srcObject = stream;
    }

    async #powerOff(stream) {
        if (!stream) {
            if (!this.#stream) {
                return;
            }
            stream = this.#stream;
        }
        stream.getTracks().forEach((track) => {
            track.stop();
        });
        stream = null;
        this.#stream = null;
    }

    async #updateDevices() {
        await navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                this.#devices.audio = [];
                this.#devices.video = [];
                devices.forEach((device) => {
                    if (device.deviceId === 'default') {
                        return;
                    }
                    if (device.kind === 'audioinput') {
                        this.#devices.audio.push(device);
                    } else if (device.kind === 'videoinput') {
                        this.#devices.video.push(device);
                    }
                });
            });
    }

    async #updateSelectors() {
    // Update the list of possible audio inputs (microphones).
        let audioOptions = '<option value="">Disabled</option>';
        this.#devices.audio.forEach((opt) => {
            audioOptions += `<option value="${opt.deviceId}">${opt.label}</option>`;
        });
        document.getElementById('bp-audio-selector').innerHTML = audioOptions;
        // Update the list of possible audio inputs (microphones).
        let videoOptions = '';
        this.#devices.video.forEach((opt) => {
            videoOptions += `<option value="${opt.deviceId}">${opt.label}</option>`;
        });
        document.getElementById('bp-video-selector').innerHTML = videoOptions;
    }

}

const BrowserProjector = new BrowserProjectorClass();
