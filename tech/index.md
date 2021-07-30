---
layout: layouts/base.njk
title: 技术
templateClass: tmpl-post
eleventyNavigation:
  key: 技术
  order: 1
---



<div>


<ul>
   {%- for page in collections.tech -%}
    <li>
      <a href="{{ page.url }}">{{ page.data.title }}</a>
    </li>
  {%- endfor -%}

</ul>

 </div>
