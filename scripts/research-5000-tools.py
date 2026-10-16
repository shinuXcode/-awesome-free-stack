#!/usr/bin/env python3
"""Build a research report of 5,000+ new tool/software candidates from public GitHub repository search."""
from __future__ import annotations
import csv, html, json, os, re, sys, time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
import requests
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, LongTable, PageBreak

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output"
OUT.mkdir(exist_ok=True)
TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO_FULL_NAME = os.environ.get("GITHUB_REPOSITORY", "shinuXcode/-awesome-free-stack")
API = "https://api.github.com/search/repositories"
HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "zero-cost-dev-stack-research/1.0",
}
if TOKEN:
    HEADERS["Authorization"] = "Bearer " + TOKEN

# These category-labelled GitHub topics span software tools, apps, frameworks and developer services.
TOPICS = {
"Frontend & Web Dev": "frontend frontend-framework react vuejs svelte angular web-development css-framework tailwindcss design-system static-site-generator jamstack webassembly webgpu nextjs astrojs remix react-router vite typescript javascript web-components web-app",
"Backend & APIs": "backend backend-framework api rest-api graphql grpc api-gateway web-server http-server serverless edge-computing microservices web-framework api-framework openapi swagger websocket reverse-proxy",
"Databases & BaaS": "database sql-database nosql postgresql mysql sqlite mongodb redis vector-database search-engine database-management time-series-database graph-database data-warehouse database-client embedded-database orm database-migration",
"Auth & Security": "authentication authorization identity oauth2 openid-connect sso iam password-manager secrets-management zero-trust application-security security-tools security-scanner vulnerability-scanner sast dast dependency-scanner supply-chain-security cryptography privacy",
"AI & Machine Learning": "artificial-intelligence machine-learning deep-learning llm large-language-models generative-ai ai-agents agent-framework ai-coding ollama inference model-serving llama rag embedding vector-search computer-vision natural-language-processing speech-recognition text-to-speech",
"Data Science & Analytics": "data-science data-analysis data-engineering etl elt data-pipeline workflow-orchestration analytics business-intelligence data-visualization observability monitoring metrics logging tracing dashboard notebook jupyter scientific-computing",
"Dev Tools": "developer-tools cli command-line terminal shell git git-client code-editor ide debugger build-tool compiler linter formatter code-review code-search developer-experience devcontainer package-manager monorepo",
"DevOps & Cloud": "devops cloud-native kubernetes docker container container-orchestration infrastructure-as-code terraform ansible continuous-integration continuous-deployment ci-cd deployment platform-engineering service-mesh cloud-management load-balancer networking dns",
"Testing & QA": "testing unit-testing integration-testing end-to-end-testing test-automation browser-automation playwright cypress performance-testing load-testing mock-server contract-testing quality-assurance test-management",
"Design & UI/UX": "design ui-design ux-design prototyping wireframing figma-plugin icon-library illustration graphic-design image-editor vector-graphics color-palette typography font design-assets",
"Video Editing & Motion": "video-editor video-processing video-streaming animation motion-graphics screen-recording live-streaming media-server ffmpeg transcoding subtitle video-player",
"3D & VFX": "3d 3d-modeling 3d-rendering computer-graphics rendering-engine blender gltf cad 3d-printing game-engine shader ray-tracing",
"Audio & Music": "audio audio-processing music-production digital-audio-workstation synthesizer midi sound-design podcast music-player audio-player speech-processing",
"Game Development": "game-development game-engine gamedev game-framework game-server game-tools level-editor voxel godot unreal-engine unity-tools",
"Mobile & Desktop Apps": "android ios flutter react-native desktop-app electron tauri cross-platform macos windows-app linux-desktop mobile-app app-development",
"Operating Systems": "linux linux-distribution operating-system bsd desktop-environment window-manager package-repository",
"Open Source Apps": "open-source self-hosted self-hosted-apps selfhosted foss free-software open-source-alternative productivity-app personal-server home-lab",
"Office & Productivity": "productivity notes note-taking markdown knowledge-base wiki document-management office-suite spreadsheet pdf ebook read-it-later calendar task-management todo-app",
"Collaboration & Communication": "chat messaging matrix federation forum community video-conferencing team-collaboration email mail-server social-network discussion-platform",
"Automation & No-Code": "automation workflow-automation low-code no-code integration-platform rpa webhook workflow-engine scripting task-automation",
"CMS": "cms headless-cms content-management blog-engine static-blog publishing-platform digital-asset-management",
"Analytics": "product-analytics web-analytics privacy-friendly-analytics event-tracking feature-flags experimentation a-b-testing user-research",
"Storage & CDN": "object-storage file-storage cloud-storage distributed-storage backup backup-software sync file-sync cdn content-delivery s3-compatible",
"Education & Learning": "education learning-platform e-learning lms flashcards language-learning digital-library documentation",
"Privacy & Utilities": "privacy-tools data-portability encryption file-converter utilities system-utilities browser-extension firefox-addon chrome-extension web-extension local-first offline-first file-manager clipboard-manager launcher",
"Blockchain & Web3": "blockchain web3 ethereum smart-contracts solidity cryptocurrency distributed-ledger",
"Hardware & IoT": "iot home-automation home-assistant embedded embedded-systems arduino raspberry-pi hardware robotics mqtt firmware",
"Accessibility": "accessibility a11y screen-reader assistive-technology inclusive-design",
"Cybersecurity & Ethical Hacking": "cybersecurity penetration-testing ethical-hacking forensics incident-response threat-intelligence malware-analysis network-security",
"Project & Idea Management": "project-management issue-tracker kanban roadmap planning time-tracking personal-knowledge-management",
"Freelancing & Client Management": "invoicing billing crm customer-relationship-management helpdesk support-platform time-billing",
"Hosting & PaaS": "hosting paas app-platform static-hosting edge-functions cloud-platform web-hosting",
"AI APIs": "ai-api model-api llm-api speech-api vision-api embedding-api",
"Reverse Engineering": "reverse-engineering binary-analysis disassembler decompiler protocol-analysis",
"Data Science & Analytics (Geo/Science)": "geospatial gis mapping geography bioinformatics scientific-visualization",
"Databases & BaaS (Messaging/Search)": "message-broker event-streaming kafka rabbitmq search-platform opensearch elasticsearch",
"Privacy & Utilities (Browser/Network)": "network-monitoring packet-capture vpn wireguard firewall proxy adblock dns-filtering",
"Creator & Social Media": "content-creation social-media video-publishing streaming-platform newsletter podcasting photography",
"Office & Productivity (Dev Docs)": "documentation-generator api-documentation changelog release-notes docs-as-code",
"Open Source Apps (Personal Cloud)": "personal-cloud file-sharing photo-management media-center home-server home-media",
"Operating Systems (Virtualization)": "virtualization hypervisor virtual-machine emulator sandbox",
"Mobile & Desktop Apps (Cross-platform)": "cross-platform-framework desktop-framework appimage flatpak snap package-manager",
"DevOps & Cloud (CI Runners)": "github-actions ci-runner buildkite jenkins gitea-runner continuous-integration",
"AI & Machine Learning (Data)": "model-training model-evaluation mlops dataset-labeling vector-index prompt-engineering",
"AI & Machine Learning (Local)": "local-llm local-ai on-device-ai model-quantization model-inference",
"Data Science & Analytics (Pipelines)": "data-orchestration dbt apache-airflow dagster prefect data-catalog data-quality",
"Design & UI/UX (Web)": "storybook component-library design-tokens ui-components css-in-js",
"Audio & Music (Tools)": "music-player audio-library music-streaming audio-editor podcast-editor soundfont",
"Video Editing & Motion (Tools)": "video-converter video-downloader video-cutter video-capture subtitle-editor",
"Game Development (Engine Tools)": "game-server multiplayer-game networking-game asset-pipeline game-launcher",
"Hardware & IoT (Home)": "smart-home home-automation zigbee zwave matter iot-dashboard",
"Developer Utilities": "api-client http-client graphql-client json-editor yaml-editor regex-tool diff-tool",
"Storage & CDN (Backup)": "deduplication backup-encryption cloud-backup object-store",
"Auth & Security (Policy)": "policy-engine access-control authorization-policy permissions audit-log",
"Project & Idea Management (Planning)": "kanban-board agile project-board issue-management",
"CMS (Publishing)": "headless-blog publishing-system static-cms markdown-cms",
"Analytics (Monitoring)": "uptime-monitor status-page log-management error-tracking",
"Education & Learning (Self-hosted)": "flashcard-app spaced-repetition quiz-platform online-course",
"Privacy & Utilities (Email)": "email-client email-server mail-transfer-agent spam-filter",
"Privacy & Utilities (Files)": "file-manager file-search document-scanner pdf-tools",
"Open Source Apps (Collab)": "collaborative-editor collaborative-whiteboard shared-notes team-wiki",
"Collaboration & Communication (Chat)": "chat-server matrix-client xmpp messaging-app",
"Dev Tools (Terminal)": "terminal-emulator shell-prompt command-line-tool tui terminal-ui",
"Dev Tools (Code Quality)": "static-analysis code-quality code-formatter code-linter",
"Frontend & Web Dev (Framework)": "web-framework frontend-tooling bundler module-bundler",
"Backend & APIs (Database)": "api-server backend-service backend-as-a-service",
"DevOps & Cloud (Deployment)": "deployment-platform app-deployment static-site-deployment",
"Cybersecurity & Ethical Hacking (Privacy)": "security-audit network-scanner vulnerability-management",
"AI & Machine Learning (Automation)": "ai-workflow ai-orchestration ai-assistant",
"Data Science & Analytics (Search)": "vector-search semantic-search full-text-search",
"Mobile & Desktop Apps (Linux)": "linux-app linux-desktop-app wayland x11",
"Operating Systems (Tools)": "system-monitor process-manager disk-usage",
"3D & VFX (Scientific)": "scientific-visualization 3d-visualization rendering",
"Blockchain & Web3 (Tools)": "wallet smart-contract-tool blockchain-explorer",
"Automation & No-Code (Integration)": "integration-tool automation-platform iPaaS",
"Storage & CDN (Data)": "file-server s3 storage-engine",
"Freelancing & Client Management (CRM)": "open-source-crm invoicing-software project-billing",
"Communities & Forums": "forum-software community-platform federated-social",
"Privacy & Utilities (Password)": "credential-manager password-store",
"Accessibility (Tools)": "web-accessibility accessibility-testing",
"Open Source Apps (Home lab)": "homelab selfhosting media-server",
"Developer Tools (SDK)": "sdk code-generation api-generator",
"Testing & QA (Automation)": "test-runner snapshot-testing visual-regression",
"Hosting & PaaS (Serverless)": "serverless-platform cloud-functions edge-runtime",
"AI APIs (Speech)": "speech-to-text voice-synthesis speech-api",
"AI APIs (Vision)": "ocr image-recognition image-generation",
"AI & Machine Learning (Research)": "reinforcement-learning federated-learning",
"Data Science & Analytics (Streaming)": "stream-processing event-processing",
"Data Science & Analytics (Storage)": "data-lake lakehouse parquet",
"Frontend & Web Dev (Accessibility)": "accessibility-widget web-vitals performance-budget",
"Design & UI/UX (Assets)": "design-tool asset-manager icon-pack",
"Video Editing & Motion (Streaming)": "streaming-server media-processing",
"Audio & Music (Streaming)": "audio-streaming music-server",
"Game Development (Tools)": "game-tools game-mod game-modding",
"Hardware & IoT (Network)": "mqtt-broker home-automation-server",
"Open Source Apps (Office)": "open-source-office document-editor",
"Open Source Apps (Finance)": "personal-finance budgeting expense-tracker",
"Open Source Apps (Health)": "health-tracker fitness-tracker",
"Open Source Apps (Reading)": "ebook-reader rss-reader feed-reader",
"Open Source Apps (Search)": "metasearch search-aggregator",
"Open Source Apps (Maps)": "map-server geospatial-server",
"Open Source Apps (Photo)": "photo-gallery photo-library image-hosting",
"Open Source Apps (Media)": "media-server media-center media-library",
"Open Source Apps (Files)": "file-sharing file-browser cloud-drive",
"Open Source Apps (Smart home)": "homeassistant home-automation",
"Open Source Apps (Project)": "project-management software",
"DevOps & Cloud (Infra)": "cloud-native infrastructure automation",
"Dev Tools (Open source)": "developer-experience open-source-tools",
"Backend & APIs (Realtime)": "realtime-api realtime-database event-bus",
"Databases & BaaS (SQL)": "postgresql-extension sql-engine database-server",
"AI & Machine Learning (Agents)": "ai-agent agents-framework tool-calling",
"Automation & No-Code (Workflow)": "workflow automation workflow-engine",
"Privacy & Utilities (Encryption)": "end-to-end-encryption encrypted-storage",
"Operating Systems (Terminal)": "terminal-tools command-line-applications",
"Mobile & Desktop Apps (Notes)": "desktop-notes note-taking-app",
"Education & Learning (Programming)": "programming-education coding-platform",
"Accessibility (Assistive)": "screen-reader braille speech-assistance",
"3D & VFX (Modeling)": "3d-editor mesh-processing",
"Design & UI/UX (Fonts)": "font-manager font-rendering",
"Video Editing & Motion (Effects)": "video-effects compositing",
"Audio & Music (Production)": "audio-plugin vst-plugin",
"Game Development (Assets)": "game-assets game-asset-manager",
"Hardware & IoT (Embedded)": "embedded-linux microcontroller",
"Project & Idea Management (Team)": "team-task-management issue-board",
"CMS (Developer)": "developer-portal internal-developer-portal",
"Analytics (Product)": "product-analytics open-source-analytics",
"Storage & CDN (Media)": "image-optimization image-proxy",
"Auth & Security (Secrets)": "secret-manager vault",
"DevOps & Cloud (Observability)": "tracing opentelemetry telemetry",
"Collaboration & Communication (Email)": "email-client email-server",
"Reverse Engineering (Analysis)": "binary-analysis static-analysis-tool",
"Privacy & Utilities (Sync)": "synchronization file-sync",
"Office & Productivity (Writing)": "writing-app markdown-editor",
"Freelancing & Client Management (Support)": "customer-support helpdesk",
"Creator & Social Media (Publishing)": "newsletter publishing-tool",
"Blockchain & Web3 (Indexing)": "blockchain-indexer web3-tooling",
"AI APIs (Embeddings)": "embedding-api vector-api",
"Data Science & Analytics (Graph)": "graph-visualization graph-database",
"Data Science & Analytics (ETL)": "etl-tool data-integration",
"Databases & BaaS (Admin)": "database-admin database-gui",
"Testing & QA (Security)": "security-testing application-testing",
"Dev Tools (Release)": "release-automation changelog-generator",
"Frontend & Web Dev (Content)": "static-site blog-framework",
"Open Source Apps (Wiki)": "wiki-engine knowledge-management",
"Operating Systems (Package)": "package-manager linux-package-manager",
"Hardware & IoT (Monitoring)": "iot-monitoring device-management",
"Data Science & Analytics (ML)": "machine-learning-platform ml-platform",
"Education & Learning (Docs)": "documentation-system knowledge-base",
"Automation & No-Code (Bots)": "chatbot automation-bot",
"Privacy & Utilities (Browser)": "browser-tool browser-automation",
"Security & Privacy Tools": "privacy-security security-tools",
}
EXCLUDE = re.compile(r"\b(awesome[- ]?list|awesome|tutorial|course|roadmap|cheatsheet|papers|research[- ]?papers|dataset|datasets|examples[- ]?repo|starter[- ]?template|interview[- ]?questions|books[- ]?list|resources[- ]?list)\b", re.I)
GENERIC_HOSTS = {"github.io", "gitlab.io", "vercel.app", "netlify.app", "pages.dev", "readthedocs.io", "cloudfront.net", "azurewebsites.net"}

