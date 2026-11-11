/** Apply the original school-font TFM context rules, retaining each letter's syllable. */
function shape(text, syllables, font) {
  const owners=syllables.flatMap((s,i)=>[...s].map(()=>i));
  const nodes=[{code:45,sentinel:true},...[...text].map((character,index)=>({code:font.native.cmap[character],character,index,last:index,syllable:owners[index]})),{code:32,sentinel:true}];
  if(nodes.some(n=>n.code===undefined))throw new Error('Missing school handwriting character.');
  for(let i=0,edits=0;i<nodes.length-1;) {
    const left=nodes[i],right=nodes[i+1],rule=font.native.ligatures[left.code]?.[right.code];
    if(!rule){i++;continue;}
    const [operation,code]=rule;
    // A merged letter form must never swallow a color boundary between syllables.
    if(operation==='LIG'&&!left.sentinel&&!right.sentinel&&left.syllable!==right.syllable){i++;continue;}
    if(++edits>10000)throw new Error('Invalid school-font context rule.');
    if(operation==='/LIG/')nodes.splice(i+1,0,{code,helper:true,character:'',index:left.index,last:left.last,syllable:left.sentinel?right.syllable:left.syllable,initial:!!left.sentinel});
    else if(operation==='/LIG')nodes[i+1]={...right,code};
    else if(operation==='LIG/')nodes[i]={...left,code};
    else if(operation==='LIG')nodes.splice(i,2,{...left,code,character:(left.character||'')+(right.character||''),last:right.last});
    else throw new Error('Unsupported school-font context rule.');
    i=Math.max(0,i-1);
  }
  return nodes.filter(n=>!n.sentinel);
}
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function afterDistance(points,amount){
  for(let i=1;i<points.length;i++){
    const segment=distance(points[i-1],points[i]);
    if(amount<=segment){const t=segment?amount/segment:0;return [[points[i-1][0]+(points[i][0]-points[i-1][0])*t,points[i-1][1]+(points[i][1]-points[i-1][1])*t],...points.slice(i)];}
    amount-=segment;
  }
  return [];
}
function ribbon(points,x,halfWidth=12){
  if(points.length<2)return '';
  const sides=[[],[]];
  for(let i=0;i<points.length;i++){
    const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
    const length=distance(before,after)||1,dx=(after[0]-before[0])/length,dy=(after[1]-before[1])/length;
    for(let side=0;side<2;side++){
      const width=side?-halfWidth:halfWidth;sides[side].push([points[i][0]-x-dy*width,points[i][1]+dx*width]);
    }
  }
  return [...sides[0],...sides[1].reverse()].map((p,i)=>(i?'L':'M')+p.map(v=>Number(v.toFixed(3))).join(' ')).join('')+'Z';
}
function normalized(v){const length=Math.hypot(...v)||1;return v.map(x=>x/length);}
function curvedBridge(start,end,startTangent,endTangent){
  const a=normalized(startTangent),b=normalized(endTangent),handle=distance(start,end)/3;
  const controls=[start,[start[0]+a[0]*handle,start[1]+a[1]*handle],[end[0]-b[0]*handle,end[1]-b[1]*handle],end];
  return Array.from({length:129},(_,i)=>{const t=i/128,u=1-t;return [0,1].map(k=>u*u*u*controls[0][k]+3*u*u*t*controls[1][k]+3*u*t*t*controls[2][k]+t*t*t*controls[3][k]);});
}
export function layoutNativeChain(chain,font,alternateColors){
  const colorFor=s=>alternateColors&&s%2?'var(--syllable-alt)':'var(--ink)';
  const nodes=shape(chain.text,chain.syllables,font);
  let x=0,previous=null,firstBody=true;
  let glyphs=nodes.map(node=>{
    x+=font.native.kerning[previous]?.[node.code]||0;
    const native=font.native.codes[node.code],medial=!node.helper&&!firstBody&&native.medialName;
    const name=medial||native.name,outline=font.glyphs[name];
    const glyph={...node,name,path:outline.path,advance:outline.advance,bounds:outline.bounds,x,color:colorFor(node.syllable),connection:null,
      anchors:medial?native.medialAnchors:native.anchors};
    if(!node.helper)firstBody=false;
    x+=outline.advance;previous=node.code;return glyph;
  });
  const bridges=new Map();
  for(let index=0;index<glyphs.length;index++){
    const target=glyphs[index];if(!target.path||!target.anchors)continue;
    let prior=index-1;while(prior>=0&&!glyphs[prior].path)prior--;
    if(prior<0)continue;
    const source=glyphs[prior];if(!source.anchors)continue;
    const upper=source.character&&source.character===source.character.toUpperCase();
    const from=upper||source.character==='ß'?source.anchors.capitalEnd:source.anchors.end;
    const start=[from.point[0]+source.x,from.point[1]];
    let entry=target.anchors.entry;
    if(target.anchors.ovalEntries.length)entry=target.anchors.ovalEntries.reduce((best,candidate)=>distance(start,[candidate.point[0]+target.x,candidate.point[1]])<distance(start,[best.point[0]+target.x,best.point[1]])?candidate:best);
    let shift=Math.max(0,start[0]+15-(target.x+entry.point[0]));
    if(!target.helper&&/[ijäöü]/.test(target.character)){
      let priorBody=index-1;while(priorBody>=0&&glyphs[priorBody].helper)priorBody--;
      const capital=glyphs[priorBody];
      if(capital?.character&&capital.character===capital.character.toUpperCase()){
        shift=Math.max(shift,capital.x+capital.bounds[2]+20-(target.x+target.bounds[0]));
      }
    }
    const startDirection=normalized(from.tangent),endDirection=normalized(entry.tangent);
    if(target.anchors.ovalEntries.length){
      for(let attempt=0;attempt<200;attempt++){
        const end=[target.x+shift+entry.point[0],entry.point[1]],handle=distance(start,end)/3;
        const control=[start[0]+startDirection[0]*handle,start[1]+startDirection[1]*handle];
        const outside=p=>(p[0]-end[0])*-endDirection[1]+(p[1]-end[1])*endDirection[0];
        if(outside(start)>=0&&outside(control)>=0)break;
        shift+=10;
      }
    }
    if(shift)for(let j=index;j<glyphs.length;j++)glyphs[j].x+=shift;
    const end=[target.x+entry.point[0],entry.point[1]];
    const points=curvedBridge(start,end,from.tangent,entry.tangent);
    bridges.set(prior,{name:'native-bridge',character:'',helper:true,synthetic:true,syllable:source.syllable,
      path:ribbon(points,0,10.4),points,x:0,advance:0,bounds:[Math.min(...points.map(p=>p[0]))-11,Math.min(...points.map(p=>p[1]))-11,Math.max(...points.map(p=>p[0]))+11,Math.max(...points.map(p=>p[1]))+11],color:colorFor(source.syllable),connection:null});
  }
  glyphs=glyphs.flatMap((glyph,i)=>[glyph,...(bridges.has(i)?[bridges.get(i)]:[])]);
  for(let i=0;i<glyphs.length;i++){
    const glyph=glyphs[i];if(glyph.helper)continue;
    let next=i+1;while(next<glyphs.length&&glyphs[next].helper)next++;
    if(next>=glyphs.length)continue;
    const pieces=[];
    for(let j=i;j<next;j++){
      const g=glyphs[j],native=font.native.codes[g.code];
      const source=g.synthetic?g.points:(g.helper?native.helper:native.exit);
      if(source.length<2)continue;
      const points=source.map(p=>[p[0]+g.x,p[1]]),length=points.slice(1).reduce((sum,p,k)=>sum+distance(p,points[k]),0);
      pieces.push({glyph:g,points,length});
    }
    const total=pieces.reduce((sum,p)=>sum+p.length,0);let remaining=total/2;
    for(const piece of pieces){
      if(remaining>=piece.length){remaining-=piece.length;continue;}
      const tail=afterDistance(piece.points,Math.max(0,remaining));remaining=0;
      piece.glyph.connection={secondPath:ribbon(tail,piece.glyph.x),clipToOwnContour:true,
        character:glyphs[next].character,syllable:glyphs[next].syllable,color:colorFor(glyphs[next].syllable),fraction:.5,length:total};
    }
  }
  let left=0,right=0,top=825,bottom=-350;
  for(const g of glyphs){left=Math.min(left,g.x+g.bounds[0]);right=Math.max(right,g.x+g.bounds[2]);top=Math.max(top,g.bounds[3]+20);bottom=Math.min(bottom,g.bounds[1]-20);}
  left-=20;right+=20;
  return {glyphs,left,width:right-left,height:Math.max(1200,top-bottom),top,unitsPerEm:1000,guides:font.guides,native:true};
}
