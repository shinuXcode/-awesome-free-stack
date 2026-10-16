#!/usr/bin/env python3
import csv, json, os, re, time, urllib.parse, urllib.request, urllib.error
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"research-output"; OUT.mkdir(exist_ok=True)
TOKEN=os.getenv("GITHUB_TOKEN",""); TARGET=int(os.getenv("TARGET_CANDIDATES","5000"))
API="https://api.github.com/search/repositories"
LICENSES=("MIT","Apache-2.0","GPL-3.0","GPL-2.0","BSD-2-Clause","BSD-3-Clause","MPL-2.0","ISC","AGPL-3.0","LGPL-3.0","LGPL-2.1","EPL-2.0","Unlicense","0BSD","CC0-1.0","Artistic-2.0","OFL-1.1","Zlib","BSL-1.0","CDDL-1.0","EUPL-1.2","OSL-3.0","MS-PL","AFL-3.0","PostgreSQL","NCSA","BSD-1-Clause","MIT-0","BlueOak-1.0.0")
GROUPS=[
("Frontend & Web Dev","react vue nextjs svelte astro angular frontend web-framework javascript-framework"),
("Backend & APIs","backend api rest-api graphql fastapi django flask expressjs nestjs spring-boot"),
("Databases & BaaS","database postgresql mysql sqlite mongodb redis vector-database database-engine supabase"),
("Hosting & PaaS","self-hosted hosting static-site cloud-platform serverless edge-computing cloudflare-workers"),
("Auth & Security","authentication oauth2 identity-management single-sign-on passkeys password-manager secrets-management"),
("AI & Machine Learning","machine-learning llm large-language-models generative-ai deep-learning pytorch tensorflow ai-agents rag inference"),
("AI APIs","ai-api llm-api model-serving embeddings speech-to-text text-to-speech computer-vision"),
("Storage & CDN","object-storage file-storage cdn image-optimization backup distributed-storage"),
("Dev Tools","developer-tools cli terminal command-line code-editor ide developer-experience git-tools code-search"),
("DevOps & Cloud","devops kubernetes docker container infrastructure-as-code terraform observability monitoring logging"),
("Testing & QA","testing test-automation unit-testing end-to-end-testing playwright cypress load-testing mocking"),
("Programming Languages","programming-language compiler interpreter language-server webassembly runtime static-analysis"),
("Mobile & Desktop Apps","mobile-app android ios flutter react-native desktop-application electron tauri"),
("Design & UI/UX","design-system ui-components component-library design-tools figma-plugin wireframing prototyping"),
("CMS","headless-cms cms content-management static-site-generator blog-engine"),
("Analytics","analytics product-analytics web-analytics event-tracking data-dashboard"),
("Data Science & Analytics","data-science data-visualization data-engineering etl notebook business-intelligence"),
("Video Editing & Motion","video-editor video-processing video-streaming animation motion-graphics"),
("3D & VFX","3d 3d-modeling 3d-rendering blender-addon computer-graphics"),
("Audio & Music","audio-editor audio-processing music-production daw midi music-player"),
("Game Development","game-engine game-development gamedev game-framework game-tools godot"),
("Operating Systems","linux linux-distribution operating-system bsd window-manager desktop-environment"),
("Office & Productivity","productivity office-suite markdown-editor spreadsheet calendar task-management"),
("Open Source Apps","open-source-app self-hosted-app awesome-selfhosted alternative-to foss"),
("Creator & Social Media","fediverse mastodon social-network activitypub creator-tools"),
("Communities & Forums","forum community-platform discussion-platform chat-server"),
("Freelancing & Client Management","crm invoicing time-tracking client-management"),
("Project & Idea Management","project-management kanban roadmap issue-tracker knowledge-management"),
("Documentation & Knowledge","documentation knowledge-base wiki docs-site developer-documentation"),
("Privacy & Utilities","privacy-tools file-converter local-first offline-first"),
("Collaboration & Communication","collaboration team-chat video-conferencing email-client matrix-protocol"),
("Education & Learning","education learning-platform e-learning flashcards course-platform"),
("Automation & No-Code","workflow-automation automation low-code no-code integration-platform"),
("Blockchain & Web3","blockchain web3 smart-contracts ethereum distributed-ledger"),
("Hardware & IoT","iot home-automation embedded arduino raspberry-pi firmware"),
("Accessibility","accessibility a11y screen-reader assistive-technology"),
("Localization & Internationalization","i18n localization translation internationalization"),
("Networking","networking proxy dns vpn network-monitoring"),
("Search & Indexing","search-engine full-text-search indexing"),
("Email & Messaging","email-server smtp newsletter transactional-email messaging"),
("Maps & Geospatial","geospatial gis mapping openstreetmap geolocation"),
("Science & Research","scientific-computing research-tools bioinformatics simulation"),
("Build & Packaging","build-tool bundler package-manager monorepo dependency-management"),
("API Clients & Integrations","api-client webhook sdk integration openapi"),
("Forms & Surveys","form-builder survey form-validation questionnaire"),
("Finance & Business Utilities","accounting expense-tracker budgeting business-tools"),
("Fonts & Assets","fonts icon-library illustration creative-assets"),
("Open Data","open-data public-datasets data-catalog"),
("Browser Extensions","browser-extension chrome-extension firefox-addon"),
("Rust Ecosystem","rust rust-library cargo"),
("Python Ecosystem","python python-library pypi"),
("JavaScript Ecosystem","javascript typescript npm"),
("Go Ecosystem","golang go-library"),
("PHP Ecosystem","php laravel"),
("Ruby Ecosystem","ruby rails"),
("Java Ecosystem","java jvm"),
("C and C++","cpp c-plus-plus c-library"),
("Data Formats","csv json yaml xml parquet"),
("Dev Containers","devcontainer nix nixos reproducible-builds"),
("Content Creation","podcast publishing digital-asset-management"),
("Maps & Visualization","visualization diagram graph-editor"),
("Search Infrastructure","elasticsearch opensearch meilisearch"),
("API Gateways","api-gateway reverse-proxy"),
("Workflow Engines","workflow-engine job-queue orchestration"),
("Web Performance","performance lighthouse web-vitals"),
("Security Utilities","static-analysis dependency-scanning sbom"),
("Local-First Software","local-first sync-engine offline-app"),
("Knowledge Tools","zettelkasten note-taking markdown"),
("Self-Hosting","self-hosted docker-compose home-server"),
("Open-Source Hardware","open-hardware fpga"),
("Image Processing","image-processing computer-vision"),
("Scientific Python","numpy scipy jupyter"),
("Design Engineering","design-tokens storybook"),
("Web Components","web-components lit-element"),
("Server Frameworks","http-server web-server"),
("File Management","file-manager deduplication"),
("Dev Education","tutorials coding-exercises"),
("Text Editors","text-editor code-editor"),
("Monitoring & Alerts","alerting uptime-monitoring"),
("Cloud Native","cloud-native cncf"),
("Data Pipelines","data-pipeline streaming"),
("Search UX","search-ui autocomplete"),
("Forms & Validation","schema-validation forms"),
("Remote Collaboration","remote-work collaboration-tools"),
("Calendar & Scheduling","calendar scheduling"),
("Digital Publishing","publishing static-blog"),
("E-book & Reading","ebook reader"),
("Translation Tools","translation machine-translation"),
("Accessibility Testing","accessibility-testing wcag"),
("API Documentation","api-documentation swagger"),
("Code Generation","code-generator scaffolding"),
("Package Registries","package-registry artifact-registry"),
("Web Scraping Utilities","web-scraping crawler"),
("Robotics","robotics ros"),
("Embedded Development","embedded-systems microcontroller"),
("Game Assets","game-assets pixel-art"),
("Video Infrastructure","webrtc live-streaming"),
("Audio Infrastructure","audio-streaming podcast"),
("Media Libraries","media-server photo-management"),
("Personal Knowledge Management","pkm personal-wiki"),
("Developer Portals","developer-portal backstage"),
("Cloud Cost Tools","cloud-cost finops"),
("Database Administration","database-admin sql-client"),
("Design Prototyping","prototype design-tool"),
("Productivity Apps","todo-list habit-tracker"),
("Automation Integrations","n8n workflow"),
("Text Processing","text-processing tokenizer"),
("Internationalization Libraries","icu locale"),
]

