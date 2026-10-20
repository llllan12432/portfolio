// Executable browser counterpart of showcase/ranking.py and the original SQL formula.
export const halfLives={long:90,medium:21,short:5};
export function score(similarity,emotion,importance,age,kind){
 if(![similarity,emotion,importance,age].every(Number.isFinite)||similarity<0||similarity>1||emotion<0||emotion>1||importance<1||importance>10||age<0||(!(kind in halfLives)&&kind!=='permanent'))throw Error('Invalid scoring inputs');
 const decay=kind==='permanent'?1:Math.exp(-.693*age/halfLives[kind]);
 const parts={semantic:similarity*.25,emotion:emotion*.40,time:decay*.25,importance:importance/10*.10};
 return {score:Object.values(parts).reduce((a,b)=>a+b,0),decay,parts};
}
export function run(fixture,query,days=0){
 if(!Number.isFinite(days)||days<0||days>365||!fixture.queries.some(q=>q.id===query))throw Error('Invalid scenario');
 const permanent=[],eligible=[],excluded=[];
 for(const row of fixture.memories){
  const similarity=row.similarities[query],item={...row,similarity};
  if(row.decay_class==='permanent'){permanent.push(item);continue;}
  if(similarity<=.35){excluded.push(item);continue;}
  eligible.push({...item,...score(similarity,row.emotion_intensity,row.importance,row.age_days+days,row.decay_class)});
 }
 return {permanent,excluded,hybrid:[...eligible].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)),semantic:[...eligible].sort((a,b)=>b.similarity-a.similarity||a.id.localeCompare(b.id))};
}
