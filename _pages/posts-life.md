---
layout: archive
permalink: /posts/life/
title: "碎碎念"
author_profile: true
---

{% include base_path %}
{% for post in site.posts %}
  {% if post.categories contains '碎碎念' %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}
