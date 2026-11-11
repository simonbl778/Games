/** Active practice time: no wall-clock changes, settings time or background time. */
export class PracticeSession {
  constructor(now=()=>performance.now()){this.now=now;this.reset();}
  reset(){this.count=0;this.elapsed=0;this.since=null;this.active=false;}
  start(){this.reset();this.active=true;this.resume();}
  resume(){if(this.active&&this.since===null)this.since=this.now();}
  pause(){if(this.since!==null){this.elapsed+=Math.max(0,this.now()-this.since);this.since=null;}}
  stop(){this.pause();this.active=false;}
  complete(){if(this.active&&this.since!==null)this.count+=1;return this.count;}
  snapshot(){return {count:this.count,elapsedMs:this.elapsed+(this.since===null?0:Math.max(0,this.now()-this.since))};}
}
export function formatPracticeTime(milliseconds){
  const seconds=Math.floor(Math.max(0,milliseconds)/1000);
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}
