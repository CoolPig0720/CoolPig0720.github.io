---
layout: archive
permalink: /posts/tech/
title: "技术教程"
author_profile: true
---

{% include base_path %}
{% for post in site.posts %}
  {% if post.categories contains '技术教程' %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}
