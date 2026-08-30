function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function healthScore({status,availability=100,openAlerts=0,criticalAlerts=0,agentAgeSec=0}){
  let score=100;
  if(status==='OFFLINE') score-=70;
  else if(status==='CRITICAL') score-=40;
  else if(status==='WARNING') score-=15;
  score-=Math.max(0,100-Number(availability))*0.5;
  score-=Math.min(30,Number(openAlerts)*3);
  score-=Math.min(30,Number(criticalAlerts)*8);
  if(agentAgeSec>300) score-=10;
  return Math.round(clamp(score,0,100));
}
module.exports={healthScore};
