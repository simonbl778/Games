/** A short, gentle major chord. Synthesized locally, including in the offline APK. */
export class RewardAudio {
  constructor(scope=globalThis){this.scope=scope;this.context=null;this.enabled=true;this.voices=new Set();this.sequence=0;}
  unlock(){
    if(!this.enabled)return;
    try{
      const AudioContext=this.scope.AudioContext||this.scope.webkitAudioContext;
      if(!AudioContext)return;
      this.context ||= new AudioContext();
      if(this.context.state==='suspended')return this.context.resume().catch(()=>{});
    }catch{/* Reading remains available when sound is unavailable. */}
  }
  stop(){this.sequence++;for(const voice of this.voices){try{voice.stop();}catch{/* Already ended. */}}this.voices.clear();}
  play(){
    if(!this.enabled)return;
    const sequence=this.sequence,ready=this.unlock();
    if(ready?.then){void ready.then(()=>{if(sequence===this.sequence)this.chime();});return;}
    this.chime();
  }
  chime(){
    if(!this.enabled||this.scope.document?.hidden||!this.context||this.context.state!=='running')return;
    this.stop();
    const start=this.context.currentTime+.01;
    for(const [frequency,offset] of [[523.25,0],[659.25,.055],[783.99,.11]]){
      const voice=this.context.createOscillator(),gain=this.context.createGain();
      voice.type='sine';voice.frequency.setValueAtTime(frequency,start+offset);
      gain.gain.setValueAtTime(0,start+offset);
      gain.gain.linearRampToValueAtTime(.075,start+offset+.012);
      gain.gain.exponentialRampToValueAtTime(.0001,start+offset+.32);
      voice.connect(gain);gain.connect(this.context.destination);
      voice.onended=()=>{this.voices.delete(voice);voice.disconnect();gain.disconnect();};
      this.voices.add(voice);voice.start(start+offset);voice.stop(start+offset+.34);
    }
  }
}
