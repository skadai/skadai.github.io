---
layout: layouts/base.njk
title: 音乐
templateClass: tmpl-post
eleventyNavigation:
  key: 音乐
  order: 3
---


<div>


<ul>
   {%- for page in collections.music -%}
    <li>
      <a href="{{ page.url }}">{{ page.data.title }}</a>
    </li>
  {%- endfor -%}

</ul>

 </div>
