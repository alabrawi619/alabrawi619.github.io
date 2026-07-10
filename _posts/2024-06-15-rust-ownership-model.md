---
layout: post
title: "Exploring Rust's Ownership Model"
date: 2024-06-15 09:00:00 +0000
categories: [programming, systems]
tags: [rust, memory, ownership, safety]
excerpt: "Rust's borrow checker is famously strict. This post explains why ownership, borrowing, and lifetimes exist — and why they make programs safer by construction."
---

## LOADING RUST TOOLCHAIN…

Rust's ownership system is the language's defining feature. It eliminates entire categories of bugs — use-after-free, double-free, data races — at compile time, with no garbage collector. Here is the mental model.

## THE THREE RULES OF OWNERSHIP

```
1. Every value has exactly one owner.
2. When the owner goes out of scope, the value is dropped (freed).
3. Ownership can be moved or borrowed, never duplicated (by default).
```

```rust
fn main() {
    let s1 = String::from("hello");  // s1 owns the String
    let s2 = s1;                     // ownership MOVES to s2
    // println!("{}", s1);           // compile error: s1 is moved
    println!("{}", s2);              // fine
}   // s2 dropped here; memory freed
```

## BORROWING: REFERENCES WITHOUT OWNERSHIP

Instead of transferring ownership, you can lend a reference:

```rust
fn print_length(s: &String) {   // borrow, don't own
    println!("Length: {}", s.len());
}   // s goes out of scope, but we don't own it — nothing is freed

fn main() {
    let s = String::from("terminal");
    print_length(&s);   // pass a reference
    println!("{}", s);  // still valid — we never moved it
}
```

**Rules for references:**
- At any point, you can have *either* one mutable reference *or* any number of immutable references — never both.
- References must always be valid (no dangling pointers).

## MUTABLE REFERENCES

```rust
fn append_bang(s: &mut String) {
    s.push('!');
}

fn main() {
    let mut s = String::from("SYSTEM ONLINE");
    append_bang(&mut s);
    println!("{}", s);   // SYSTEM ONLINE!
}
```

The exclusive mutable reference rule eliminates data races at compile time — two threads cannot simultaneously hold mutable references to the same data.

## LIFETIMES

Lifetimes are the compiler's way of tracking how long references are valid:

```rust
// The compiler needs to know: how long does the returned reference live?
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("long string");
    let result;
    {
        let s2 = String::from("short");
        result = longest(s1.as_str(), s2.as_str());
        println!("{}", result);  // fine — both live here
    }
    // println!("{}", result);  // compile error: s2 dropped above
}
```

Lifetimes do not change how long data lives — they describe the relationships between reference lifetimes so the borrow checker can verify safety.

## COMMON PATTERNS

```rust
// Clone when you need independent ownership
let s1 = String::from("data");
let s2 = s1.clone();   // deep copy — s1 still valid

// Use slices for efficient sub-string references
let s = String::from("hello world");
let word = &s[0..5];   // &str slice — no allocation

// The Option type replaces null
fn find_user(id: u32) -> Option<String> {
    if id == 1 { Some(String::from("Operator")) } else { None }
}

match find_user(1) {
    Some(name) => println!("User: {}", name),
    None       => println!("Not found"),
}
```

## CLOSING TRANSMISSION

```
$ rustc --edition 2021 ownership.rs

Checking ownership rules... OK
Checking borrow rules...... OK
Checking lifetime rules.... OK
Compiling........................ OK

Binary: ./ownership
Runtime panics: 0
Memory leaks: 0
Data races: 0

> _
```

The borrow checker is not an obstacle — it is a collaborator. Every time it rejects your code, it is telling you about a bug you were about to write. Learning to listen to it is learning to think about memory correctly.
