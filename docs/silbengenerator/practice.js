/** Active practice time: no wall-clock changes, settings time or background time. */
export class PracticeSession {
  constructor(now=()=>performance.now()){this.now=now;this.reset();}
  reset(){this.count=0;this.elapsed=0;this.since=null;this.active=false;this.taskStarted=0;this.recent=[];}
  start(){this.reset();this.active=true;this.resume();}
  resume(){if(this.active&&this.since===null)this.since=this.now();}
  pause(){if(this.since!==null){this.elapsed+=Math.max(0,this.now()-this.since);this.since=null;}}
  stop(){this.pause();this.active=false;}
  activeMilliseconds(){return this.elapsed+(this.since===null?0:Math.max(0,this.now()-this.since));}
  beginTask(){if(this.active)this.taskStarted=this.activeMilliseconds();}
  complete(syllables=1){
    if(!Number.isInteger(syllables)||syllables<1||syllables>5)throw new RangeError('Eine Aufgabe besteht aus einer bis fünf Silben.');
    if(this.active&&this.since!==null){
      const elapsed=this.activeMilliseconds();
      this.count+=syllables;
      this.recent.push({syllables,elapsedMs:Math.max(0,elapsed-this.taskStarted)});
      this.recent=this.recent.slice(-5);
      this.taskStarted=elapsed;
    }
    return this.count;
  }
  snapshot(){
    const elapsed=this.recent.reduce((sum,task)=>sum+task.elapsedMs,0);
    const syllables=this.recent.reduce((sum,task)=>sum+task.syllables,0);
    return {count:this.count,elapsedMs:this.activeMilliseconds(),syllablesPerMinute:elapsed>0?syllables*60000/elapsed:null};
  }
}
export function formatPracticeTime(milliseconds){
  const seconds=Math.floor(Math.max(0,milliseconds)/1000);
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}

export function formatReadingSpeed(syllablesPerMinute){
  return typeof syllablesPerMinute==='number'&&Number.isFinite(syllablesPerMinute)&&syllablesPerMinute>=0
    ? `ca. ${Math.round(syllablesPerMinute).toLocaleString('de-DE')} Silben/min`
    : '— Silben/min';
}
