Analyzr
=======

[www.Analyzr.info](http://analyzr.info)
----------------------------

Whether it's a political article, tech review, or blog post, Analyzr graphs connotative information about the key subjects it finds in your text.

Features
--------

Analyzr uses [AlchemyAPI](http://www.alchemyapi.com/) to extract the sentiment towards the most relevant topics in the text.  These topics can be anything from people, to companies, to cities.  This data is then graphed using the [D3 library](http://d3js.org/).  Hovering over elements in the graph displays more information about each entity.

Data is also presented in a table below the graph.  Analyzr allows filtering by entry type, which dynamically updates the graph and table with the new data.  

Data extracted from articles includes: sentiment, relevance to article, number of occurrences, and external links to learn more about the subject.  Each submitted article is stored in a database which results in quicker retrieval and less computation.

Authors
-------

* Aashish Sinha
* Brian Bergeron -- [github.com/bergeron](http://github.com/bergeron) -- [bergeron.im](http://bergeron.im)