def slug(s): return re.sub(r"[^a-z0-9]+","-",str(s or "").lower()).strip("-")
def normurl(s):
    if not s:return ""
    try:
        p=urllib.parse.urlparse(s if "://" in s else "https://"+s)
        host=(p.hostname or "").lower().removeprefix("www.")
        path=p.path.rstrip("/").lower()
        if host=="github.com":
            parts=[x for x in path.split("/") if x]
            if len(parts)>=2:return "github.com/"+parts[0]+"/"+parts[1].removesuffix(".git")
        return host+path
    except:return str(s).lower().rstrip("/")
def existing_catalog():
    data=json.loads((ROOT/"data/tools.json").read_text(encoding="utf-8"))
    names=set(); urls=set(); domains=set()
    for x in data:
        names.update([slug(x.get("name")),slug(x.get("id"))])
        for value in [x.get("githubRepoUrl"),x.get("officialWebsiteUrl")]:
            u=normurl(value)
            if u: urls.add(u)
        u=normurl(x.get("officialWebsiteUrl"))
        if u:domains.add(u.split("/")[0])
    return names,urls,domains,len(data)
def api_get(url):
    headers={"Accept":"application/vnd.github+json","User-Agent":"ZeroCostDevStack-Research/1.0","X-GitHub-Api-Version":"2022-11-28"}
    if TOKEN:headers["Authorization"]="Bearer "+TOKEN
    req=urllib.request.Request(url,headers=headers)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req,timeout=40) as r:return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code in (403,429):
                reset=e.headers.get("X-RateLimit-Reset")
                wait=max(5,min(65,int(reset)-int(time.time())+2)) if reset else 15
                print("Rate limit wait",wait,flush=True);time.sleep(wait)
            elif e.code>=500:time.sleep(3*(attempt+1))
            else:print("Skip HTTP",e.code,flush=True);return {}
        except Exception as e:print("Retry",str(e),flush=True);time.sleep(2*(attempt+1))
    return {}
