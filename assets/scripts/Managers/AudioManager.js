import AudioTypes from 'AudioTypes';
import GameEvent from 'GameEvent';

const AudioHelper = cc.Class({
    name: 'AudioHelper',

    properties: {
        type: { default: AudioTypes.None, type: AudioTypes },
        audioClip: { default: null, type: cc.AudioClip },
        volume: { default: 1, type: cc.Float }
    }
})

cc.Class({
    extends: cc.Component,

    properties: {
        audio: { default: [], type: AudioHelper },
        mainAudio: { default: null, type: cc.AudioClip },
        volumeMain: { default: 1, type: cc.Float },

        _currentMainAudio: { default: null, serializable: false }
    },

    onEnable() {
        this._handleSubscription(true);

        this._playMainAudio();
    },

    onDisable() {
        this._handleSubscription(false);
    },

    _playMainAudio() {
        if (this.mainAudio) {
            this._currentMainAudio = cc.audioEngine.play(this.mainAudio, true, this.volumeMain);
        }
    },

    _handleSubscription(isOn) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.PLAY_AUDIO, this.onPlayAudio, this);
    },

    onPlayAudio(type) {
        const currentAudio = this.audio.find(audio => audio.type === type);

        if (currentAudio) {
            this._currentMainAudio = cc.audioEngine.play(currentAudio.audioClip, false, currentAudio.volume);
        }
    }
});
