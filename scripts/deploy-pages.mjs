// West Group: Pages API deployment with a real bounded 30-minute polling window.
// Uses the same GitHub-hosted artifact and OIDC authorization as deploy-pages.
import {appendFile} from 'node:fs/promises';
import {setTimeout as sleep} from 'node:timers/promises';
const env=process.env;
const repo=env.GITHUB_REPOSITORY, run=env.GITHUB_RUN_ID, sha=env.GITHUB_SHA;
const api=env.GITHUB_API_URL||'https://api.github.com';
const token=env.GITHUB_TOKEN;
let deploymentId;
async function request(path,method='GET',body){
 const response=await fetch(api+'/repos/'+repo+path,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('GitHub API HTTP '+response.status+' for '+method+' '+path);
 return response.status===204?{}:response.json();
}
async function cancel(){if(deploymentId)await request('/pages/deployments/'+encodeURIComponent(deploymentId)+'/cancel','POST');}
async function main(){
 for(const name of ['GITHUB_TOKEN','GITHUB_REPOSITORY','GITHUB_RUN_ID','GITHUB_SHA','ACTIONS_ID_TOKEN_REQUEST_URL','ACTIONS_ID_TOKEN_REQUEST_TOKEN','GITHUB_OUTPUT'])if(!env[name])throw new Error('Missing workflow environment: '+name);
 const all=await request('/actions/runs/'+run+'/artifacts?per_page=100');
 const artifacts=all.artifacts.filter(a=>a.name==='github-pages'&&!a.expired);
 if(artifacts.length!==1)throw new Error('Expected one unexpired github-pages artifact');
 const oidc=await fetch(env.ACTIONS_ID_TOKEN_REQUEST_URL,{headers:{Authorization:'Bearer '+env.ACTIONS_ID_TOKEN_REQUEST_TOKEN},signal:AbortSignal.timeout(30000)});
 if(!oidc.ok)throw new Error('OIDC request failed HTTP '+oidc.status);
 const identity=await oidc.json();if(!identity.value)throw new Error('OIDC response missing token');
 const deployment=await request('/pages/deployments','POST',{artifact_id:artifacts[0].id,pages_build_version:sha,oidc_token:identity.value});
 deploymentId=deployment.id||deployment.status_url?.split('/').pop()||sha;
 if(deployment.page_url)await appendFile(env.GITHUB_OUTPUT,'page_url='+deployment.page_url+'\n');
 const deadline=Date.now()+30*60*1000;let last='',errors=0;
 while(Date.now()<deadline){
  await sleep(15000);let state;
  try{state=await request('/pages/deployments/'+encodeURIComponent(deploymentId));errors=0;}catch(e){if(++errors>=5)throw e;console.log('Temporary status request failure; retrying.');continue;}
  if(state.status!==last){last=state.status;console.log('Pages status: '+last);}
  if(last==='succeed'){await appendFile(env.GITHUB_OUTPUT,'status=succeed\n');console.log('Pages deployment verified.');deploymentId=null;return;}
  if(['deployment_failed','deployment_perms_error','deployment_content_failed','deployment_cancelled','deployment_lost'].includes(last))throw new Error('Pages ended with '+last);
 }
 throw new Error('Pages did not finish within 30 minutes');
}
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{cancel().catch(()=>{}).finally(()=>process.exit(1));});
main().catch(async error=>{console.error(error.message);await cancel().catch(()=>{});process.exitCode=1;});
