#!/usr/bin/env python3
from __future__ import annotations
import csv, html, json, os, re, sys, time, unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse, urlencode
import requests
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("dist")
MINIMUM = int(os.getenv("RESEARCH_MINIMUM", "5000"))
MAXIMUM = int(os.getenv("RESEARCH_MAXIMUM", "7500"))
S = requests.Session()
TOKEN = os.getenv("GITHUB_TOKEN", "")
S.headers.update({"User-Agent":"zero-cost-dev-stack-research/1.0","Accept":"application/vnd.github+json"})
if TOKEN:
    S.headers["Authorization"] = "Bearer " + TOKEN
SOURCES = [
    ("Awesome Selfhosted","https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md","Self-hosted software"),
    ("Free for Dev","https://raw.githubusercontent.com/ripienaar/free-for-dev/master/README.md","Free developer SaaS"),
    ("Public APIs","https://raw.githubusercontent.com/public-apis/public-apis/master/README.md","APIs and developer services"),
    ("Awesome Python","https://raw.githubusercontent.com/vinta/awesome-python/master/README.md","Python ecosystem"),
    ("Awesome Node.js","https://raw.githubusercontent.com/sindresorhus/awesome-nodejs/main/readme.md","Node.js ecosystem"),
    ("Awesome Go","https://raw.githubusercontent.com/avelino/awesome-go/master/README.md","Go ecosystem"),
    ("Awesome Rust","https://raw.githubusercontent.com/rust-unofficial/awesome-rust/master/README.md","Rust ecosystem"),
    ("Awesome PHP","https://raw.githubusercontent.com/ziadoz/awesome-php/master/README.md","PHP ecosystem"),
    ("Awesome Java","https://raw.githubusercontent.com/akullpp/awesome-java/master/README.md","Java ecosystem"),
    ("Awesome CLI Apps","https://raw.githubusercontent.com/agarrharr/awesome-cli-apps/master/readme.md","Command-line software"),
    ("Awesome Electron","https://raw.githubusercontent.com/sindresorhus/awesome-electron/main/readme.md","Desktop applications"),
    ("Awesome Browser Extensions","https://raw.githubusercontent.com/sindresorhus/awesome-browser-extensions/main/readme.md","Browser extensions"),
    ("Awesome macOS Apps","https://raw.githubusercontent.com/jaywcjlove/awesome-mac/master/README.md","macOS applications"),
    ("Awesome iOS","https://raw.githubusercontent.com/vsouza/awesome-ios/master/README.md","iOS ecosystem"),
    ("Awesome Android UI","https://raw.githubusercontent.com/wasabeef/awesome-android-ui/master/README.md","Android components"),
    ("Awesome Vue","https://raw.githubusercontent.com/vuejs/awesome-vue/master/README.md","Vue ecosystem"),
    ("Awesome React","https://raw.githubusercontent.com/enaqx/awesome-react/master/README.md","React ecosystem"),
    ("Awesome DevOps","https://raw.githubusercontent.com/wmariuss/awesome-devops/master/README.md","DevOps and infrastructure"),
    ("Awesome Kubernetes","https://raw.githubusercontent.com/ramitsurana/awesome-kubernetes/master/README.md","Kubernetes ecosystem"),
    ("Awesome Sysadmin","https://raw.githubusercontent.com/awesome-foss/awesome-sysadmin/master/README.md","System administration"),
    ("Awesome Privacy","https://raw.githubusercontent.com/pluja/awesome-privacy/master/README.md","Privacy and security software"),
    ("Awesome Data Engineering","https://raw.githubusercontent.com/igorbarinov/awesome-data-engineering/master/README.md","Data engineering"),
    ("Awesome Testing","https://raw.githubusercontent.com/TheJambo/awesome-testing/master/README.md","Testing and QA"),
    ("Awesome TypeScript","https://raw.githubusercontent.com/dzharii/awesome-typescript/master/README.md","TypeScript ecosystem"),
    ("Awesome Frontend","https://raw.githubusercontent.com/dypsilon/frontend-dev-bookmarks/master/readme.md","Frontend development"),
    ("Awesome Design Systems","https://raw.githubusercontent.com/alexpate/awesome-design-systems/master/README.md","Design systems"),
    ("Awesome Web Development","https://raw.githubusercontent.com/markodenic/web-development-resources/master/readme.md","Web development resources"),
    ("Awesome Machine Learning","https://raw.githubusercontent.com/josephmisiti/awesome-machine-learning/master/README.md","Machine learning"),
    ("Awesome Open Source Apps","https://raw.githubusercontent.com/unicodeveloper/awesome-opensource-apps/master/README.md","Open-source applications"),
    ("Awesome Selfhosting Guide","https://raw.githubusercontent.com/mikeroyal/Self-Hosting-Guide/master/README.md","Self-hosting and infrastructure"),
    ("Awesome AI Tools","https://raw.githubusercontent.com/mahseema/awesome-ai-tools/master/README.md","AI tools and apps"),
    ("Awesome Productivity","https://raw.githubusercontent.com/jyguyomarch/awesome-productivity/master/README.md","Productivity tools"),
]
TOPICS = [
"developer-tools","self-hosted","cli","productivity","ai-tools","machine-learning","databases","testing",
"observability","devops","static-site-generator","api-client","cms","analytics","design","editor","networking",
"database-management","data-visualization","note-taking","password-manager","backup","media-server",
"knowledge-management","automation","llm","vector-database","api","frontend","backend","python","typescript","rust",
"go","java","swift","android","react","vue","electron","design-system","accessibility","game-development",
"audio","video","3d","compiler","documentation","education","email","crm","project-management","finance","cloud",
"storage","workflow-automation","webapp","image-processing","code-editor","browser-extension","file-manager","calendar",
"messaging","monitoring","object-storage","serverless","api-gateway","open-source","developer-experience",
"security-tools","web-development","local-first","homelab","ai-agent","prompt-engineering","data-engineering",
"infrastructure","database","documentation-generator","static-analysis","code-formatting","testing-tools",
"design-tools","video-editing","media-tools","react-native","vuejs","nextjs","svelte","django","fastapi","flask",
"postgresql","mysql","redis","sqlite","graphql","rest-api","microservices","web-framework","static-site","low-code",
"no-code","webassembly","wasm","computer-vision","natural-language-processing","large-language-models","chatbot",
"llm-inference","fine-tuning","embeddings","recommendation-system","security","privacy","encryption","devcontainer",
"git","gitops","ci-cd","continuous-integration","monitoring-tools","logging","metrics","tracing","feature-flags",
"feature-management","workflow-engine","job-queue","message-broker","event-driven","data-pipeline","etl","data-warehouse",
"data-lake","business-intelligence","bi","dashboard","charts","visualization","notebook","jupyter","spreadsheet",
"document-editor","markdown","wiki","blog","headless-cms","ecommerce","payment","invoice","crm-software","erp",
"helpdesk","customer-support","chat","forum","community","social-network","fediverse","mastodon","rss","newsletter",
"email-client","email-server","calendar-app","task-management","kanban","time-tracking","habit-tracker","todo",
"bookmark-manager","read-it-later","file-sync","cloud-storage","backup-software","nas","homelab-tools","home-automation",
"iot","raspberry-pi","hardware","robotics","3d-printing","cad","computer-aided-design","vector-graphics","image-editor",
"photo-management","digital-asset-management","video-player","video-conferencing","streaming","podcast","audio-player",
"music-production","daw","game-engine","game-development-tools","modding","education-tools","learning-management-system",
"flashcards","language-learning","accessibility-tools","screen-reader","font","icon","ui-components","component-library",
"design-token","css","tailwindcss","web-components","build-tool","bundler","compiler","linter","formatter","code-search",
"code-review","code-analysis","static-analysis-tools","developer-portal","api-documentation","documentation-tools",
"swagger","openapi","grpc","graphql-tools","api-testing","mock-server","load-testing","performance-testing",
"end-to-end-testing","unit-testing","test-automation","browser-automation","web-scraping","scraper","crawler",
"search-engine","full-text-search","vector-search","semantic-search","database-client","database-gui","orm",
"database-migration","database-observability","cloud-native","kubernetes-operator","docker","containers","container-tools",
"virtualization","linux","windows","macos","operating-system","package-manager","dependency-management","supply-chain-security",
"sbom","vulnerability-scanner","sast","dast","secret-scanning","identity","authentication","authorization","oauth",
"oidc","sso","access-control","zero-trust","vpn","firewall","network-security","threat-intelligence","incident-response",
"forensics","osint","malware-analysis","reverse-engineering","binary-analysis","compiler-toolchain","programming-language",
"functional-programming","developer-learning","coding-challenges","interview-preparation","algorithm","data-structures",
"competitive-programming","open-data","geospatial","gis","mapping","weather-api","finance-api","healthcare-api",
"government-data","scientific-computing","simulation","statistics","machine-learning-framework","deep-learning",
"model-serving","mlops","experiment-tracking","dataset","data-labeling","synthetic-data","model-evaluation",
"prompt-management","rag","retrieval-augmented-generation","agent-framework","ai-coding-assistant","code-generation",
"local-ai","on-device-ai","inference-engine","model-quantization","speech-recognition","text-to-speech","ocr",
"translation","document-processing","workflow-automation-tools","integration-platform","zapier-alternative","ifttt",
"cron","scheduler","serverless-functions","edge-computing","cdn","dns","domain-management","hosting","web-hosting",
"static-hosting","backend-as-a-service","baas","database-as-a-service","object-storage","file-upload","image-cdn",
"content-delivery","observability-platform","error-tracking","apm","uptime-monitoring","status-page","log-management",
"cost-monitoring","cloud-cost","infrastructure-as-code","terraform","ansible","configuration-management",
"secrets-management","service-mesh","reverse-proxy","load-balancer","web-server","application-server","http-server",
"api-framework","graphql-server","authentication-server","oauth-server","identity-provider","single-sign-on",
"payment-gateway","billing","subscription-management","feature-store","vector-database","graph-database","time-series-database",
"document-database","key-value-store","search-database","distributed-database","embedded-database","offline-first",
"local-first-app","pwa","progressive-web-app","cross-platform","desktop-app","mobile-app","flutter","react-native",
"tauri","electron-app","browser-app","web-extension","chrome-extension","firefox-extension","safari-extension",
"web-application","open-source-software","free-software","selfhosted","self-hosted-app","foss","free-tier","open-source-alternative",
]

