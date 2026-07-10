---
layout: post
title: "Understanding Memory Layouts: Stack vs Heap"
date: 2024-02-08 10:30:00 +0000
categories: [systems, programming]
tags: [memory, c, low-level, architecture]
excerpt: "A deep dive into how programs use memory — the stack, the heap, and why getting them confused will ruin your day."
---

## MEMORY MAP INITIALIZED

Every running program lives inside a carefully partitioned block of virtual memory. Understanding this layout is fundamental to writing code that is both correct and efficient.

```
High addresses
┌──────────────────────┐
│      Stack           │  ← grows downward
│         ↓            │
│                      │
│         ↑            │
│      Heap            │  ← grows upward
├──────────────────────┤
│   BSS Segment        │  ← uninitialized globals
├──────────────────────┤
│   Data Segment       │  ← initialized globals
├──────────────────────┤
│   Text Segment       │  ← program code (read-only)
└──────────────────────┘
Low addresses
```

## THE STACK

The **stack** is fast, automatic, and unforgiving. Every function call pushes a *stack frame* onto it; every return pops it off.

```c
void function_b(void) {
    int local = 42;          // lives on the stack frame of function_b
    printf("%d\n", local);
}   // <-- local is destroyed here

void function_a(void) {
    function_b();            // pushes a new frame
}                            // pops back to function_a's frame
```

**Key properties:**
- Allocation and deallocation happen automatically (LIFO)
- Size is limited (typically 8 MB on Linux)
- Extremely fast — just a pointer increment/decrement
- Stack overflow = `SIGSEGV`

## THE HEAP

The **heap** is slow, manual, and flexible. You request memory from the OS at runtime with `malloc`, and you must give it back with `free`.

```c
#include <stdlib.h>
#include <string.h>

char *create_greeting(const char *name) {
    // Allocate memory on the heap
    size_t len = strlen("Hello, ") + strlen(name) + 2;
    char *buf = malloc(len);

    if (buf == NULL) {
        return NULL;  // Allocation failed
    }

    snprintf(buf, len, "Hello, %s!", name);
    return buf;  // Caller must free this
}

int main(void) {
    char *msg = create_greeting("Operator");
    if (msg) {
        printf("%s\n", msg);
        free(msg);  // Avoid memory leak
        msg = NULL; // Avoid dangling pointer
    }
    return 0;
}
```

> **WARNING:** Forgetting to call `free` causes a memory leak. Using memory after `free` is undefined behavior. Both will eventually ruin your day.

## COMPARING THE TWO

| Property     | Stack          | Heap                     |
|--------------|----------------|--------------------------|
| Speed        | Very fast      | Slower (system call)     |
| Size         | Limited (~8MB) | Limited by RAM + swap    |
| Lifetime     | Automatic      | Manual (malloc/free)     |
| Thread-safe  | Per-thread     | Shared (needs sync)      |
| Fragmentation| None           | Possible over time       |

## TOOLS FOR INSPECTION

```bash
# Check memory map of a running process (PID 1234)
$ cat /proc/1234/maps

# Valgrind: detect leaks and invalid accesses
$ valgrind --leak-check=full ./my_program

# Address Sanitizer (ASan): compile-time instrumentation
$ gcc -fsanitize=address -g -o my_program my_program.c
$ ./my_program
```

## CLOSING NOTE

Understanding where your data lives is not just academic. It explains buffer overflows, why `realloc` can invalidate pointers, and why stack-allocated arrays cannot be returned by pointer. The terminal never lies — and neither does the memory map.

```
MEMORY AUDIT COMPLETE
Leaks found: 0
Invalid reads: 0
Status: CLEAN
> _
```
