---
layout: layouts/base.njk
title: 历史
templateClass: tmpl-post
eleventyNavigation:
  key: 历史
  order: 2
---


<div>


<ul>
   {%- for page in collections.history -%}
    <li>
      <a href="{{ page.url }}">{{ page.data.title }}</a>
    </li>
  {%- endfor -%}

</ul>

 </div>
