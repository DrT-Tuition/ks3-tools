#!/usr/bin/env python3
"""Builds the menu pages from tools.json.

    python3 _site_src/build_site.py

Pages made: index.html (choose a key stage), ks3/ks4/ks5.html (choose a subject)
and ks3-biology.html etc. (the tools). Tool pages are not touched.
To add a tool: add a line to tools.json (topic = e.g. "B1.2 Body systems"; tools are grouped
by topic in code order, A–Z within a topic; ks = ks3/ks4/ks5, subject = biology/
chemistry/physics, or "ws" for Working scientifically, which shows on every
KS3 subject page), then run this script.
"""
import json, html, pathlib, re

SRC = pathlib.Path(__file__).resolve().parent
ROOT = SRC.parent
TOOLS = json.loads((SRC / "tools.json").read_text(encoding="utf-8"))
HEAD = (SRC / "head.html").read_text(encoding="utf-8")
FOOT = (SRC / "footer.html").read_text(encoding="utf-8")
BRAND = (SRC / "brandmark.html").read_text(encoding="utf-8")

STAGES = [
    dict(id="ks3", label="KS3", years="Years 7–9", blurb="Models and practicals for Years 7 to 9.",
         subjects=["biology", "chemistry", "physics"]),
    dict(id="ks4", label="KS4", years="GCSE, Years 10–11", blurb="Tools for GCSE science.",
         subjects=["biology", "chemistry", "physics"]),
    dict(id="ks5", label="KS5", years="A-level, Years 12–13", blurb="Tools for A-level science.",
         subjects=["biology"]),
]
SUBJ = {"biology": "Biology", "chemistry": "Chemistry", "physics": "Physics"}

EXTRA_CSS = """
/* menu pages */
.crumbs{font-size:15px;color:var(--muted);margin:0 0 6px}
.crumbs a{color:inherit}
.crumbs span[aria-current]{color:var(--ink);font-weight:700}
.choose{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:20px}
.big{display:grid;align-content:start;gap:8px;padding:22px 22px 20px;background:var(--surface);border:1px solid var(--line);
  border-top:6px solid var(--card,var(--accent));border-radius:12px;box-shadow:var(--shadow);color:inherit;text-decoration:none}
a.big:hover{border-color:var(--card,var(--accent))}
.big .t{font-weight:700;font-size:30px;line-height:1.1;color:var(--accent)}
.big .y{font-weight:700;font-size:16px;color:var(--muted)}
.big .d{font-size:16px}
.big .n{font-size:15px;color:var(--muted)}
.big .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.big .chips a,.big .chips span{font-size:15px;font-weight:700;padding:4px 12px;border-radius:999px;border:1px solid var(--line);
  color:var(--accent);text-decoration:none;background:var(--bg)}
.big .chips a:hover{border-color:var(--accent)}
.big .chips span{color:var(--muted);font-weight:400}
.soon{opacity:.8}
.subjects{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 8px}
a.tool{align-content:start}
h2.topic{font-size:22px;margin:36px 0 14px;padding-bottom:6px;border-bottom:1px solid var(--line)}
.subjects + h2.topic{margin-top:28px}
.subjects a{font-weight:700;font-size:16px;padding:7px 16px;border-radius:999px;border:1px solid var(--line);background:var(--surface);
  color:var(--accent);text-decoration:none}
.subjects a:hover{border-color:var(--accent)}
.subjects a[aria-current=page]{background:var(--accent);color:var(--surface);border-color:var(--accent)}
.empty a{color:var(--accent);font-weight:700}
.empty{padding:22px;background:var(--surface);border:1px dashed var(--line);border-radius:12px;color:var(--muted);margin-top:8px}
:root{--bio:#2E7D4F;--chem:#8A3FA0;--phys:#1F6FB2}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bio:#6CC48E;--chem:#C99BE0;--phys:#7DB5E8}}
:root[data-theme="dark"]{--bio:#6CC48E;--chem:#C99BE0;--phys:#7DB5E8}
.s-biology{--card:var(--bio)} .s-chemistry{--card:var(--chem)} .s-physics{--card:var(--phys)}
a.tool.s-biology,a.tool.s-chemistry,a.tool.s-physics{border-left-color:var(--card)}
"""


def esc(t):
    return html.escape(t, quote=True)


def tools_for(ks, subject):
    main = [t for t in TOOLS if t["ks"] == ks and t["subject"] == subject]
    ws = [t for t in TOOLS if t["ks"] == ks and t["subject"] == "ws"]
    return main, ws


def count(ks, subject):
    return len(tools_for(ks, subject)[0])