def allowed_license(repo):
    lic=(repo.get("license") or {}).get("spdx_id") or ""
    return bool(lic and lic!="NOASSERTION" and any(lic==x or lic.startswith(x+"-") for x in LICENSES)),lic
def duplicate(repo,names,urls,domains):
    full=normurl(repo.get("html_url")); n=slug(repo.get("name")); homepage=normurl(repo.get("homepage"))
    return full in urls or n in names or slug((repo.get("full_name") or "").replace("/","-")) in names or bool(homepage and homepage.split("/")[0] in domains)
def excluded_project(repo):
    # Keep the export focused on general-purpose developer software, not circumvention services or gambling.
    text=" ".join([repo.get("name") or "",repo.get("description") or ""]+[str(t) for t in (repo.get("topics") or [])]).lower()
    blocked=("casino","sports betting","sportsbook","prediction market","prediction-market","polymarket","gambling","betting","wager","poker","lottery","age gate bypass","age-check bypass","unblocker","unblock","bypass","circumvent","censorship circumvention","vpn","virtual private network","wireguard","openvpn","tailscale","zerotier","shadowsocks","v2ray","proxy","age verification","firearm","weapon","ammunition","explosive","grenade","switchblade","self-defense weapon","taser","poison","toxin","steroid","recreational drug")
    return any(term in text for term in blocked)
