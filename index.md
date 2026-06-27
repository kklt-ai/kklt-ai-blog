---
title: "AI工具教程与ChatGPT/Codex实战博客"
description: "卡卡罗特AI持续分享ChatGPT、OpenAI Codex、Claude、AI编程和自动化工作流实战教程。"
---

# 卡卡罗特AI

专注 AI 工具教程、ChatGPT 使用技巧、OpenAI Codex 实战、Claude、AI 编程与自动化工作流。

这里整理真实使用中踩过的坑和验证过的方法，帮助普通用户更快把 AI 工具用到学习、工作和创作里。

## 最新文章

{% for post in site.posts %}
### [{{ post.title }}]({{ post.url | relative_url }})

{{ post.description }}

关键词：{% for tag in post.tags %}`{{ tag }}`{% unless forloop.last %}、{% endunless %}{% endfor %}

{% endfor %}

## 内容方向

- AI 工具教程：ChatGPT、Codex、Claude 等工具的上手与实战
- AI 编程实践：提示词、代码生成、调试、自动化开发流程
- 效率工作流：办公自动化、内容创作、资料整理与个人效率
- 账号与配置：注册、登录、验证、订阅、环境配置等常见问题

## 关注公众号

微信公众号：**卡卡罗特AI**

![卡卡罗特AI微信公众号二维码]({{ '/Codex、ChatGPT短信验证码如何验证？/imgs/kklt-wechat.jpg' | relative_url }}){: width="320" }
