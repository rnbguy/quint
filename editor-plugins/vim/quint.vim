" Vim syntax file
" Language: Quint
" Maintainer: Igor Konnov, Informal Systems, igor at informal.systems
" Latest Revision: 28 November 2022
"
" How to install:
" 1. Copy this file to ~/.vim/syntax/
" 2a. Either manually set syntax with :set syntax=quint
" 2b. Or add the following in your ~/.vimrc
"    augroup syntax
"    au! BufNewFile,BufReadPost *.qnt
"    au  BufNewFile,BufReadPost *.qnt so ~/vim/syntax/quint.vim
"    augroup END

if exists("b:current_syntax")
  finish
endif

let b:current_syntax = "quint"

" clear the old stuff
syn clear

" comments
syn match quintComment "//.*$"
syn region quintComment start="/\*" end="\*/" fold

" identifiers
syn match quintIdent "[a-zA-Z_][a-zA-Z0-9_]*"

" numbers and strings
syn match quintNumber '-\?\d\+'
syn region quintString start='"' end='"'

" types
syn keyword quintType int str bool set list

" typedefs
syn keyword quintTypedef type

" built-in values
syn keyword quintValue Bool Int Nat
syn keyword quintBoolValue false true

" conditionals
syn keyword quintCond if else match

" declarations
syn keyword quintDecl module import const var def val pure nondet action temporal assume

" standard operators
syn keyword quintStd Set List Map Rec Tup
syn keyword quintStd not and or iff implies
syn keyword quintStd exists guess forall in notin union
syn match   quintStd "contains"   " use match, as 'contains' is a vim option
syn match   quintStd "fold"       " use match, as 'fold' is a vim option
syn keyword quintStd intersect exclude subseteq map applyTo filter
syn keyword quintStd powerset flatten seqs chooseSome
syn keyword quintStd isFinite cardinality get put keys mapBy setOfMaps
syn keyword quintStd set setBy fieldNames with tuples append concat
syn keyword quintStd head tail length nth indices replaceAt slice
syn keyword quintStd select foldl foldr to
syn keyword quintStd always eventually next orKeep mustChange
syn keyword quintStd enabled weakFair strongFair guarantees
syn keyword quintStd existsConst forallConst chooseConst
syn keyword quintStd any all

" curly braces
syn region quintBlock start="{" end="}" fold transparent contains=ALLBUT,quintCurlyError
syn match quintCurlyError     "}"

" parentheses
syn region quintParen start="(" end=")" fold transparent contains=ALLBUT,quintParenError
syn match quintParenError     ")"

" braces
syn region quintBrace start="\[" end="\]" fold transparent contains=ALLBUT,quintBraceError
syn match quintBraceError     "\]"

" operators
syn keyword quintOper "^" "-" "+" "*" "/" "%" "." " "<-" "<" ">" "<=" ">="
syn keyword quintOper "==" "!=" "=>" "->"

" delimiters
syn match quintDelim "," ":" "|" "&"


" highlighting instructions
hi def link quintComment     Comment
hi def link quintIdent       Identifier
hi def link quintType        Type
hi def link quintTypedef     Typedef
hi def link quintString      String
hi def link quintNumber      Number
hi def link quintBoolValue   Boolean
hi def link quintValue       Constant
hi def link quintDecl        StorageClass
hi def link quintStd         Statement
hi def link quintOper        Operator
hi def link quintCond        Conditional
hi def link quintParenError  Error
hi def link quintBraceError  Error
hi def link quintBlockError  Error