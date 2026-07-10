---
layout: page
title: "ABOUT.SYS — System Information"
permalink: /about/
---

```
FILE: about.sys
TYPE: ASCII TEXT
SIZE: READ-ONLY
LAST MODIFIED: {{ site.time | date: "%Y-%m-%d" }}
```

## SYSOP PROFILE

Welcome to **{{ site.title }}** — a personal terminal broadcasting from the digital ether.

This system is operated by **{{ site.author.name }}**, a developer and tinkerer living at the intersection of old iron and new ideas.

## MISSION PARAMETERS

```
OBJECTIVE : Share technical notes, experiments, and ideas.
FORMAT    : Plain text, code, and the occasional rant.
FREQUENCY : Irregular. Blame the filesystem.
SIGNAL    : 100% phosphor green. No cookies. No tracking.
```

## TECH STACK

| COMPONENT   | VERSION         |
|-------------|-----------------|
| Platform    | Jekyll 4.x      |
| Highlighter | Rouge           |
| Host        | GitHub Pages    |
| Theme       | Cyber Dark Terminal |
| Feed        | RSS (feed.xml)  |

## CONTACT

{% if site.author.github %}
- **GitHub**: [github.com/{{ site.author.github }}](https://github.com/{{ site.author.github }})
{% endif %}
{% if site.author.email %}
- **Email**: {{ site.author.email }}
{% endif %}

---

_"Any sufficiently advanced technology is indistinguishable from magic."_
— Arthur C. Clarke
