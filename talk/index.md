---
layout: layouts/base.njk
title: 闲聊
templateClass: tmpl-post
eleventyNavigation:
  key: 闲聊
  order: 2
---


<div>


<ul>
   {%- for page in collections.talk -%}
    <li>
      <a href="{{ page.url }}">{{ page.data.title }}</a>
    </li>
  {%- endfor -%}

</ul>

 </div>
