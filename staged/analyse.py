#!/usr/bin/env python3
import sys
from homer.analyzer import Article
from homer.cmdline_printer import ArticlePrinter

article = Article('Post', 'pars', open(sys.argv[1]).read())
pa = ArticlePrinter(article)
pa.print_article_stats()
pa.print_paragraph_stats()