def norm(value):
    return re.sub(r"[^a-z0-9]+", "", (value or "").lower())

def normalize_url(value):
    if not value:
        return ""
    try:
        p = urlparse(value if "://" in value else "https://" + value)
        host = (p.hostname or "").lower().removeprefix("www.")
        path = re.sub(r"/+$", "", p.path or "").lower()
        if host == "github.com":
            path = re.sub(r"\.git$", "", path)
        return host + path
    except Exception:
        return ""

def host_of(value):
    try:
        return (urlparse(value or "").hostname or "").lower().removeprefix("www.")
    except Exception:
        return ""

def existing_catalog():
    items = json.loads((ROOT / "data" / "tools.json").read_text(encoding="utf-8"))
    names, urls, hosts = set(), set(), set()
    for item in items:
        names.add(norm(item.get("name")))
        names.add(norm(item.get("id")))
        for key in ("githubRepoUrl", "officialWebsiteUrl"):
            url = item.get(key) or ""
            u = normalize_url(url)
            if u:
                urls.add(u)
            h = host_of(url)
            if h and h not in GENERIC_HOSTS and h not in {"google.com"}:
                hosts.add(h)
    return items, names, urls, hosts

def search(session, query, page):
    params = {"q": query, "per_page": 100, "page": page, "sort": "stars", "order": "desc"}
    for attempt in range(7):
        try:
            r = session.get(API, params=params, timeout=45)
        except requests.RequestException as exc:
            print("Transient API error:", str(exc), flush=True)
            time.sleep(min(30, 3 * (attempt + 1)))
            continue
        if r.status_code == 200:
            remaining = int(r.headers.get("X-RateLimit-Remaining", "999"))
            if remaining < 5:
                reset = int(r.headers.get("X-RateLimit-Reset", str(int(time.time()) + 60)))
                time.sleep(max(2, reset - int(time.time()) + 2))
            return r.json().get("items", [])
        if r.status_code in (403, 429):
            after = int(r.headers.get("Retry-After", "0") or "0")
            reset = int(r.headers.get("X-RateLimit-Reset", "0") or "0")
            wait = after or (max(3, reset - int(time.time()) + 2) if reset > time.time() else min(90, 5 * (2 ** attempt)))
            print(f"GitHub rate limit; waiting {wait}s.", flush=True)
            time.sleep(wait)
            continue
        print(f"Search error {r.status_code}: {query}: {r.text[:120]}", flush=True)
        return []
    return []

