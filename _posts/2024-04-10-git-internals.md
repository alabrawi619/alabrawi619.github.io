---
layout: post
title: "Git Internals: What Actually Lives in .git/"
date: 2024-04-10 11:00:00 +0000
categories: [tools, systems]
tags: [git, version-control, internals, deep-dive]
excerpt: "A guided tour of the .git directory — objects, refs, the index, and how a commit is actually just a DAG of hashes."
---

## MOUNTING .git FILESYSTEM…

Most developers use Git every day without ever looking inside `.git/`. That's fine — abstraction is the point. But understanding what's underneath makes you faster at debugging, more confident in rebases, and able to recover from almost anything.

## THE .git DIRECTORY STRUCTURE

```
.git/
├── HEAD              ← pointer to current branch
├── config            ← repository-local git config
├── index             ← the staging area (binary)
├── COMMIT_EDITMSG    ← last commit message
├── objects/          ← all content, hashed
│   ├── pack/         ← packed objects (efficient storage)
│   └── info/
└── refs/
    ├── heads/        ← local branch pointers
    ├── remotes/      ← remote tracking branches
    └── tags/         ← tag pointers
```

## THE OBJECT DATABASE

Git stores everything as **content-addressable objects**. There are four types:

| Type   | Description                              |
|--------|------------------------------------------|
| `blob` | File contents (no name, no path)         |
| `tree` | Directory listing (names + hashes)       |
| `commit` | Snapshot metadata + parent pointer    |
| `tag`  | Annotated tag object                     |

```bash
# Inspect any object by its SHA
$ git cat-file -t a1b2c3d   # type
blob

$ git cat-file -p a1b2c3d   # content
#!/usr/bin/env bash
echo "Hello, World!"
```

## HOW A COMMIT IS STRUCTURED

```bash
$ git cat-file -p HEAD

tree   8f3d9a1b2c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a
parent c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9
author Operator <op@terminal> 1712750400 +0000
committer Operator <op@terminal> 1712750400 +0000

Add shell scripting post
```

A commit is just a pointer to a **tree**, which is a recursive structure of **blobs** and sub-trees. The entire history is a **directed acyclic graph (DAG)** of these objects.

## THE STAGING AREA (INDEX)

The index is a binary file that represents the *next* commit. When you run `git add`, you are writing to the index, not to HEAD.

```bash
# See what's in the index right now
$ git ls-files --stage

100644 a1b2c3d... 0    README.md
100644 b2c3d4e... 0    src/main.c
100644 c3d4e5f... 0    src/utils.c
```

The three-way relationship: **working tree → index → HEAD**. Conflicts happen when all three disagree.

## RECOVERING FROM MISTAKES

Because everything is hashed and content-addressed, almost nothing is truly lost:

```bash
# Find a lost commit (dangling object)
$ git fsck --lost-found

# See the reflog — history of HEAD movements
$ git reflog

HEAD@{0}: commit: Add new post
HEAD@{1}: checkout: moving from main to feature/x
HEAD@{2}: reset: moving to HEAD~1   ← "deleted" commit is here

# Recover the "deleted" commit
$ git checkout -b recovery HEAD@{2}
```

## THE PACK FORMAT

Loose objects get packed for efficiency. A `.pack` file is a binary archive of delta-compressed objects:

```bash
$ ls .git/objects/pack/
pack-a1b2c3d4e5f6.idx   # index for fast lookup
pack-a1b2c3d4e5f6.pack  # the actual data

# Verify pack integrity
$ git verify-pack -v .git/objects/pack/*.idx | head -20
```

## CLOSING TRANSMISSION

```
$ git log --oneline --graph --all

* a1b2c3d (HEAD -> main) Add Git internals post
* b2c3d4e Add shell scripting post
* c3d4e5f Add memory layout post
* d4e5f6a Initial commit: Welcome to the terminal

Commits are immutable. History is a DAG.
Everything is a hash. Trust the object store.

> _
```

Once you understand Git's object model, the scary commands (`rebase`, `reset`, `filter-branch`) lose their mystery. They are just rearrangements of an immutable graph.
