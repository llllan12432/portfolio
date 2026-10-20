import {run} from './ranking.mjs';
const root=document.querySelector('[data-explorer]');
try{
 const response=await fetch(new URL('./fixtures.json',import.meta.url));if(!response.ok)throw Error('Unable to load synthetic fixtures');const fixture=await response.json();
 const query=root.querySelector('[name=query]'),days=root.querySelector('[name=days]');
 for(const q of fixture.queries){const option=document.createElement('option');option.value=q.id;option.textContent=q.label;query.append(option);}
 const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 function render(){
  const age=Number(days.value),result=run(fixture,query.value,age);root.querySelector('[data-days]').textContent=`${age} days later`;
  for(const type of ['semantic','hybrid']){
   const list=root.querySelector(`[data-list=${type}]`);list.replaceChildren();
   result[type].slice(0,3).forEach((row,i)=>{
    const li=node('li',undefined,'memory-item');li.append(node('span',String(i+1).padStart(2,'0'),'rank'),node('p',row.content));
    li.append(node('span',`${row.decay_class} · ${row.age_days+age} days old`,'memory-meta'));
    if(type==='hybrid'){
     const stack=node('div',undefined,'score-bar');stack.setAttribute('aria-hidden','true');
     for(const [part,value] of Object.entries(row.parts)){const segment=node('i',undefined,part);segment.style.width=`${value*100}%`;stack.append(segment);}
     li.append(stack,node('small',`Score ${row.score.toFixed(3)} = semantic ${row.parts.semantic.toFixed(3)} + emotion ${row.parts.emotion.toFixed(3)} + time ${row.parts.time.toFixed(3)} + importance ${row.parts.importance.toFixed(3)}`,'breakdown'));
    }else li.append(node('small',`Similarity ${row.similarity.toFixed(2)}`,'breakdown'));
    list.append(li);
   });
  }
  const pinned=root.querySelector('[data-pinned]');pinned.textContent=result.permanent.map(x=>x.content).join(' ');
  root.querySelector('[data-excluded]').textContent=`${result.excluded.length} below-threshold memories excluded. Stored records are not deleted when time advances.`;
  root.querySelector('[data-insight]').textContent=query.value==='career'?'Trade-off: the original 40% emotion weight ranks the proud game memory above the more semantically relevant backend preference. This is a limitation, not an accuracy improvement.':age>60?'As time advances, the recency contribution falls. Emotion and importance remain constant in this original formula, so an old emotional memory can still rank highly.':'The old appointment is slightly more similar, but the weighted policy prioritises the upcoming interview. Move time forward to inspect the change.';
 }
 query.addEventListener('change',render);days.addEventListener('input',render);root.querySelector('[data-reset]').addEventListener('click',()=>{query.value='interview';days.value=0;render();});render();
}catch(error){root.querySelector('[data-insight]').textContent='The interactive demo could not load. The source download includes a local Python demo and tests.';console.error(error);}
