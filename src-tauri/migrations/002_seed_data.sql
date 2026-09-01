-- ============================================================
-- MIGRATION 002 — Seed Default Data
-- Second Brain — DSA & CP Knowledge Base
--
-- Seeds: default platforms, 80+ DSA patterns, and CP tags
-- ============================================================

-- ============================================================
-- DEFAULT PLATFORMS
-- ============================================================

INSERT OR IGNORE INTO platforms (name, type) VALUES ('LeetCode',   'dsa');
INSERT OR IGNORE INTO platforms (name, type) VALUES ('Codeforces', 'cp');
INSERT OR IGNORE INTO platforms (name, type) VALUES ('CodeChef',   'cp');
INSERT OR IGNORE INTO platforms (name, type) VALUES ('AtCoder',    'cp');
INSERT OR IGNORE INTO platforms (name, type) VALUES ('Other',      'both');

-- ============================================================
-- DEFAULT DSA PATTERNS (organized by group)
-- ============================================================

-- Arrays
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Array Traversal',    'Arrays', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Sorting',            'Arrays', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Frequency Counting', 'Arrays', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Prefix Sum',         'Arrays', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Difference Array',   'Arrays', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Kadane''s Algorithm','Arrays', 1);

-- Two Pointers
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Opposite Direction',   'Two Pointers', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Same Direction',       'Two Pointers', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Fast and Slow Pointer','Two Pointers', 1);

-- Sliding Window
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Fixed Window',         'Sliding Window', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Variable Window',       'Sliding Window', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Frequency Map Window',  'Sliding Window', 1);

-- Hashing
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Hash Map',           'Hashing', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Hash Set',           'Hashing', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Frequency Map',      'Hashing', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Complement / Lookup','Hashing', 1);

-- Binary Search
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Standard Binary Search',            'Binary Search', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Lower Bound',                       'Binary Search', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Upper Bound',                       'Binary Search', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Search on Answer',                  'Binary Search', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Binary Search on Monotonic Function','Binary Search', 1);

-- Stack
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Stack',               'Stack', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Monotonic Stack',     'Stack', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Next Greater Element','Stack', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Next Smaller Element','Stack', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Parentheses',         'Stack', 1);

-- Queue
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Queue',          'Queue', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Deque',          'Queue', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Monotonic Queue','Queue', 1);

-- Linked List
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Traversal',          'Linked List', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Reversal',           'Linked List', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Fast and Slow Pointer','Linked List', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Cycle Detection',    'Linked List', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Merge Linked Lists', 'Linked List', 1);

-- Trees
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('DFS',                    'Trees', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('BFS',                    'Trees', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Level Order Traversal',  'Trees', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Binary Search Tree',     'Trees', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Lowest Common Ancestor', 'Trees', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Tree DP',                'Trees', 1);

-- Heap / Priority Queue
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Min Heap',  'Heap / Priority Queue', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Max Heap',  'Heap / Priority Queue', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Top K',     'Heap / Priority Queue', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Two Heaps', 'Heap / Priority Queue', 1);

-- Graphs
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('BFS',                  'Graphs', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('DFS',                  'Graphs', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Topological Sort',     'Graphs', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Union Find / DSU',     'Graphs', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Dijkstra',             'Graphs', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Bellman-Ford',         'Graphs', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Floyd-Warshall',       'Graphs', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Minimum Spanning Tree','Graphs', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Bridges',              'Graphs', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Articulation Points',  'Graphs', 1);

-- Greedy
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Greedy',            'Greedy', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Interval Greedy',   'Greedy', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Sorting + Greedy',  'Greedy', 1);

-- Backtracking
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Permutations',      'Backtracking', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Combinations',      'Backtracking', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Subsets',            'Backtracking', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Constraint Search', 'Backtracking', 1);

-- Dynamic Programming
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('1D DP',            'Dynamic Programming', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('2D DP',            'Dynamic Programming', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Knapsack',         'Dynamic Programming', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('0/1 Knapsack',     'Dynamic Programming', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Unbounded Knapsack','Dynamic Programming', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Subsequence DP',   'Dynamic Programming', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Grid DP',          'Dynamic Programming', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Interval DP',      'Dynamic Programming', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Tree DP',          'Dynamic Programming', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Bitmask DP',       'Dynamic Programming', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('State Machine DP', 'Dynamic Programming', 1);

-- Bit Manipulation
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Bitwise Operations','Bit Manipulation', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('XOR',              'Bit Manipulation', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Bitmask',          'Bit Manipulation', 1);

-- Trie
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Trie',          'Trie', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Prefix Search', 'Trie', 1);

-- Range Query
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Segment Tree',       'Range Query', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Fenwick Tree / BIT', 'Range Query', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Sparse Table',       'Range Query', 1);

-- Mathematics
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Number Theory',       'Mathematics', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Prime Numbers',       'Mathematics', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('GCD / LCM',           'Mathematics', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Modular Arithmetic',  'Mathematics', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Combinatorics',       'Mathematics', 1);
INSERT OR IGNORE INTO patterns (name, group_name, is_default) VALUES ('Geometry',            'Mathematics', 1);

-- ============================================================
-- DEFAULT CP TAGS
-- ============================================================

INSERT OR IGNORE INTO tags (name, type) VALUES ('Implementation',    'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Math',              'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Greedy',            'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('DP',                'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Graph',             'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Binary Search',     'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Number Theory',     'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Constructive',      'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Strings',           'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Combinatorics',     'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Data Structures',   'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Brute Force',       'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Bit Manipulation',  'cp');
INSERT OR IGNORE INTO tags (name, type) VALUES ('Geometry',          'cp');