def page(fname, title, lead, crumbs, body):
    head = HEAD.replace("<title>KS3 Science Tools</title>", f"<title>{esc(title)}</title>")
    head = head.replace("</style>", "")  # HEAD stops just before </style>
    cr = ""
    if crumbs:
        parts = []
        for i, (lab, href) in enumerate(crumbs):
            if i == len(crumbs) - 1:
                parts.append(f'<span aria-current="page">{esc(lab)}</span>')
            else:
                parts.append(f'<a href="{href}">{esc(lab)}</a>')
        cr = '<nav class="crumbs" aria-label="Breadcrumb">' + " › ".join(parts) + "</nav>"
    brand = BRAND.replace('href="./"', 'href="index.html"').replace("KS3 Science Tools by", "Science Tools by")
    out = (head + EXTRA_CSS + "</style>\n</head>\n<body>\n<div class=\"wrap\">\n"
           f'  <div class="top"><div>{cr}<h1>{esc(title)}</h1><p class="lead">{lead}</p></div>'
           f'<div class="right">{brand}</div></div>\n  <hr class="rule">\n'
           + body + "\n" + FOOT + "\n</div>\n<script src=\"nav.js\"></script>\n</body>\n</html>\n")
    (ROOT / fname).write_text(out, encoding="utf-8")


def card(t, subject):
    cls = f" s-{subject}" if subject in SUBJ else ""
    return (f'    <a class="tool{cls}" href="{t["file"]}">\n      <span class="name">{t["name"]}</span>\n'
            f'      <span class="desc">{t["desc"]}</span>\n    </a>')


# Home: choose a key stage
cards = []
for s in STAGES:
    n = sum(count(s["id"], sub) for sub in s["subjects"])
    chips = "".join(
        f'<a href="{s["id"]}-{sub}.html">{SUBJ[sub]}</a>' if count(s["id"], sub) else f'<span>{SUBJ[sub]}: soon</span>'
        for sub in s["subjects"])
    ntext = (f"{n} tool" if n == 1 else f"{n} tools") if n else "Coming soon"
    cards.append(
        f'    <div class="big{"" if n else " soon"}"><a href="{s["id"]}.html" style="text-decoration:none;color:inherit;display:grid;gap:8px">'
        f'<span class="t">{s["label"]}</span><span class="y">{s["years"]}</span>'
        f'<span class="d">{s["blurb"]}</span><span class="n">{ntext}</span></a>'
        f'<div class="chips">{chips}</div></div>')
page("index.html", "Science Tools",
     "Free interactive science tools for lessons from KS3 to A-level. Open one on the board or share the link. "
     "No log-in, nothing to install.",
     None,
     '  <h2>Choose a key stage</h2>\n  <div class="choose">\n' + "\n".join(cards) + "\n  </div>")

# Key stage pages: choose a subject
for s in STAGES:
    cards = []
    for sub in s["subjects"]:
        n = count(s["id"], sub)
        cards.append(
            f'    <a class="big s-{sub}{"" if n else " soon"}" href="{s["id"]}-{sub}.html">'
            f'<span class="t">{SUBJ[sub]}</span><span class="n">{(f"{n} tool" if n == 1 else f"{n} tools") if n else "Coming soon"}</span></a>')
    page(f'{s["id"]}.html', f'{s["label"]} Science Tools', f'{s["years"]}. Choose a subject.',
         [("Home", "index.html"), (s["label"], f'{s["id"]}.html')],
         '  <div class="choose">\n' + "\n".join(cards) + "\n  </div>")

    # Subject pages
    for sub in s["subjects"]:
        main, ws = tools_for(s["id"], sub)
        pills = '  <nav class="subjects" aria-label="Subject">' + "".join(
            f'<a href="{s["id"]}-{x}.html"{" aria-current=\"page\"" if x == sub else ""}>{SUBJ[x]}</a>'
            for x in s["subjects"]) + "</nav>"
        if main:
            # group by topic (in topic-code order), tools A–Z within each topic
            topics = sorted({t["topic"] for t in main})
            body = "\n\n".join(
                f'  <h2 class="topic">{esc(tp)}</h2>\n  <div class="grid">\n'
                + "\n".join(card(t, sub) for t in sorted((x for x in main if x["topic"] == tp), key=lambda x: x["name"].lower()))
                + "\n  </div>" for tp in topics)
        else:
            body = (f'  <p class="empty">No {s["label"]} {SUBJ[sub].lower()} tools yet. They are on the way. '
                    f'Until then, try the <a href="ks3-{sub}.html">KS3 {SUBJ[sub].lower()} tools</a>.</p>')
        if ws and main:
            body += ("\n\n  <h2 class=\"topic\">Working scientifically</h2>\n  <div class=\"grid\">\n"
                     + "\n".join(card(t, sub) for t in sorted(ws, key=lambda x: x["name"].lower())) + "\n  </div>")
        page(f'{s["id"]}-{sub}.html', f'{s["label"]} {SUBJ[sub]}',
             f'{s["years"]}. Interactive {SUBJ[sub].lower()} tools.',
             [("Home", "index.html"), (s["label"], f'{s["id"]}.html'), (SUBJ[sub], f'{s["id"]}-{sub}.html')],
             pills + "\n\n" + body)

print("built", sorted(p.name for p in ROOT.glob("ks*.html")) + ["index.html"])