def build_pdf(path,rows,stamp,existing_count,requests_done,empty):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import landscape,letter
    from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak
    styles=getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Tiny",parent=styles["Normal"],fontSize=6.2,leading=7.4))
    styles.add(ParagraphStyle(name="TinyLink",parent=styles["Tiny"],textColor=colors.HexColor("#145DA0")))
    styles.add(ParagraphStyle(name="ReportTitle",parent=styles["Title"],fontSize=23,leading=27,textColor=colors.HexColor("#17202A")))
    page=landscape(letter)
    doc=SimpleDocTemplate(str(path),pagesize=page,rightMargin=22,leftMargin=22,topMargin=28,bottomMargin=28,title="5,000 Open-Source Project Candidates",author="Zero-Cost Dev Stack Research")
    story=[Paragraph("5,000 Open-Source Project Candidates",styles["ReportTitle"]),Paragraph("Research export for expanding Zero-Cost Dev Stack",styles["Normal"]),Spacer(1,8),
    Paragraph(f"<b>Research time:</b> {stamp} &nbsp; <b>Existing catalog entries checked:</b> {existing_count:,} &nbsp; <b>Candidate rows:</b> {len(rows):,} &nbsp; <b>Search requests:</b> {requests_done}",styles["Normal"]),Spacer(1,12),
    Paragraph("<b>Method.</b> Public GitHub repository search across 100+ curated software topics. Candidates are public repositories, not forks, not archived or disabled, with at least 5 stars, recent push activity (since 2022-01-01), and a recognized SPDX license. Results were filtered against the current catalog snapshot by normalized name, repository URL and official website domain.",styles["Normal"]),Spacer(1,7),
    Paragraph("<b>Important limitations.</b> This is a discovery shortlist, not 5,000 fully audited products or a guarantee that every semantic alias is absent from the existing directory. GitHub descriptions, stars, license metadata, project activity and homepages can change. Verify license compatibility, README, releases, dependencies, hosted-service pricing, free-tier quotas, billing requirements, security and product fit before adding a project. A declared repository license does not guarantee all dependencies/assets/services are free.",styles["Normal"]),Spacer(1,10),
    Paragraph("<b>Counts by category</b>",styles["Heading2"])]
    counts=Counter(r["category"] for r in rows)
    summary=[["Category","Candidates"]]+[[k,str(v)] for k,v in sorted(counts.items())]
    st=Table(summary,colWidths=[3.5*inch,1.1*inch],repeatRows=1)
    st.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#17202A")),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.3,colors.HexColor("#D5D8DC")),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.HexColor("#F4F6F7")]),("FONTSIZE",(0,0),(-1,-1),7),("VALIGN",(0,0),(-1,-1),"TOP")]))
    story.extend([st,Spacer(1,8),Paragraph(f"Empty/error API responses: {empty}. CSV and JSON data files are supplied alongside this PDF.",styles["Tiny"]),PageBreak(),Paragraph("Candidate directory",styles["Heading2"]),Paragraph("Homepage links appear only when present in GitHub repository metadata; otherwise the GitHub repository is the primary project link.",styles["Tiny"]),Spacer(1,5)])
    data=[[Paragraph("<b>"+h+"</b>",styles["Tiny"]) for h in ["#","Project / repository","Category","Stars · forks · issues","License · language · last push","Description and links"]]]
    for r in rows:
        repo_url=escape(r["github_url"],{'"':'&quot;'})
        home=r["official_website"]
        homepage=f'<br/><link href="{escape(home, {chr(34): "&quot;"})}" color="#145DA0">Official website</link>' if home.startswith("https://") else ""
        desc=escape((r["description"] or "No repository description provided.")[:240])
        links=f'<b>{escape(r["name"][:80])}</b> ({escape(r["full_name"][:100])})<br/>{desc}<br/><link href="{repo_url}" color="#145DA0">GitHub repository</link>{homepage}'
        data.append([Paragraph(str(r["rank_in_export"]),styles["Tiny"]),Paragraph(escape(r["name"][:80])+"<br/>"+escape(r["full_name"][:100]),styles["Tiny"]),Paragraph(escape(r["category"]),styles["Tiny"]),Paragraph(f'{r["stars_at_research_time"]:,} stars<br/>{r["forks"]:,} forks · {r["open_issues_including_prs"]:,} open issues/PRs',styles["Tiny"]),Paragraph(escape(r["license_spdx"][:25])+"<br/>"+escape(r["primary_language"][:20] or "Unspecified")+"<br/>Push: "+escape(r["last_pushed_at"][:10] or "n/a"),styles["Tiny"]),Paragraph(links,styles["Tiny"])])
    t=Table(data,colWidths=[22,104,82,77,82,391],repeatRows=1,splitByRow=1)
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#17202A")),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.25,colors.HexColor("#D5D8DC")),("VALIGN",(0,0),(-1,-1),"TOP"),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.HexColor("#F7F9FA")]),("LEFTPADDING",(0,0),(-1,-1),3),("RIGHTPADDING",(0,0),(-1,-1),3),("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3)]))
    story.append(t)
    def footer(canvas,doc):
        canvas.saveState();w,h=page;canvas.setFont("Helvetica",7);canvas.setFillColor(colors.HexColor("#65727E"));canvas.drawString(22,14,"Zero-Cost Dev Stack · Research candidates, not endorsements");canvas.drawRightString(w-22,14,f"Page {doc.page}");canvas.restoreState()
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
def main():
    names,urls,domains,existing_count=existing_catalog()
    print("Existing catalog entries:",existing_count,flush=True)
    found={}; categories={}; requests_done=0; empty=0
    # First sweep is broad and category-balanced; subsequent sweeps paginate deeper only if needed.
    # Fast mode searches one representative topic per category per page, retaining broad category coverage.
    groups = [(category, topics.split()[:1]) for category, topics in GROUPS]
    for page in range(1,11):
        for category,topic_list in groups:
            for topic in topic_list:
                if len(found)>=TARGET+500:break
                q=f"topic:{topic} stars:>=5 fork:false archived:false is:public pushed:>2022-01-01"
                url=API+"?"+urllib.parse.urlencode({"q":q,"sort":"stars","order":"desc","per_page":100,"page":page})
                payload=api_get(url);requests_done+=1;items=payload.get("items") or []
                if not payload:empty+=1
                for repo in items:
                    ok,lic=allowed_license(repo)
                    if not ok or repo.get("fork") or repo.get("archived") or repo.get("disabled") or duplicate(repo,names,urls,domains) or excluded_project(repo):continue
                    key=(repo.get("full_name") or "").lower()
                    if key and key not in found:found[key]=repo;categories[key]=category
                print(f"request={requests_done} page={page} topic={topic} new_candidates={len(found)}",flush=True)
                time.sleep(2.12)
            if len(found)>=TARGET+500:break
        if len(found)>=TARGET+500:break
    buckets=defaultdict(list)
    for key,repo in found.items():buckets[categories[key]].append((key,repo))
    for cat in buckets:buckets[cat].sort(key=lambda x:(x[1].get("stargazers_count",0),x[1].get("updated_at","")),reverse=True)
    chosen=[];cats=list(buckets)
    while len(chosen)<TARGET and cats:
        next_cats=[]
        for cat in cats:
            if buckets[cat] and len(chosen)<TARGET:chosen.append((cat,*buckets[cat].pop(0)))
            if buckets[cat]:next_cats.append(cat)
        cats=next_cats
    chosen.sort(key=lambda x:(x[0].lower(),-(x[2].get("stargazers_count") or 0),x[2].get("name","").lower()))
    stamp=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    rows=[]
    for i,(cat,key,repo) in enumerate(chosen,1):
        rows.append({"rank_in_export":i,"category":cat,"name":repo.get("name") or "","full_name":repo.get("full_name") or "","description":(repo.get("description") or "").strip(),"github_url":repo.get("html_url") or "","official_website":(repo.get("homepage") or "").strip(),"stars_at_research_time":repo.get("stargazers_count") or 0,"forks":repo.get("forks_count") or 0,"open_issues_including_prs":repo.get("open_issues_count") or 0,"primary_language":repo.get("language") or "","license_spdx":(repo.get("license") or {}).get("spdx_id") or "Unknown","last_pushed_at":repo.get("pushed_at") or "","last_updated_at":repo.get("updated_at") or "","topics":repo.get("topics") or [],"default_branch":repo.get("default_branch") or "","repository_size_kb":repo.get("size") or 0,"catalog_status":"No exact normalized name, GitHub URL, or official-domain match found in the catalog snapshot","verification_status":"Candidate; verify project fit, license, free/hosted pricing, and security before adding"})
    meta={"title":"5,000 Open-Source Project Candidates for Zero-Cost Dev Stack","researched_at_utc":stamp,"existing_catalog_entries_checked":existing_count,"unique_candidates_exported":len(rows),"unique_repositories_discovered_before_target_trim":len(found),"github_search_requests":requests_done,"empty_or_error_responses":empty,"selection_method":"Public GitHub repository search by curated software topics; non-fork, non-archived, recently pushed, at least 5 stars, recognized SPDX license; deduplicated against the current catalog by normalized name, repository URL, and official domain.","limitations":["GitHub metadata is not a code or security audit.","Exact normalized matches are excluded; semantic aliases may remain and need human review.","Stars, licenses, project activity, descriptions and homepages can change.","A repository license does not independently guarantee dependencies, assets, or hosted features are free."],"projects":rows}
    (OUT/"5000-open-source-project-candidates.json").write_text(json.dumps(meta,indent=2,ensure_ascii=False),encoding="utf-8")
    with (OUT/"5000-open-source-project-candidates.csv").open("w",newline="",encoding="utf-8-sig") as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]) if rows else ["rank_in_export"]);w.writeheader()
        for row in rows:
            x=dict(row);x["topics"]=", ".join(x["topics"]);w.writerow(x)
    if not rows:raise RuntimeError("No eligible repositories found.")
    build_pdf(OUT/"5000-open-source-project-candidates.pdf",rows,stamp,existing_count,requests_done,empty)
    print(f"COMPLETE: exported {len(rows)} candidates; PDF/CSV/JSON ready.",flush=True)
    if len(rows)<TARGET:print(f"WARNING: only {len(rows)} candidates met the filters; target was {TARGET}.",flush=True)
if __name__=="__main__":main()