def license_text(repo):
    info = repo.get("license") or {}
    spdx = (info.get("spdx_id") or "").strip()
    if spdx and spdx != "NOASSERTION":
        return spdx
    label = (info.get("name") or "").strip()
    return label if label and label.lower() != "other" else "Not detected - verify before treating as open source"

def viable(repo):
    if repo.get("archived") or repo.get("disabled") or repo.get("fork"):
        return False
    if int(repo.get("stargazers_count") or 0) < 5:
        return False
    if EXCLUDE.search((repo.get("name") or "") + " " + (repo.get("description") or "")):
        return False
    pushed = (repo.get("pushed_at") or "")[:10]
    if pushed and pushed < "2022-01-01":
        return False
    return True

def score(repo):
    stars = max(0, int(repo.get("stargazers_count") or 0))
    try:
        pushed = datetime.fromisoformat((repo.get("pushed_at") or "").replace("Z", "+00:00"))
        age_days = max(0, (datetime.now(timezone.utc) - pushed).days)
    except Exception:
        age_days = 2400
    recent = max(0, 1200 - age_days) / 120
    return (stars ** 0.45) * 4 + recent

def main():
    catalog, current_names, current_urls, current_hosts = existing_catalog()
    print(f"Baseline: {len(catalog)} tools in current site catalog.", flush=True)
    session = requests.Session()
    session.headers.update(HEADERS)
    queries = []
    seen_topics = set()
    for category, group in TOPICS.items():
        for topic in group.split():
            if topic not in seen_topics:
                seen_topics.add(topic)
                queries.append((category, topic))
    extras = [
        ("Developer & Open-Source Software", "developer-tools in:description"),
        ("Open Source Apps", "self-hosted application in:description"),
        ("Dev Tools", "developer utility in:description"),
        ("AI & Machine Learning", "open source ai in:description"),
        ("Databases & BaaS", "database tool in:description"),
        ("Cybersecurity & Ethical Hacking", "security tool in:description"),
        ("Automation & No-Code", "workflow automation in:description"),
        ("Frontend & Web Dev", "web framework in:description"),
        ("Data Science & Analytics", "data engineering in:description"),
        ("Open Source Apps", "open source alternative in:description"),
    ]
    queries.extend(extras)
    found, source_query, category_map = {}, {}, {}
    total_queries = 0

    def ingest(category, topic, page):
        nonlocal total_queries
        q = topic if " in:description" in topic else "topic:" + topic
        q += " stars:>=5 fork:false archived:false pushed:>=2022-01-01"
        results = search(session, q, page)
        total_queries += 1
        for repo in results:
            full = (repo.get("full_name") or "").lower()
            if full and full not in found:
                found[full] = repo
                source_query[full] = q
                category_map[full] = category
        print(f"Search {total_queries}: {topic} page {page} -> {len(results)} results / {len(found)} unique.", flush=True)
        time.sleep(2.05)

    for category, topic in queries:
        ingest(category, topic, 1)

    def is_new(repo):
        if not viable(repo):
            return False
        full = (repo.get("full_name") or "").lower()
        base = repo.get("name") or ""
        home = normalize_url(repo.get("homepage") or "")
        repo_url = normalize_url(repo.get("html_url") or "")
        if repo_url in current_urls or home in current_urls:
            return False
        if norm(base) in current_names or norm(full.replace("/", "")) in current_names:
            return False
        home_host = host_of(repo.get("homepage") or "")
        if home_host and home_host not in GENERIC_HOSTS and home_host in current_hosts:
            return False
        return True

    new = [r for r in found.values() if is_new(r)]
    # If the first page of each topic is not enough, search additional pages until a cushion above 5,000 is reached.
    if len(new) < 5300:
        print(f"After de-duplication: {len(new)}; searching additional pages.", flush=True)
        for category, topic in queries:
            for page in range(2, 11):
                ingest(category, topic, page)
                new = [r for r in found.values() if is_new(r)]
                if len(new) >= 5300:
                    break
            if len(new) >= 5300:
                break

    new = [r for r in found.values() if is_new(r)]
    if len(new) < 5000:
        raise SystemExit(f"Only {len(new)} new candidates after screening; refusing to claim a 5,000+ result.")

    new.sort(key=score, reverse=True)
    selected = new[:5200]
    for i, repo in enumerate(selected, 1):
        full = (repo.get("full_name") or "").lower()
        repo["research_rank"] = i
        repo["research_category"] = category_map.get(full, "Developer & Open-Source Software")
        repo["research_query"] = source_query.get(full, "")
        repo["github_url"] = repo.get("html_url") or ""
        repo["homepage_url"] = repo.get("homepage") or ""
        repo["primary_language"] = repo.get("language") or "Not specified"
        repo["stars"] = int(repo.get("stargazers_count") or 0)
        repo["open_issues"] = int(repo.get("open_issues_count") or 0)
        repo["license_label"] = license_text(repo)
        repo["topics"] = repo.get("topics") or []
        repo["description"] = (repo.get("description") or "").strip() or "No repository description supplied; inspect README and releases."

    generated = datetime.now(timezone.utc).isoformat(timespec="seconds")
    detected = sum(1 for r in selected if not r["license_label"].startswith("Not detected"))
    counts = Counter(r["research_category"] for r in selected)
    summary = {
        "generated_at_utc": generated,
        "current_site_catalog_count": len(catalog),
        "unique_github_repositories_seen": len(found),
        "search_requests": total_queries,
        "new_candidates_after_catalog_deduplication": len(new),
        "included_candidates": len(selected),
        "rows_with_detected_license": detected,
        "rows_without_detected_license": len(selected) - detected,
        "method": "GitHub repository topic search. Non-fork, non-archived, non-disabled, at least 5 stars, pushed since 2022-01-01, sorted by a stars/recent-activity score. Screened against data/tools.json on main using normalized IDs/names, GitHub repository URLs, declared homepage URLs, and non-generic homepage host names.",
        "caveat": "This is a discovery shortlist, not a security audit or a guarantee of semantic uniqueness. A public repository is not automatically open source. Verify the LICENSE file, readme, project status, official documentation, free-tier pricing, and security before adopting or adding a candidate.",
        "sources": [
            "https://api.github.com/search/repositories",
            "https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-repositories",
            "https://github.com/" + REPO_FULL_NAME + "/blob/main/data/tools.json",
            "https://awesome-free-stack.vercel.app/tools"
        ],
        "category_counts": dict(counts.most_common()),
    }

    json_path = OUT / "5000-tool-candidates.json"
    csv_path = OUT / "5000-tool-candidates.csv"
    pdf_path = OUT / "5000-tool-candidates.pdf"
    json_path.write_text(json.dumps({"summary": summary, "tools": selected}, ensure_ascii=False, indent=2), encoding="utf-8")
    fields = ["research_rank","name","description","research_category","homepage_url","github_url","stars","primary_language","license_label","created_at","updated_at","pushed_at","open_issues","topics","research_query"]
    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for r in selected:
            row = dict(r)
            row["topics"] = ", ".join(r.get("topics") or [])
            writer.writerow(row)
    make_pdf(pdf_path, selected, summary)
    print(json.dumps({
        "included": len(selected), "catalog_baseline": len(catalog), "unique_repositories": len(found),
        "search_requests": total_queries, "with_license_metadata": detected,
        "without_license_metadata": len(selected)-detected, "categories": dict(counts.most_common(12)),
        "pdf": str(pdf_path), "csv": str(csv_path), "json": str(json_path)
    }, indent=2), flush=True)

