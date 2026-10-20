"""Reference for the original SQL formula; this is not a semantic-search benchmark."""
import json
import math
from pathlib import Path
HALF_LIVES={'long':90,'medium':21,'short':5}
def score(similarity,emotion,importance,age_days,decay_class):
    values=(similarity,emotion,importance,age_days)
    if not all(isinstance(v,(float,int)) and math.isfinite(v) for v in values):
        raise ValueError('Inputs must be finite numbers')
    if not 0<=similarity<=1 or not 0<=emotion<=1 or not 1<=importance<=10 or age_days<0:
        raise ValueError('Input outside supported range')
    if decay_class not in HALF_LIVES and decay_class!='permanent':
        raise ValueError('Unknown decay class')
    decay=1.0 if decay_class=='permanent' else math.exp(-0.693*age_days/HALF_LIVES[decay_class])
    parts={'semantic':similarity*.25,'emotion':emotion*.40,'time':decay*.25,'importance':importance/10*.10}
    return {'score':sum(parts.values()),'decay':decay,'parts':parts}
def run_scenario(scenario='interview',days=0):
    if not isinstance(days,(int,float)) or not math.isfinite(days) or not 0<=days<=365:
        raise ValueError('Days must be between 0 and 365')
    fixture=json.loads((Path(__file__).resolve().parent.parent/'demo/fixtures.json').read_text())
    if scenario not in {q['id'] for q in fixture['queries']}:raise ValueError('Unknown scenario')
    eligible=[];permanent=[];excluded=[]
    for row in fixture['memories']:
        item=dict(row);similarity=row['similarities'][scenario];item['similarity']=similarity
        if row['decay_class']=='permanent':permanent.append(item);continue
        if similarity<=.35:excluded.append(item);continue
        item.update(score(similarity,row['emotion_intensity'],row['importance'],row['age_days']+days,row['decay_class']))
        eligible.append(item)
    return {'mode':'synthetic','scenario':scenario,'days':days,'permanent':permanent,
            'hybrid':sorted(eligible,key=lambda r:(-r['score'],r['id'])),
            'semantic':sorted(eligible,key=lambda r:(-r['similarity'],r['id'])),'excluded':excluded}