def txt(s,limit=500):
    s = "" if s is None else str(s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", s)
    s = re.sub(r"\s+", " ", s).strip(" \t\r\n-:;|")
    return s[:limit]
def slug(s):
    s = unicodedata.normalize("NFKD",str(s)).encode("ascii","ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+","-",s).strip("-")
def norm(s):
    return re.sub(r"[^a-z0-9]+","",txt(s,200).lower())
def urlok(s):
    s=txt(s,1000)
    try:
        p=urlparse(s)
        return s if p.scheme in ("https","http") and p.netloc else ""
    except Exception:
        return ""
def canon(s):
    s=urlok(s)
    if not s:return ""
    p=urlparse(s); host=(p.hostname or "").lower().removeprefix("www.")
    path=re.sub(r"/+","/",p.path).rstrip("/")
    if host=="github.com":
        bits=[x for x in path.split("/") if x]
        if len(bits)>=2:return "https://github.com/"+bits[0].lower()+"/"+bits[1].removesuffix(".git").lower()
    return "https://"+host+path
def repo_of(s):
    try:
        p=urlparse(urlok(s))
        if (p.hostname or "").lower() not in ("github.com","gitlab.com","bitbucket.org"):return ""
        bits=[x for x in p.path.split("/") if x]
        return "/".join(bits[:2]).lower() if len(bits)>=2 else ""
    except Exception:return ""
def fetch(url, tries=3):
    for i in range(tries):
        try:
            r=S.get(url,timeout=35)
            if r.status_code in (403,429) and "rate limit" in r.text.lower():
                time.sleep(3*(i+1));continue
            r.raise_for_status()
            return r
        except Exception:
            if i==tries-1: raise
            time.sleep(i+1)
    raise RuntimeError("unreachable")
def load_existing():
    p=ROOT/"data"/"tools.json"
    raw=json.loads(p.read_text(encoding="utf-8")) if p.exists() else []
    names=set(); slugs=set(); urls=set(); repos=set()
    for it in raw if isinstance(raw,list) else raw.get("tools",[]):
        if not isinstance(it,dict):continue
        if it.get("name"):names.add(norm(it["name"]));slugs.add(slug(it["name"]))
        if it.get("id"):slugs.add(slug(it["id"]))
        for k in ("officialWebsiteUrl","website","url","official_url","docsUrl"):
            u=urlok(it.get(k,""))
            if u:urls.add(canon(u))
        for k in ("githubRepoUrl","repo_url","github","repository_url","source_url"):
            u=urlok(it.get(k,""))
            if u:repos.add(repo_of(u) or canon(u))
    return names,slugs,urls,repos
def candidate(name, category, description, website, github, license_value, stars, source, source_url, language="", updated=""):
    name=txt(name,120); website=urlok(website); github=urlok(github)
    if not name or len(name)<2 or (not website and not github):return None
    if not website:website=github
    return {"name":name,"category":txt(category,90) or "Uncategorized","description":txt(description,350) or "Description not supplied; inspect the project website or repository.",
        "website":website,"github":github,"license":txt(license_value,60) or "Not verified","access_status":"Not verified from source",
        "github_stars":int(stars or 0),"language":txt(language,50),"last_updated_utc":txt(updated,50),
        "source_name":txt(source,100),"source_url":urlok(source_url)}
LINK=re.compile(r"\[([^\]]{1,180})\]\((https?://[^)\s]+)",re.I)
def parse_markdown(md, source, source_url, default_category):
    records=[]; category=default_category
    for line in md.splitlines():
        line=line.strip()
        h=re.match(r"^#{2,4}\s+(.+)$",line)
        if h:
            c=txt(h.group(1),100)
            if c and not c.lower().startswith(("table of contents","contents","license","contributing","contributors","resources")):category=c
            continue
        if not (line.startswith(("- ","* ","+ ","|")) or re.match(r"^\d+\.\s",line)):continue
        matches=LINK.findall(line)
        if not matches:continue
        # First link is the likely project title; later source links are retained where labeled.
        title,url=matches[0]; title=txt(title,120); website=url
        if title.lower() in {"source code","documentation","docs","demo","website","readme","awesome","back to top","homepage","license"}:continue
        if len(title)<2 or title.startswith("#"):continue
        rest=line
        m=re.search(r"\)\s*[-:|]?\s*(.*)$",line)
        desc=txt(m.group(1) if m else "",350)
        if desc.lower().startswith(("source code","documentation","website")):desc=""
        github=""
        for lab,link in matches[1:]:
            if any(x in lab.lower() for x in ("source","github","gitlab","repository","repo")):
                github=link;break
        if repo_of(website) and not github:github=website
        # Separate plain repo URL links may appear in descriptions.
        if not github:
            m2=re.search(r"https?://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+",line)
            if m2:github=m2.group(0)
        # Ignore anchors/navigation, badges, list-of-lists and generic headings.
        if "github.com/" in website and any(x in website.lower() for x in ("/issues","/pulls","/actions","/sponsors","/discussions")):continue
        item=candidate(title,category,desc,website,github,"Not verified",0,source,source_url)
        if item:records.append(item)
    return records
def fetch_lists():
    output=[]; counts={}
    for label,url,category in SOURCES:
        try:
            response=fetch(url)
            parsed=parse_markdown(response.text,label,url,category)
            output.extend(parsed);counts[label]=len(parsed)
            print("source",label,len(parsed),flush=True)
        except Exception as e:
            counts[label]=0;print("WARN source",label,str(e)[:180],file=sys.stderr,flush=True)
    return output,counts
def github_topic(topic):
    q=f"topic:{topic} stars:>=10 archived:false fork:false"
    url="https://api.github.com/search/repositories?"+urlencode({"q":q,"sort":"stars","order":"desc","per_page":100,"page":1})
    try:
        data=fetch(url).json(); out=[]
        for r in data.get("items",[]):
            if r.get("fork") or r.get("archived") or r.get("disabled"):continue
            name=txt(r.get("name") or "",120); github=urlok(r.get("html_url",""))
            home=urlok(r.get("homepage",""))
            lic=((r.get("license") or {}).get("spdx_id") or "Not listed")
            desc=txt(r.get("description") or "",350) or f"Public repository tagged with GitHub topic: {topic}."
            it=candidate(name,topic.replace("-"," ").title(),desc,home or github,github,lic,int(r.get("stargazers_count") or 0),
                "GitHub topic search: "+topic,"https://github.com/topics/"+topic,r.get("language"),r.get("pushed_at") or r.get("updated_at") or "")
            if it:out.append(it)
        return out
    except Exception as e:
        print("WARN topic",topic,str(e)[:100],file=sys.stderr,flush=True)
        return []
def dedupe(records,existing):
    names,slugs,urls,repos=existing; seen_n=set();seen_u=set();seen_r=set();out=[]
    for it in sorted(records,key=lambda x:(-int(x.get("github_stars") or 0),x["name"].casefold())):
        n=norm(it["name"]); s=slug(it["name"])
        u=canon(it.get("website","")); repo=repo_of(it.get("github","")) or repo_of(it.get("website",""))
        if n in names or s in slugs or (u and u in urls) or (repo and repo in repos):continue
        if n in seen_n or (u and u in seen_u) or (repo and repo in seen_r):continue
        seen_n.add(n)
        if u:seen_u.add(u)
        if repo:seen_r.add(repo)
        out.append(it)
    return out
def esc(s):return html.escape(txt(s,1000),quote=False)
def draw_page(canv,doc):
    w,h=doc.pagesize;canv.saveState()
    canv.setFillColor(colors.HexColor("#111923"));canv.rect(0,h-8*mm,w,8*mm,stroke=0,fill=1)
    canv.setFillColor(colors.HexColor("#C6F66F"));canv.setFont("Helvetica-Bold",8)
    canv.drawString(doc.leftMargin,h-5.4*mm,"ZERO-COST DEV STACK / RESEARCH CANDIDATES")
    canv.setFillColor(colors.HexColor("#677181"));canv.setFont("Helvetica",7)
    canv.drawRightString(w-doc.rightMargin,5.5*mm,"Candidate dataset - verify sources before import | Page "+str(doc.page))
    canv.restoreState()
def pdf_report(items,source_counts,excluded,out):
    pagesize=landscape(A4); w,h=pagesize
    doc=BaseDocTemplate(str(out),pagesize=pagesize,leftMargin=7*mm,rightMargin=7*mm,topMargin=13*mm,bottomMargin=11*mm,
        title="5,000+ unlisted tool research backlog",author="Zero-Cost Dev Stack / Sadab")
    doc.addPageTemplates([PageTemplate(id="main",frames=[Frame(doc.leftMargin,doc.bottomMargin,w-doc.leftMargin-doc.rightMargin,h-doc.topMargin-doc.bottomMargin,id="f")],onPage=draw_page)])
    st=getSampleStyleSheet()
    title=ParagraphStyle("big",parent=st["Title"],fontName="Helvetica-Bold",fontSize=24,leading=29,textColor=colors.HexColor("#111923"),alignment=0)
    lead=ParagraphStyle("lead",parent=st["Normal"],fontSize=9,leading=14,textColor=colors.HexColor("#4E5968"))
    sec=ParagraphStyle("sec",parent=st["Heading1"],fontName="Helvetica-Bold",fontSize=13,leading=16,textColor=colors.HexColor("#18251F"),spaceBefore=8,spaceAfter=6)
    body=ParagraphStyle("body",parent=st["Normal"],fontSize=7.2,leading=9.4,textColor=colors.HexColor("#26303B"))
    name=ParagraphStyle("name",parent=body,fontName="Helvetica-Bold",fontSize=7.4,leading=9.1,textColor=colors.HexColor("#18221B"))
    small=ParagraphStyle("small",parent=body,fontSize=6.2,leading=7.8,textColor=colors.HexColor("#485464"))
    link=ParagraphStyle("link",parent=small,textColor=colors.HexColor("#24643F"))
    th=ParagraphStyle("th",parent=body,fontName="Helvetica-Bold",fontSize=6.6,leading=8,textColor=colors.white)
    story=[Spacer(1,14*mm),Paragraph("5,000+ Tool Research Backlog",title),Spacer(1,3*mm),
        Paragraph("A source-linked discovery dataset for finding software, developer tools, APIs, open-source projects and useful services not mechanically matched in the current Zero-Cost Dev Stack catalog.",lead),Spacer(1,6*mm)]
    today=datetime.now(timezone.utc).strftime("%d %B %Y UTC")
    summ=Table([[Paragraph("<b>Unmatched candidates</b>",body),Paragraph("<b>Existing-catalog matching</b>",body),Paragraph("<b>Research snapshot</b>",body)],
        [Paragraph(f"<font size='18' color='#24643F'><b>{len(items):,}</b></font>",body),
         Paragraph(f"{excluded:,} raw records were excluded by normalized name, exact repository identity or canonical URL checks.",body),
         Paragraph(today,body)]],colWidths=[47*mm,118*mm,50*mm],rowHeights=[8*mm,17*mm])
    summ.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#DFEBD5")),("BACKGROUND",(0,1),(-1,1),colors.HexColor("#F4F7F1")),("BOX",(0,0),(-1,-1),.5,colors.HexColor("#D9E0D5")),("INNERGRID",(0,0),(-1,-1),.4,colors.HexColor("#DDE4D9")),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7)]))
    story.extend([summ,Spacer(1,7*mm),Paragraph("Method and how to interpret the fields",sec),
        Paragraph("Sources: public GitHub repository-topic search results and curated open-source / developer-resource lists. The current repository catalog is read from data/tools.json in the same checkout. Candidate records are removed when normalized names, slugs, canonical URLs, or GitHub/GitLab/Bitbucket owner-repository IDs match existing catalog entries. Each row includes source links. GitHub stars, license metadata and last-push date are point-in-time public repository fields where available.",lead),
        Paragraph("Important quality boundary",sec),
        Paragraph("This is an automated discovery backlog, not 5,000 approved new catalog entries. 'Unmatched' means the record was not caught by mechanical name/URL/repository matching; similar tools, aliases, forks under new owners, stale links, duplicates with different branding, dead projects and existing tools described under different names can remain. Every candidate needs human review before import. Never infer that missing license metadata means open source, or that a repository star count proves safety or maintenance quality.",lead),
        Paragraph("Pricing and security",sec),
        Paragraph("Free-tier pricing, card-at-signup rules, quotas, trials, data residency, telemetry and overages are not guessed. Unless the source explicitly provides reliable current evidence, access is marked 'Not verified from source'. Open-source software can still incur hosting and operations costs. The list deliberately does not assign safety scores or guarantee zero-dollar usage.",lead),
        Paragraph("Source coverage before deduplication",sec)])
    for label,count in sorted(source_counts.items(),key=lambda v:(-v[1],v[0])):
        if count:story.append(Paragraph(f"• {esc(label)}: {count:,} parsed/retrieved records",small))
    story.extend([PageBreak(),Paragraph("Candidate directory",sec),Paragraph("Alphabetical listing. Website/repository links are clickable. Use the accompanying CSV and JSON for filtering, category mapping, and validation before import.",lead),Spacer(1,3*mm)])
    data=[[Paragraph("NAME / CATEGORY",th),Paragraph("DESCRIPTION",th),Paragraph("LICENSE / REPOSITORY SIGNAL",th),Paragraph("WEBSITE / GITHUB REPOSITORY",th),Paragraph("DISCOVERY SOURCE",th)]]
    for it in items:
        data.append([
            Paragraph(f"<b>{esc(it['name'])}</b><br/><font color='#657083'>{esc(it['category'])}</font>",name),
            Paragraph(esc(it.get("description") or "No source summary found; inspect official links."),body),
            Paragraph(f"<b>{esc(it.get('license') or 'Not verified')}</b><br/>Stars: {int(it.get('github_stars') or 0):,}<br/>Language: {esc(it.get('language') or 'Not listed')}<br/>Last push: {esc((it.get('last_updated_utc') or 'Not listed')[:10])}",small),
            Paragraph((f'<link href="{html.escape(it["website"],quote=True)}" color="#24643F">Website / project page</link>' if it.get("website") else "Not listed")+
                ("<br/>"+f'<link href="{html.escape(it["github"],quote=True)}" color="#24643F">GitHub repository</link>' if it.get("github") and canon(it["github"])!=canon(it.get("website","")) else ""),link),
            Paragraph(f'<link href="{html.escape(it["source_url"],quote=True)}" color="#24643F">{esc(it["source_name"])}</link>' if it.get("source_url") else esc(it.get("source_name","Unknown source")),small)
        ])
    tbl=Table(data,colWidths=[46*mm,72*mm,38*mm,42*mm,30*mm],repeatRows=1,splitByRow=1,hAlign="LEFT")
    tbl.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#1B252B")),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),("LINEBELOW",(0,0),(-1,0),.7,colors.HexColor("#C6F66F")),("LINEBELOW",(0,1),(-1,-1),.25,colors.HexColor("#DEE4DC")),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.HexColor("#F5F7F3")])]))
    story.append(tbl);doc.build(story)
def main():
    OUT.mkdir(exist_ok=True,parents=True)
    existing=load_existing()
    # Fetch curated public lists first; these provide human-maintained resource discovery context.
    records,counts=fetch_lists()
    # Topic search finds many additional repositories. Search endpoints are rate-limited, so pace calls.
    seen=set()
    for ix,topic in enumerate(TOPICS):
        if topic in seen:continue
        seen.add(topic)
        got=github_topic(topic);records.extend(got);counts["GitHub topic: "+topic]=len(got)
        print(f"topics {ix+1}/{len(TOPICS)} {topic}: {len(got)} raw candidates",flush=True)
        time.sleep(2.1)
    before=len(records)
    unique=dedupe(records,existing)
    unique.sort(key=lambda x:x["name"].casefold())
    if len(unique)<MINIMUM:
        print(json.dumps({"error":f"Found {len(unique)} unmatched candidate records, below required {MINIMUM}. Not publishing a 5,000+ claim.","raw":before,"unique":len(unique),"source_counts":counts},indent=2))
        raise SystemExit(2)
    items=unique[:MAXIMUM]
    stamp=datetime.now(timezone.utc).strftime("%Y%m%d")
    pdf=OUT/f"zero-cost-dev-stack-5000-plus-tool-research-{stamp}.pdf"
    csvfile=OUT/f"zero-cost-dev-stack-5000-plus-tool-research-{stamp}.csv"
    jsonfile=OUT/f"zero-cost-dev-stack-5000-plus-tool-research-{stamp}.json"
    with csvfile.open("w",newline="",encoding="utf-8-sig") as f:
        fields=["name","category","description","website","github","license","access_status","github_stars","language","last_updated_utc","source_name","source_url"]
        wr=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore");wr.writeheader();wr.writerows(items)
    jsonfile.write_text(json.dumps({"generated_utc":datetime.now(timezone.utc).isoformat(),"repository":"https://github.com/shinuXcode/-awesome-free-stack","checked_catalog":"data/tools.json","candidate_count":len(items),"raw_records":before,"unmatched_before_limit":len(unique),"matching_method":["normalized name","slug/id","canonical website URL","GitHub/GitLab/Bitbucket owner/repository"],"caveat":"Candidates are unmatched by mechanical deduplication only, not manually verified. Source fields, license metadata, pricing and live repository facts need re-checking.","source_counts":counts,"candidates":items},ensure_ascii=False,indent=2),encoding="utf-8")
    pdf_report(items,counts,before-len(unique),pdf)
    print(json.dumps({"candidate_count":len(items),"raw_records":before,"unmatched_before_limit":len(unique),"pdf":str(pdf),"csv":str(csvfile),"json":str(jsonfile),"sources":counts},indent=2))
if __name__=="__main__":main()