def make_pdf(path, rows, summary):
    page = landscape(A4)
    styles = getSampleStyleSheet()
    title = ParagraphStyle("title2", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=colors.HexColor("#122238"), spaceAfter=8)
    body = ParagraphStyle("body2", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.5, leading=12, textColor=colors.HexColor("#29394b"), spaceAfter=5)
    small = ParagraphStyle("small2", parent=styles["BodyText"], fontName="Helvetica", fontSize=6.2, leading=7.5, textColor=colors.HexColor("#203040"))
    url = ParagraphStyle("url2", parent=small, textColor=colors.HexColor("#075985"), wordWrap="CJK")
    head = ParagraphStyle("head2", parent=small, fontName="Helvetica-Bold", textColor=colors.white, fontSize=6.3, leading=7)
    doc = SimpleDocTemplate(str(path), pagesize=page, leftMargin=8*mm, rightMargin=8*mm, topMargin=13*mm, bottomMargin=12*mm, title="5,200 New Tool & Open-Source Software Candidates", author="Zero-Cost Dev Stack", subject="GitHub tool discovery research")
    story = [
        Spacer(1, 8*mm),
        Paragraph("5,200 New Tool &amp; Software<br/>Discovery Candidates", title),
        Paragraph("Generated " + html.escape(summary["generated_at_utc"]) + " (UTC)", body),
        Paragraph(f"<b>{len(rows):,} candidate repositories</b> discovered and screened against <b>{summary['current_site_catalog_count']:,} current directory listings</b> from the main-branch data/tools.json. Candidate selection emphasizes public repositories with at least five stars, no fork/archive flag, and recent push activity.", body),
        Paragraph("Fields included", styles["Heading2"]),
        Paragraph("Name, repository description, inferred discovery category, GitHub URL, declared homepage when supplied, stars, primary language, GitHub-reported license metadata, created/updated/pushed dates, open issues, repository topics, and the search topic that surfaced the project.", body),
        Paragraph("Deduplication and accuracy boundaries", styles["Heading2"]),
        Paragraph("The exclusion check uses normalized tool IDs/names, GitHub URLs, homepage URLs and non-generic homepage hosts from the current main-branch catalog. This removes straightforward duplicates; it cannot prove semantic uniqueness. A repo may be a plugin or an adjacent project under a different name, so human review is still required.", body),
        Paragraph("Open-source / safety caution", styles["Heading2"]),
        Paragraph("A public GitHub repository is not automatically open source. The License column reflects GitHub's reported metadata or explicitly notes that none was detected. Verify the LICENSE file, current activity, permissions, supply-chain posture, official docs and any managed-service costs before adopting a candidate. Stars are popularity signals, not security audits.", body),
        Paragraph("Sources and reproducibility", styles["Heading2"]),
        Paragraph('GitHub Search API: <link href="https://api.github.com/search/repositories" color="#075985">api.github.com/search/repositories</link>; API docs: <link href="https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-repositories" color="#075985">Search repositories</link>; baseline catalog: <link href="https://github.com/' + html.escape(REPO_FULL_NAME) + '/blob/main/data/tools.json" color="#075985">data/tools.json on main</link>; live site: <link href="https://awesome-free-stack.vercel.app/tools" color="#075985">tool directory</link>.', body),
        Paragraph("Category counts", styles["Heading2"])
    ]
    cats = list(summary["category_counts"].items())
    count_rows = []
    for i in range(0, len(cats), 4):
        row = []
        for name, count in cats[i:i+4]:
            row.extend([Paragraph(html.escape(name), small), str(count)])
        while len(row) < 8:
            row.extend(["", ""])
        count_rows.append(row)
    cat_table = Table(count_rows, colWidths=[38*mm, 11*mm]*4, hAlign="LEFT")
    cat_table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#f1f5f9")),("GRID",(0,0),(-1,-1),0.25,colors.HexColor("#d5dde6")),("VALIGN",(0,0),(-1,-1),"TOP"),("FONTSIZE",(0,0),(-1,-1),6.2),("LEFTPADDING",(0,0),(-1,-1),3),("RIGHTPADDING",(0,0),(-1,-1),3),("TOPPADDING",(0,0),(-1,-1),2),("BOTTOMPADDING",(0,0),(-1,-1),2)]))
    story.extend([cat_table, Spacer(1, 4*mm), PageBreak(), Paragraph("Full discovery catalogue", title)])

    widths = [7*mm, 53*mm, 27*mm, 33*mm, 27*mm, 13*mm, 17*mm, 24*mm, 43*mm]
    headers = ["#", "Tool / description", "Category", "GitHub repo", "Homepage", "Stars", "Language", "License", "Updated / pushed"]
    data = [[Paragraph(x, head) for x in headers]]
    for i, r in enumerate(rows, 1):
        name = html.escape((r.get("name") or "Unknown")[:100])
        desc = html.escape((r.get("description") or "")[:230])
        full = r.get("full_name") or ""
        gh = r.get("github_url") or ""
        home = r.get("homepage_url") or ""
        gh_label = html.escape(full[:44] or "not provided")
        home_label = html.escape((urlparse(home).netloc + urlparse(home).path)[:52] or "Not declared")
        gh_cell = f'<link href="{html.escape(gh, quote=True)}" color="#075985">{gh_label}</link>' if gh else "Not provided"
        home_cell = f'<link href="{html.escape(home, quote=True)}" color="#075985">{home_label}</link>' if home else "Not declared"
        license_label = html.escape((r.get("license_label") or "Unknown")[:42])
        category = html.escape((r.get("research_category") or "Other")[:60])
        language = html.escape((r.get("primary_language") or "Not specified")[:18])
        stars = f"{int(r.get('stars') or 0):,}"
        updated = (r.get("updated_at") or "")[:10] or "?"
        pushed = (r.get("pushed_at") or "")[:10] or "?"
        data.append([
            Paragraph(str(i), small),
            Paragraph(f"<b>{name}</b><br/>{desc}", small),
            Paragraph(category, small),
            Paragraph(gh_cell, url),
            Paragraph(home_cell, url),
            Paragraph(stars, small),
            Paragraph(language, small),
            Paragraph(license_label, small),
            Paragraph("U " + html.escape(updated) + "<br/>P " + html.escape(pushed), small),
        ])
    table = LongTable(data, colWidths=widths, repeatRows=1, hAlign="LEFT", splitByRow=1)
    table.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),colors.HexColor("#17283d")),
        ("GRID",(0,0),(-1,-1),0.25,colors.HexColor("#d4dde7")),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),2.3),("RIGHTPADDING",(0,0),(-1,-1),2.3),
        ("TOPPADDING",(0,0),(-1,-1),2.3),("BOTTOMPADDING",(0,0),(-1,-1),2.3),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.HexColor("#f5f8fb")]),
        ("LINEBELOW",(0,0),(-1,0),0.9,colors.HexColor("#c6f66f")),
    ]))
    story.append(table)
    def decorate(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#0b1220"))
        canvas.rect(0, page[1]-7*mm, page[0], 7*mm, stroke=0, fill=1)
        canvas.setFont("Helvetica-Bold", 7)
        canvas.setFillColor(colors.HexColor("#d6f58b"))
        canvas.drawString(8*mm, page[1]-4.7*mm, "ZERO-COST DEV STACK / RESEARCH")
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.HexColor("#64748b"))
        canvas.drawString(8*mm, 5*mm, "Discovery candidates - verify license, project status, pricing and security before adoption.")
        canvas.drawRightString(page[0]-8*mm, 5*mm, "Page " + str(doc.page))
        canvas.restoreState()
    doc.build(story, onFirstPage=decorate, onLaterPages=decorate)

if __name__ == "__main__":
    main()
